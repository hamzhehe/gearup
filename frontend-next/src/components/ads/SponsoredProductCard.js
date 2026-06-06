"use client";

import React from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  MessageCircle,
  CheckCircle,
  Package,
  MapPin,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import { formatPKR } from '@/lib/financeUtils';
import { getApiBaseUrl } from '@/lib/api';
import { PRODUCT_PLACEHOLDER } from '@/lib/marketplaceData';
import { formatMoqDisplay } from '@/utils/moq';

export default function SponsoredProductCard({
  product,
  onAddToCart,
  onRequestQuote,
  onView,
  compact = false,
}) {
  const imageUrl = product.image?.startsWith('http')
    ? product.image
    : product.image
      ? `${getApiBaseUrl()}${product.image}`
      : PRODUCT_PLACEHOLDER;

  const moqLabel = formatMoqDisplay(product.moq, product.bulkUnit, product.packSize);

  const trustBadges = [];
  if (product.verified) trustBadges.push('Verified Supplier');
  if (product.moq && product.price != null) trustBadges.push('Trade Ready');
  if (product.sponsored !== false) trustBadges.push('Secure Orders');

  const memberSince = product.memberSince || product.joinedDate || null;

  const mediaUrl = product.customMedia
    ? product.customMedia.startsWith('http')
      ? product.customMedia
      : `${getApiBaseUrl()}${product.customMedia}`
    : imageUrl;

  const isVideo = mediaUrl && (mediaUrl.endsWith('.mp4') || mediaUrl.endsWith('.webm'));

  return (
    <article
      className={`relative h-full flex flex-col rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden transition-all duration-300 ease-out shadow-[0_4px_20px_rgba(11,31,58,0.06)] hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(11,31,58,0.12),0_0_0_1px_rgba(0,200,150,0.25)] hover:border-[#00C896]/50 group ${compact ? '' : ''}`}
    >
      {/* Sponsored badge */}
      <div className="absolute top-3 left-3 z-20">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider text-white shadow-[0_2px_12px_rgba(0,200,150,0.45)] bg-gradient-to-r from-[#0B1F3A] via-[#0d3d5c] to-[#00C896] border border-white/10">
          ⭐ Sponsored Listing
        </span>
      </div>

      {/* Product image */}
      <div className="relative h-[200px] sm:h-[220px] bg-gradient-to-b from-[#F8FAFC] to-[#F1F5F9] border-b border-[#E5E7EB] overflow-hidden">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/0 via-white/25 to-white/0 pointer-events-none z-[1]" />
        <div className="absolute inset-0 flex items-center justify-center p-6">
          {isVideo ? (
            <video
              src={mediaUrl}
              autoPlay
              muted
              loop
              playsInline
              className="max-h-full max-w-full object-contain transition-transform duration-500 ease-out group-hover:scale-105 drop-shadow-sm rounded-lg"
            />
          ) : (
            <img
              src={mediaUrl}
              alt={product.name}
              className="max-h-full max-w-full object-contain transition-transform duration-500 ease-out group-hover:scale-110 drop-shadow-sm"
              onError={(e) => { e.currentTarget.src = PRODUCT_PLACEHOLDER; }}
            />
          )}
        </div>
        {!product.image && !product.customMedia && (
          <div className="absolute inset-0 flex items-center justify-center text-[#94A3B8]">
            <Package size={48} className="stroke-[1.5] opacity-40" />
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#64748B] mb-1.5">
          {product.category}
        </p>
        <h3 className="font-bold text-[#0B1F3A] text-[15px] leading-snug line-clamp-2 group-hover:text-[#00C896] transition-colors min-h-[40px]">
          {product.name}
        </h3>

        {/* Manufacturer */}
        <div className="mt-3 pt-3 border-t border-[#F1F5F9] space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-[#0B1F3A] text-xs truncate">{product.supplier}</span>
            {product.verified && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[#E8FFF5] text-[#00A878] text-[8px] font-black uppercase tracking-wider border border-[#00C896]/20">
                <CheckCircle size={9} /> Verified
              </span>
            )}
          </div>
          <p className="flex items-center gap-1 text-[10px] text-[#64748B] font-semibold">
            <MapPin size={11} className="text-[#94A3B8] shrink-0" />
            {product.location || product.country}
          </p>
          {memberSince && (
            <p className="flex items-center gap-1 text-[10px] text-[#94A3B8] font-semibold">
              <Calendar size={11} className="shrink-0" />
              Member since {memberSince}
            </p>
          )}
        </div>

        {/* Price — primary visual */}
        <div className="mt-4 py-3 px-3 rounded-xl bg-[#FAFBFC] border border-[#E5E7EB]">
          <p className="text-[22px] sm:text-2xl font-black text-[#00C896] leading-none tracking-tight tabular-nums">
            {formatPKR(product.price)}
          </p>
          <p className="text-[9px] font-black uppercase tracking-[0.12em] text-[#64748B] mt-1.5">
            Bulk Trade Pricing
          </p>
        </div>

        {/* MOQ chip */}
        <div className="mt-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0B1F3A]/5 border border-[#0B1F3A]/10 text-[11px] font-bold text-[#0B1F3A]">
            📦 MOQ: {moqLabel.compact}
          </span>
          {moqLabel.secondary && (
            <p className="text-[10px] text-[#64748B] font-semibold mt-1 ml-1">{moqLabel.secondary}</p>
          )}
        </div>

        {/* Trust indicators */}
        {trustBadges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {trustBadges.map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-white border border-[#E5E7EB] text-[8px] font-bold uppercase tracking-wide text-[#64748B]"
              >
                <ShieldCheck size={9} className="text-[#00C896]" />
                {label}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 pt-4 border-t border-[#F1F5F9] space-y-2 mt-auto">
          <Link
            href={`/wholesaler/marketplace/product/${product.id}`}
            onClick={() => onView?.(product)}
            className="flex w-full items-center justify-center h-11 rounded-xl bg-[#0B1F3A] hover:bg-[#0d2847] text-white text-xs font-black uppercase tracking-wider transition-all shadow-[0_4px_14px_rgba(11,31,58,0.2)] hover:shadow-[0_6px_18px_rgba(11,31,58,0.28)]"
          >
            View Details
          </Link>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onRequestQuote?.(product)}
              className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl border-2 border-[#E5E7EB] bg-white hover:border-[#00C896] hover:bg-[#F8FFFC] text-[#0B1F3A] hover:text-[#00C896] text-[10px] font-black uppercase tracking-wider transition-all"
              title="Message Supplier"
            >
              <MessageCircle size={15} />
              Message Supplier
            </button>
            <button
              type="button"
              onClick={() => onAddToCart?.(product)}
              className="flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl bg-[#00C896] hover:bg-[#00b085] text-white text-[10px] font-black uppercase tracking-wider transition-all shadow-[0_4px_14px_rgba(0,200,150,0.35)] hover:shadow-[0_6px_18px_rgba(0,200,150,0.45)] shrink-0"
              title="Add to Cart"
            >
              <ShoppingCart size={15} />
              Add to Cart
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-4 pt-3 border-t border-[#F1F5F9] text-[9px] text-center text-[#94A3B8] font-semibold tracking-wide">
          Promoted through GearUp Advertising Network
        </p>
      </div>
    </article>
  );
}
