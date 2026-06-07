"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Megaphone, ChevronRight, Wallet, Sparkles, Tag } from 'lucide-react';
import PageShell from '@/components/dashboard/PageShell';
import PageHeader from '@/components/dashboard/PageHeader';
import Card from '@/components/common/Card';
import { getApiBaseUrl } from '@/lib/api';
import { formatPKR } from '@/lib/financeUtils';
import { CAMPAIGN_TYPES } from '@/lib/advertisingConfig';
import {
  computeCampaignEndDate,
  formatAdDate,
  formatAdDateRange,
  getPlanDurationDays,
  getTodayDateInput,
} from '@/lib/adDateUtils';
import { createCampaign, fetchAdPlans, payCampaign } from '@/lib/advertisingApi';

export default function CreateAdvertisementPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [plans, setPlans] = useState([]);
  const [walletBalance, setWalletBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    productId: '',
    campaignType: 'sponsored_product',
    plan: 'starter',
    dailyBudget: '',
    startDate: getTodayDateInput(),
    customMedia: '',
  });

  const [uploadingMedia, setUploadingMedia] = useState(false);

  const todayInput = getTodayDateInput();

  const loadData = useCallback(async (productCategory = null) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const base = getApiBaseUrl();
      const [productsRes, plansRes, walletRes] = await Promise.all([
        fetch(`${base}/api/products?scope=inventory`, { headers }),
        fetchAdPlans(productCategory),
        fetch(`${base}/api/wallet/me`, { headers }),
      ]);
      const productsData = await productsRes.json();
      if (productsData.success) setProducts(productsData.data || []);
      setPlans(plansRes.data || []);
      const walletData = await walletRes.json();
      if (walletData.success) setWalletBalance(walletData.data?.balance ?? 0);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const selectedProduct = useMemo(
    () => products.find((p) => p._id === form.productId),
    [products, form.productId]
  );

  useEffect(() => {
    if (selectedProduct?.category) {
      fetchAdPlans(selectedProduct.category)
        .then((res) => setPlans(res.data || []))
        .catch(() => {});
    }
  }, [selectedProduct?.category, form.productId]);

  const selectedPlan = useMemo(
    () => plans.find((p) => p.slug === form.plan),
    [plans, form.plan]
  );

  const displayPrice = selectedPlan?.finalPrice ?? selectedPlan?.price;
  const originalPrice = selectedPlan?.originalPrice ?? selectedPlan?.price;
  const hasDiscount = (selectedPlan?.discountPercent || 0) > 0;

  const endDate = useMemo(
    () => computeCampaignEndDate(form.startDate, selectedPlan || form.plan),
    [selectedPlan, form.plan, form.startDate]
  );

  const planDurationDays = getPlanDurationDays(selectedPlan || form.plan);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.productId) {
      setError('Please select a product');
      return;
    }
    if (!endDate) {
      setError('Please select a valid start date and plan');
      return;
    }
    try {
      setSubmitting(true);
      const created = await createCampaign({
        productId: form.productId,
        campaignType: form.campaignType,
        plan: form.plan,
        dailyBudget: form.dailyBudget ? Number(form.dailyBudget) : null,
        startDate: form.startDate,
        endDate,
        submitForPayment: true,
        customMedia: form.customMedia || null,
      });
      const campaignId = created.data?._id;
      await payCampaign(campaignId, 'platform_wallet');
      router.push('/manufacturer/advertising/campaigns?created=1');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell>
      <PageHeader
        title="Create Advertisement"
        subtitle="Promote your product to wholesalers across the GearUp marketplace"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Campaign Setup" subtitle="Select product, plan, and schedule">
            {loading ? (
              <p className="text-sm text-[#64748B]">Loading…</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">{error}</div>
                )}

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] block mb-2">Product</label>
                  <select
                    value={form.productId}
                    onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}
                    className="w-full h-11 px-4 border border-[#E5E7EB] rounded-xl text-sm font-semibold"
                    required
                  >
                    <option value="">Select your product</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>{p.name} — {p.category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] block mb-2">Campaign Type</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {CAMPAIGN_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, campaignType: type.value }))}
                        className={`p-3 rounded-xl border text-left text-sm font-bold transition-all ${
                          form.campaignType === type.value
                            ? 'border-[#00A878] bg-[#E8FFF5] text-[#0F172A]'
                            : 'border-[#E5E7EB] text-[#64748B] hover:border-[#CBD5E1]'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {form.campaignType === 'homepage_featured' && (
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] block mb-2">
                      Custom Homepage Media (Optional)
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif,video/mp4,video/webm"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          setUploadingMedia(true);
                          try {
                            const formData = new FormData();
                            formData.append('file', file);
                            const token = localStorage.getItem('token');
                            const res = await fetch(`${getApiBaseUrl()}/api/upload?type=gearup`, {
                              method: 'POST',
                              headers: { Authorization: `Bearer ${token}` },
                              body: formData
                            });
                            const data = await res.json();
                            if (data.success) {
                              setForm(f => ({ ...f, customMedia: data.filePath }));
                            } else {
                              alert(data.error || 'Upload failed');
                            }
                          } catch (err) {
                            alert('Upload error');
                          } finally {
                            setUploadingMedia(false);
                          }
                        }}
                        className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#E8FFF5] file:text-[#00A878] hover:file:bg-[#D1FBEA]"
                      />
                      {uploadingMedia && <span className="text-xs text-[#00A878] font-bold">Uploading...</span>}
                    </div>
                    {form.customMedia && (
                      <p className="text-xs text-emerald-600 mt-2 font-semibold flex items-center gap-1">
                        <Sparkles size={12} /> Media uploaded successfully!
                      </p>
                    )}
                    <p className="text-[10px] text-[#94A3B8] mt-1.5 leading-relaxed">
                      Stand out on the homepage with a custom banner image or video (Max 50MB). If not provided, your product image will be used.
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] block mb-2">Advertisement Plan</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {plans.map((plan) => (
                      <button
                        key={plan.slug}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, plan: plan.slug }))}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          form.plan === plan.slug
                            ? 'border-[#00A878] bg-[#E8FFF5] shadow-sm'
                            : 'border-[#E5E7EB] hover:border-[#CBD5E1]'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Sparkles size={14} className="text-[#00A878]" />
                          <span className="font-black text-sm text-[#0F172A]">{plan.name}</span>
                        </div>
                        <p className="text-xs text-[#64748B]">{plan.durationDays || plan.duration} days · {plan.visibilityTier} visibility</p>
                        {plan.discountPercent > 0 ? (
                          <div className="mt-2 space-y-1">
                            <p className="text-xs text-[#94A3B8] line-through">{formatPKR(plan.originalPrice ?? plan.price)}</p>
                            <p className="text-sm font-black text-[#00A878]">{formatPKR(plan.finalPrice ?? plan.price)}</p>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-black uppercase">
                              <Tag size={10} /> {plan.discountPercent}% OFF · Save {formatPKR(plan.savings || 0)}
                            </span>
                            {plan.discountName && (
                              <p className="text-[10px] font-bold text-[#64748B]">{plan.discountName}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm font-black text-[#00A878] mt-2">{formatPKR(plan.price)}</p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] block mb-2">Start Date</label>
                    <input
                      type="date"
                      value={form.startDate}
                      min={todayInput}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value && value < todayInput) return;
                        setForm((f) => ({ ...f, startDate: value }));
                      }}
                      className="w-full h-11 px-4 border border-[#E5E7EB] rounded-xl text-sm"
                      required
                    />
                    <p className="text-xs text-[#64748B] mt-1.5 font-semibold">{formatAdDate(form.startDate)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] block mb-2">
                      End Date <span className="normal-case font-medium text-[#94A3B8]">(auto · {planDurationDays} days)</span>
                    </label>
                    <div className="w-full min-h-[44px] px-4 py-2.5 border border-[#E5E7EB] rounded-xl text-sm bg-[#F8FAFC] flex flex-col justify-center">
                      <span className="font-bold text-[#0F172A]">{endDate ? formatAdDate(endDate) : '—'}</span>
                      <span className="text-[10px] text-[#94A3B8] mt-0.5">Calculated from selected plan</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] block mb-2">Daily Budget (optional)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Leave empty for fixed plan pricing"
                    value={form.dailyBudget}
                    onChange={(e) => setForm((f) => ({ ...f, dailyBudget: e.target.value }))}
                    className="w-full h-11 px-4 border border-[#E5E7EB] rounded-xl text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !selectedPlan}
                  className="w-full py-3 bg-[#00A878] hover:bg-[#009E66] disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  {submitting ? 'Processing…' : <>Pay & Submit for Approval <ChevronRight size={16} /></>}
                </button>
              </form>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Payment Summary">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-[#64748B]">Plan</span><span className="font-bold">{selectedPlan?.name || '—'}</span></div>
              <div className="flex justify-between"><span className="text-[#64748B]">Duration</span><span className="font-bold">{planDurationDays} days</span></div>
              <div className="flex justify-between"><span className="text-[#64748B]">Campaign Period</span><span className="font-bold text-right">{formatAdDateRange(form.startDate, endDate)}</span></div>
              {hasDiscount && (
                <>
                  <div className="flex justify-between"><span className="text-[#64748B]">Original Price</span><span className="line-through text-[#94A3B8]">{formatPKR(originalPrice)}</span></div>
                  <div className="flex justify-between"><span className="text-[#64748B]">Discount</span><span className="font-bold text-amber-600">{selectedPlan.discountPercent}% OFF</span></div>
                  <div className="flex justify-between"><span className="text-[#64748B]">You Save</span><span className="font-bold text-emerald-600">{formatPKR(selectedPlan.savings || 0)}</span></div>
                </>
              )}
              <div className="flex justify-between border-t border-[#E5E7EB] pt-3">
                <span className="font-bold">Final Price</span>
                <span className="font-black text-[#00A878]">{selectedPlan ? formatPKR(displayPrice) : '—'}</span>
              </div>
            </div>
          </Card>
          <Card title="Wallet Balance">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E8FFF5] flex items-center justify-center text-[#00A878]">
                <Wallet size={18} />
              </div>
              <div>
                <p className="text-xs text-[#64748B] font-bold uppercase">Available</p>
                <p className="text-lg font-black text-[#0F172A]">{walletBalance != null ? formatPKR(walletBalance) : '—'}</p>
              </div>
            </div>
            <Link href="/manufacturer/transactions" className="text-xs font-bold text-[#00A878] mt-3 inline-block hover:underline">
              Manage wallet →
            </Link>
          </Card>
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-xs text-[#64748B] leading-relaxed">
            After payment, campaigns enter <strong>Pending Approval</strong>. Admin review typically completes within 1–2 hours.
          </div>
        </div>
      </div>
    </PageShell>
  );
}
