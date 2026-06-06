"use client";

import React from 'react';
import Link from 'next/link';
import {
  Package, Pause, Play, BarChart3, Trash2, Copy, Sparkles, Clock, TrendingUp, StopCircle,
} from 'lucide-react';
import { getApiBaseUrl } from '@/lib/api';
import { formatPKR } from '@/lib/financeUtils';
import { CAMPAIGN_STATUSES, CAMPAIGN_TYPES } from '@/lib/advertisingConfig';
import { formatAdDate, formatDaysRemaining } from '@/lib/adDateUtils';
import CampaignActionButton from '@/components/advertising/CampaignActionButton';

const STATUS_STYLES = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-100',
  paused: 'bg-orange-50 text-orange-700 border-orange-200 ring-orange-100',
  pending_payment: 'bg-amber-50 text-amber-800 border-amber-200 ring-amber-100',
  pending_approval: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-100',
  rejected: 'bg-red-50 text-red-700 border-red-200 ring-red-100',
  expired: 'bg-slate-100 text-slate-600 border-slate-200 ring-slate-100',
  completed: 'bg-slate-100 text-slate-600 border-slate-200 ring-slate-100',
  draft: 'bg-slate-50 text-slate-600 border-slate-200 ring-slate-100',
};

function getImageUrl(product) {
  const raw = product?.images?.[0] || product?.image;
  if (!raw) return null;
  if (raw.startsWith('http')) return raw;
  return `${getApiBaseUrl()}${raw}`;
}

function getCampaignTypeLabel(type) {
  return CAMPAIGN_TYPES.find((t) => t.value === type)?.label || type?.replace(/_/g, ' ') || 'Sponsored';
}

function MetricPill({ label, value }) {
  return (
    <div className="px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] min-w-[88px]">
      <p className="text-[9px] font-black uppercase tracking-wider text-[#94A3B8]">{label}</p>
      <p className="text-sm font-black text-[#0F172A] mt-0.5 tabular-nums">{value}</p>
    </div>
  );
}

