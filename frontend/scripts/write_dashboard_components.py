import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1] / "src" / "components"

COMPONENTS = {
    "common/Input.js": r'''"use client";

import React from "react";

const Input = ({
  icon: Icon,
  className = "",
  inputClassName = "",
  ...props
}) => (
  <motionless className={`relative ${className}`}>
    {Icon && (
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
    )}
    <input
      className={`w-full ${Icon ? "pl-11" : "pl-4"} pr-4 py-3 bg-white border border-[#E7ECF3] rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-[#00C26E] outline-none transition-all font-body text-sm font-semibold text-slate-900 placeholder:text-slate-400 ${inputClassName}`}
      {...props}
    />
  </motionless>
);

export default Input;
''',
    "dashboard/FilterBar.js": r'''"use client";

import React from "react";
import Input from "../common/Input";
import { Search } from "lucide-react";

const FilterBar = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  children,
  className = "",
}) => (
  <motionless className={`bg-white rounded-2xl border border-[#E7ECF3] p-5 shadow-[0_2px_15px_rgba(0,0,0,0.01)] ${children ? "space-y-4" : ""} ${className}`}>
    {onSearchChange !== undefined && (
      <Input
        icon={Search}
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    )}
    {children}
  </motionless>
);

export default FilterBar;
''',
    "common/Modal.js": r'''"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  className = "",
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <motionless
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="presentation"
    >
      <motionless
        className={`bg-white rounded-2xl border border-[#E7ECF3] shadow-2xl w-full ${sizes[size] || sizes.md} p-8 relative animate-in zoom-in-95 duration-200 ${className}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {title && (
          <h3 className="font-heading text-xl font-black text-slate-900 tracking-tight mb-6 pr-8">
            {title}
          </h3>
        )}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        )}
        {children}
      </motionless>
    </motionless>
  );
};

export default Modal;
''',
    "dashboard/Tabs.js": r'''"use client";

import React from "react";

const Tabs = ({ tabs = [], activeTab, onChange, className = "" }) => (
  <motionless className={`flex items-center gap-2 overflow-x-auto border-t border-[#E7ECF3]/60 pt-4 scrollbar-none ${className}`}>
    {tabs.map((tab) => {
      const isActive = activeTab === tab.id;
      const count = tab.count;
      return (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2 rounded-xl font-body font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            isActive
              ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
              : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <span>{tab.label}</span>
          {count !== undefined && (
            <span
              className={`px-1.5 py-0.5 rounded-md text-[9px] font-black leading-none ${
                isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              }`}
            >
              {count}
            </span>
          )}
        </button>
      );
    })}
  </motionless>
);

export default Tabs;
''',
    "dashboard/AlertBanner.js": r'''"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight } from "lucide-react";

const VARIANTS = {
  warning: {
    wrap: "bg-amber-50/80 border-amber-100 text-amber-900",
    icon: "bg-amber-100 text-amber-700",
  },
  error: {
    wrap: "bg-red-50/80 border-red-100 text-red-900",
    icon: "bg-red-100 text-red-700",
  },
  info: {
    wrap: "bg-slate-50 border-slate-200 text-slate-900",
    icon: "bg-slate-200 text-slate-700",
  },
  success: {
    wrap: "bg-emerald-50/80 border-emerald-100 text-emerald-900",
    icon: "bg-emerald-100 text-emerald-700",
  },
};

const AlertBanner = ({
  variant = "warning",
  title,
  description,
  actionLabel,
  actionHref,
  className = "",
}) => {
  const v = VARIANTS[variant] || VARIANTS.warning;

  return (
    <motionless className={`p-6 rounded-2xl border shadow-sm ${v.wrap} ${className}`}>
      <motionless className="flex items-start gap-4">
        <motionless className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${v.icon}`}>
          <AlertCircle size={20} />
        </motionless>
        <motionless className="flex-1">
          {title && (
            <h3 className="font-heading text-sm font-black uppercase tracking-widest">
              {title}
            </h3>
          )}
          {description && (
            <p className="font-body text-xs text-slate-600 font-medium leading-relaxed mt-1">
              {description}
            </p>
          )}
          {actionLabel && actionHref && (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-[#00C26E] transition-all font-body font-bold text-xs shadow-sm"
            >
              {actionLabel} <ArrowRight size={12} />
            </Link>
          )}
        </motionless>
      </motionless>
    </motionless>
  );
};

export default AlertBanner;
''',
}

for rel, content in COMPONENTS.items():
    text = content.replace("motionless", "div")
    path = ROOT / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")
    print("wrote", rel)
