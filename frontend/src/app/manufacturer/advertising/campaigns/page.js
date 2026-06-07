"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Megaphone, Eye, MousePointerClick, Sparkles, Loader2 } from 'lucide-react';
import PageShell from '@/components/dashboard/PageShell';
import PageHeader from '@/components/dashboard/PageHeader';
import { formatPKR } from '@/lib/financeUtils';
import { getDaysRemaining } from '@/lib/adDateUtils';
import {
  fetchMyCampaigns,
  pauseCampaign,
  resumeCampaign,
  cancelCampaign,
  duplicateCampaign,
  deleteCampaign,
} from '@/lib/advertisingApi';
import PremiumCampaignCard, {
  CampaignFiltersBar,
  CampaignEmptyState,
} from '@/components/advertising/PremiumCampaignCard';

export default function ActiveCampaignsPage() {
  const searchParams = useSearchParams();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchMyCampaigns();
      setCampaigns(res.data || []);
    } catch {
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const runAction = async (id, action) => {
    try {
      setActionId(id);
      if (action === 'pause') await pauseCampaign(id);
      if (action === 'resume') await resumeCampaign(id);
      if (action === 'cancel') await cancelCampaign(id);
      if (action === 'duplicate') await duplicateCampaign(id);
      if (action === 'delete') await deleteCampaign(id);
      await load();
    } catch (e) {
      alert(e.message);
    } finally {
      setActionId(null);
    }
  };

  const filteredCampaigns = useMemo(() => {
    let list = [...campaigns];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => {
        const product = c.productId?.name?.toLowerCase() || '';
        const id = String(c._id).toLowerCase();
        const type = String(c.campaignType || '').toLowerCase();
        return product.includes(q) || id.includes(q) || type.includes(q);
      });
    }

    if (statusFilter !== 'all') {
      list = list.filter((c) => c.status === statusFilter);
    }

    if (planFilter !== 'all') {
      list = list.filter((c) => c.plan === planFilter);
    }

    if (dateFilter === 'active_now') {
      list = list.filter((c) => c.status === 'active');
    } else if (dateFilter === 'ending_soon') {
      list = list.filter((c) => {
        const days = getDaysRemaining(c.endDate);
        return days != null && days >= 0 && days <= 7;
      });
    } else if (dateFilter === 'upcoming') {
      list = list.filter((c) => ['pending_approval', 'pending_payment', 'draft'].includes(c.status));
    }

    list.sort((a, b) => {
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'revenue_high') return (b.amountPaid || 0) - (a.amountPaid || 0);
      if (sortBy === 'impressions') return (b.impressions || 0) - (a.impressions || 0);
      if (sortBy === 'ending_soon') {
        const da = getDaysRemaining(a.endDate) ?? 9999;
        const db = getDaysRemaining(b.endDate) ?? 9999;
        return da - db;
      }
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    return list;
  }, [campaigns, search, statusFilter, planFilter, dateFilter, sortBy]);

  const stats = useMemo(() => ({
    active: campaigns.filter((c) => c.status === 'active').length,
    pending: campaigns.filter((c) => ['pending_payment', 'pending_approval'].includes(c.status)).length,
    spend: campaigns.reduce((s, c) => s + (c.amountPaid || 0), 0),
  }), [campaigns]);

  const hasFilters = search || statusFilter !== 'all' || planFilter !== 'all' || dateFilter !== 'all';

  return (
    <PageShell>
      <PageHeader
        title="Active Campaigns"
        subtitle="Manage, pause, and monitor your sponsored product campaigns"
        actions={
          <Link href="/manufacturer/advertising/create" className="px-4 py-2.5 bg-[#00A878] text-white text-sm font-bold rounded-xl hover:bg-[#009E66] shadow-sm">
            + New Campaign
          </Link>
        }
      />

      {searchParams.get('created') === '1' && (
        <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm font-semibold flex items-center gap-2">
          <Sparkles size={16} /> Campaign submitted! Payment received — awaiting admin approval.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Active Campaigns', value: stats.active, icon: Sparkles, accent: 'text-[#00A878] bg-[#E8FFF5]' },
          { label: 'Pending Review', value: stats.pending, icon: Eye, accent: 'text-blue-600 bg-blue-50' },
          { label: 'Total Investment', value: formatPKR(stats.spend), icon: MousePointerClick, accent: 'text-[#0F172A] bg-slate-100' },
        ].map(({ label, value, icon: Icon, accent }) => (
          <div key={label} className="dashboard-card p-4 sm:p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-[#64748B]">{label}</p>
              <p className="text-xl font-black text-[#0F172A] mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4 mb-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-black uppercase tracking-wider text-[#0F172A] flex items-center gap-2">
            <Megaphone size={16} className="text-[#00A878]" /> Campaign Management
          </h2>
          <span className="text-xs font-bold text-[#64748B]">
            {filteredCampaigns.length} of {campaigns.length} campaigns
          </span>
        </div>
        <CampaignFiltersBar
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          planFilter={planFilter}
          onPlanChange={setPlanFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          dateFilter={dateFilter}
          onDateChange={setDateFilter}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#64748B]">
          <Loader2 size={32} className="animate-spin text-[#00A878] mb-3" />
          <p className="text-sm font-bold">Loading campaigns…</p>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        hasFilters && campaigns.length > 0 ? (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-10 text-center">
            <p className="text-sm font-bold text-[#64748B]">No campaigns match your filters.</p>
            <button
              type="button"
              onClick={() => { setSearch(''); setStatusFilter('all'); setPlanFilter('all'); setDateFilter('all'); }}
              className="mt-3 text-sm font-bold text-[#00A878] hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <CampaignEmptyState />
        )
      ) : (
        <div className="space-y-4">
          {filteredCampaigns.map((campaign) => (
            <PremiumCampaignCard
              key={campaign._id}
              campaign={campaign}
              actionId={actionId}
              onAction={runAction}
              showManufacturer={false}
            />
          ))}
        </div>
      )}
    </PageShell>
  );
}