export default function PremiumCampaignCard({ campaign, actionId, onAction, showManufacturer = true }) {
  const product = campaign.productId;
  const manufacturer = campaign.manufacturerId;
  const imageUrl = getImageUrl(product);
  const statusMeta = CAMPAIGN_STATUSES[campaign.status] || { label: campaign.status };
  const statusClass = STATUS_STYLES[campaign.status] || STATUS_STYLES.draft;
  const revenue = campaign.amountPaid || campaign.budget || 0;
  const isBusy = actionId === campaign._id;
  const daysLabel = formatDaysRemaining(campaign.endDate, campaign.status);
  const campaignId = `#${String(campaign._id).slice(-8).toUpperCase()}`;

  return (
    <article className="rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_4px_24px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_32px_rgba(15,23,42,0.08)] transition-all overflow-hidden">
      <div className="p-4 sm:p-5 lg:p-6">
        <div className="flex flex-col xl:flex-row gap-5 xl:gap-6">
          {/* LEFT — Product identity */}
          <div className="flex gap-4 flex-1 min-w-0 xl:max-w-[34%]">
            <div className="w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] overflow-hidden shrink-0 flex items-center justify-center">
              {imageUrl ? (
                <img src={imageUrl} alt="" className="w-full h-full object-contain p-1.5 mix-blend-multiply" />
              ) : (
                <div className="flex flex-col items-center justify-center text-[#00A878]">
                  <div className="w-9 h-9 rounded-lg bg-[#0F172A] flex items-center justify-center font-black text-white text-sm">G</div>
                  <span className="text-[8px] font-bold uppercase mt-1 text-[#64748B]">GearUp</span>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-[#00A878] mb-1">{campaignId}</p>
              <h3 className="font-bold text-[#0F172A] text-base leading-snug line-clamp-2">{product?.name || 'Product'}</h3>
              {showManufacturer && (
                <p className="text-xs text-[#64748B] mt-1 truncate">{manufacturer?.name || 'Your business'}</p>
              )}
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="px-2 py-0.5 rounded-lg bg-[#0F172A] text-white text-[9px] font-bold uppercase tracking-wide">
                  {getCampaignTypeLabel(campaign.campaignType)}
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-[#E8FFF5] text-[#007A55] border border-[#00A878]/20 text-[9px] font-bold uppercase tracking-wide capitalize">
                  {campaign.plan} Package
                </span>
              </div>
            </div>
          </div>

          {/* CENTER — Status & duration */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 xl:border-x xl:border-[#E5E7EB] xl:px-6">
            <div className="space-y-3">
              <div>
                <p className="text-[9px] font-black uppercase tracking-wider text-[#94A3B8] mb-1.5">Status</p>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black uppercase border ring-1 ${statusClass}`}>
                  {campaign.status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                  {statusMeta.label}
                </span>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-wider text-[#94A3B8] mb-1.5">Campaign Duration</p>
                <div className="space-y-1 text-sm">
                  <p className="text-[#64748B]"><span className="font-semibold text-[#0F172A]">Start:</span> {formatAdDate(campaign.startDate)}</p>
                  <p className="text-[#64748B]"><span className="font-semibold text-[#0F172A]">End:</span> {formatAdDate(campaign.endDate)}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-between gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#0F172A] to-[#1e293b] text-white">
                <div className="flex items-center gap-2 text-white/70 text-[9px] font-black uppercase tracking-wider">
                  <Clock size={12} /> Time Remaining
                </div>
                <p className="text-lg font-black mt-1">{daysLabel}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <MetricPill label="Impressions" value={(campaign.impressions || 0).toLocaleString()} />
                <MetricPill label="Clicks" value={(campaign.clicks || 0).toLocaleString()} />
                <MetricPill label="CTR" value={`${campaign.ctr || 0}%`} />
                <MetricPill label="Views" value={(campaign.views || 0).toLocaleString()} />
              </div>
            </div>
          </div>

          {/* RIGHT — Revenue */}
          <div className="xl:w-[180px] shrink-0 flex xl:flex-col items-center xl:items-end justify-between gap-3">
            <div className="text-left xl:text-right">
              <p className="text-[9px] font-black uppercase tracking-wider text-[#94A3B8] flex items-center xl:justify-end gap-1">
                <TrendingUp size={12} className="text-[#00A878]" /> Campaign Revenue
              </p>
              <p className="text-2xl sm:text-3xl font-black text-[#0F172A] mt-1 tabular-nums">{formatPKR(revenue)}</p>
              {(campaign.revenueGenerated || 0) > 0 && (
                <p className="text-xs text-[#00A878] font-bold mt-1">+{formatPKR(campaign.revenueGenerated)} generated</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions row */}
        <div className="mt-5 pt-4 border-t border-[#F1F5F9] flex flex-wrap gap-2">
          <CampaignActionButton
            href={`/manufacturer/advertising/analytics?id=${campaign._id}`}
            label="View"
            icon={BarChart3}
            variant="primary"
            title="View campaign analytics and performance"
          />
          {campaign.status === 'active' && (
            <CampaignActionButton
              onClick={() => onAction(campaign._id, 'pause')}
              disabled={isBusy}
              label="Pause"
              icon={Pause}
              variant="warning"
              title="Pause Campaign"
            />
          )}
          {campaign.status === 'paused' && (
            <CampaignActionButton
              onClick={() => onAction(campaign._id, 'resume')}
              disabled={isBusy}
              label="Resume"
              icon={Play}
              variant="default"
              title="Resume Campaign"
            />
          )}
          {['draft', 'pending_payment', 'pending_approval', 'paused'].includes(campaign.status) && (
            <CampaignActionButton
              onClick={() => {
                if (window.confirm('End this campaign? It cannot be reactivated after ending.')) {
                  onAction(campaign._id, 'cancel');
                }
              }}
              disabled={isBusy}
              label="End Campaign"
              icon={StopCircle}
              variant="navy"
              title="End Campaign"
            />
          )}
          <CampaignActionButton
            onClick={() => onAction(campaign._id, 'duplicate')}
            disabled={isBusy}
            label="Duplicate"
            icon={Copy}
            title="Duplicate Campaign"
          />
          {['draft', 'pending_payment', 'pending_approval', 'paused'].includes(campaign.status) && (
            <CampaignActionButton
              onClick={() => {
                if (window.confirm('Delete this campaign permanently?')) {
                  onAction(campaign._id, 'delete');
                }
              }}
              disabled={isBusy}
              label="Delete"
              icon={Trash2}
              variant="danger"
              title="Delete Campaign"
            />
          )}
        </div>
      </div>
    </article>
  );
}

export function CampaignFiltersBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  planFilter,
  onPlanChange,
  sortBy,
  onSortChange,
  dateFilter,
  onDateChange,
}) {
  const inputClass = 'h-11 px-3.5 bg-white border border-[#E5E7EB] rounded-xl text-sm font-semibold text-[#0F172A] outline-none focus:border-[#00A878] focus:ring-4 focus:ring-[#00A878]/10 transition-all';

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFBFC] p-4 sm:p-5 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
        <div className="lg:col-span-4">
          <label className="text-[9px] font-black uppercase tracking-wider text-[#94A3B8] block mb-1.5">Search Campaigns</label>
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Product, ID, or type..."
            className={`${inputClass} w-full`}
          />
        </div>
        <div className="lg:col-span-2">
          <label className="text-[9px] font-black uppercase tracking-wider text-[#94A3B8] block mb-1.5">Status</label>
          <select value={statusFilter} onChange={(e) => onStatusChange(e.target.value)} className={`${inputClass} w-full`}>
            <option value="all">All statuses</option>
            {Object.entries(CAMPAIGN_STATUSES).map(([key, meta]) => (
              <option key={key} value={key}>{meta.label}</option>
            ))}
          </select>
        </div>
        <div className="lg:col-span-2">
          <label className="text-[9px] font-black uppercase tracking-wider text-[#94A3B8] block mb-1.5">Package</label>
          <select value={planFilter} onChange={(e) => onPlanChange(e.target.value)} className={`${inputClass} w-full`}>
            <option value="all">All packages</option>
            <option value="starter">Starter</option>
            <option value="growth">Growth</option>
            <option value="premium">Premium</option>
          </select>
        </div>
        <div className="lg:col-span-2">
          <label className="text-[9px] font-black uppercase tracking-wider text-[#94A3B8] block mb-1.5">Date</label>
          <select value={dateFilter} onChange={(e) => onDateChange(e.target.value)} className={`${inputClass} w-full`}>
            <option value="all">Any time</option>
            <option value="active_now">Currently running</option>
            <option value="ending_soon">Ending in 7 days</option>
            <option value="upcoming">Upcoming</option>
          </select>
        </div>
        <div className="lg:col-span-2">
          <label className="text-[9px] font-black uppercase tracking-wider text-[#94A3B8] block mb-1.5">Sort</label>
          <select value={sortBy} onChange={(e) => onSortChange(e.target.value)} className={`${inputClass} w-full`}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="revenue_high">Revenue: high to low</option>
            <option value="impressions">Most impressions</option>
            <option value="ending_soon">Ending soon</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export function CampaignEmptyState() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-[#E5E7EB] bg-gradient-to-b from-white to-[#F8FAFC] p-10 sm:p-14 text-center">
      <div className="w-20 h-20 mx-auto rounded-2xl bg-[#0F172A] flex items-center justify-center shadow-lg mb-5">
        <Sparkles size={36} className="text-[#00A878]" />
      </div>
      <h3 className="text-xl font-black text-[#0F172A]">No campaigns found</h3>
      <p className="text-sm text-[#64748B] mt-2 max-w-md mx-auto leading-relaxed">
        Launch your first sponsored product campaign to reach wholesalers across the GearUp marketplace.
      </p>
      <Link
        href="/manufacturer/advertising/create"
        className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-[#00A878] hover:bg-[#009E66] text-white font-bold rounded-xl shadow-[0_8px_24px_rgba(0,168,120,0.25)] transition-all"
      >
        <Package size={18} /> Create Advertisement
      </Link>
    </div>
  );
}
