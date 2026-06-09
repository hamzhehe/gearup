"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Search,
  MessageSquare,
  Banknote,
  BarChart3,
  Settings,
  HelpCircle,
  X,
  LogOut,
  Users,
  CheckCircle,
  Megaphone,
  ShoppingBag,
  AlertTriangle,
  FileText,
  PlusCircle,
  LineChart,
  Receipt,
  Tag,
} from 'lucide-react';
import { AD_SYSTEM_ENABLED } from '@/lib/advertisingConfig';
import AdminSidebarNav from '@/components/admin/AdminSidebarNav';
import UserAvatar from '@/components/ui/UserAvatar';

const Sidebar = ({
  isOpen = true,
  onClose,
  isMobile = false,
  widthFull = 280,
  widthCollapsed = 72,
}) => {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getMenuItems = () => {
    if (user?.role === 'admin') {
      return null;
    }

    if (user?.role === 'wholesaler') {
      return [
        { label: 'Overview', path: '/wholesaler/dashboard', icon: LayoutDashboard },
        { label: 'Inventory', path: '/manufacturer/products', icon: Package },
        { label: 'Sales Orders', path: '/manufacturer/orders', icon: ShoppingCart },
        { label: 'Purchase Orders', path: '/wholesaler/orders', icon: ShoppingBag },
        { label: 'Marketplace', path: '/wholesaler/marketplace', icon: Search },
        { label: 'Seller Chats', path: '/wholesaler/chats', icon: MessageSquare },
        { label: 'Payments', path: '/manufacturer/transactions', icon: Banknote },
        { label: 'Order Issues', path: '/manufacturer/disputes', icon: AlertTriangle },
        { label: 'Analytics', path: '/manufacturer/analytics', icon: BarChart3 },
      ];
    }

    const manufacturerItems = [
      { label: 'Overview', path: '/manufacturer/dashboard', icon: LayoutDashboard },
      { label: 'Inventory', path: '/manufacturer/products', icon: Package },
      { label: 'Sales Orders', path: '/manufacturer/orders', icon: ShoppingCart },
      { label: 'Purchase Orders', path: '/wholesaler/orders', icon: ShoppingBag },
      { label: 'Marketplace', path: '/wholesaler/marketplace', icon: Search },
      { label: 'Seller Chats', path: '/manufacturer/chats', icon: MessageSquare, badge: true },
      { label: 'Payments', path: '/manufacturer/transactions', icon: Banknote },
      { label: 'Order Issues', path: '/manufacturer/disputes', icon: AlertTriangle },
      { label: 'Analytics', path: '/manufacturer/analytics', icon: BarChart3 },
    ];

    if (AD_SYSTEM_ENABLED) {
      manufacturerItems.push(
        { label: 'Create Advertisement', path: '/manufacturer/advertising/create', icon: PlusCircle, section: 'Marketing & Advertising' },
        { label: 'Active Campaigns', path: '/manufacturer/advertising/campaigns', icon: Megaphone, section: 'Marketing & Advertising' },
        { label: 'Campaign Analytics', path: '/manufacturer/advertising/analytics', icon: LineChart, section: 'Marketing & Advertising' },
        { label: 'Billing History', path: '/manufacturer/advertising/billing', icon: Receipt, section: 'Marketing & Advertising' },
      );
    }

    return manufacturerItems;
  };

  const menuItems = getMenuItems() || [];
  const roleDisplay = user?.role === 'admin'
    ? 'Administrator'
    : user?.role === 'wholesaler'
      ? 'Wholesaler'
      : user?.role === 'manufacturer'
        ? 'Manufacturer'
        : '';

  const width = isMobile ? widthFull : isOpen ? widthFull : widthCollapsed;
  const showLabels = isOpen || isMobile;

  const sidebarClasses = isMobile
    ? `fixed inset-y-0 left-0 z-[100] transform transition-transform duration-300 shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
    : 'fixed inset-y-0 left-0 z-50 transition-all duration-300';

  return (
    <>
      {isMobile && isOpen && (
        <div onClick={onClose} className="fixed inset-0 z-[90] bg-black/55 backdrop-blur-sm" aria-hidden />
      )}

      <aside
        className={`${sidebarClasses} flex flex-col text-white/90`}
        style={{
          width,
          background: 'linear-gradient(180deg, var(--color-seller-nav-deep) 0%, var(--color-seller-nav) 100%)',
          borderRight: '1px solid rgba(0, 168, 150, 0.12)',
        }}
      >
        <div className={`h-16 flex items-center border-b border-white/10 shrink-0 ${showLabels ? 'px-4' : 'justify-center'}`}>
          <Link
            href={
              user?.role === 'manufacturer'
                ? '/manufacturer/dashboard'
                : user?.role === 'wholesaler'
                  ? '/wholesaler/dashboard'
                  : '/admin/dashboard'
            }
            className="flex items-center gap-2.5 min-w-0"
          >
            <div className="w-9 h-9 rounded-lg bg-[#00A878] flex items-center justify-center shrink-0">
              <span className="font-black text-white text-sm">G</span>
            </div>
            {showLabels && (
              <div className="min-w-0">
                <div className="font-bold text-white text-[15px] leading-none tracking-tight">GEARUP</div>
                <div className="text-[9px] text-[#00A878] font-bold uppercase tracking-[0.2em] mt-1">
                  {user?.role === 'admin' ? 'Admin Center' : user?.role === 'wholesaler' ? 'Wholesaler Center' : 'Manufacturer Center'}
                </div>
              </div>
            )}
          </Link>
          {isMobile && (
            <button type="button" onClick={onClose} className="ml-auto p-2 text-white/60 hover:text-white">
              <X size={20} />
            </button>
          )}
        </div>

        {showLabels && user?.role === 'admin' && (
          <div className="px-4 pt-3 pb-1">
            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">Control Center</div>
          </div>
        )}
        {showLabels && user?.role !== 'admin' && (
          <div className="px-4 pt-3 pb-1">
            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">Menu</div>
          </div>
        )}

        <nav className="flex-1 px-2 py-1 space-y-0.5 overflow-y-auto min-h-0">
          {user?.role === 'admin' ? (
            <AdminSidebarNav showLabels={showLabels} onNavigate={isMobile ? onClose : undefined} />
          ) : (
            menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.path || (item.path !== '#' && pathname.startsWith(item.path + '/'));
            const showSection =
              item.section &&
              showLabels &&
              (index === 0 || menuItems[index - 1]?.section !== item.section);

            return (
              <React.Fragment key={`${item.label}-${item.path}`}>
                {showSection && (
                  <div className="px-3 pt-4 pb-1">
                    <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/35">
                      {item.section}
                    </div>
                  </div>
                )}
                <Link
                href={item.path}
                onClick={isMobile ? onClose : undefined}
                title={!showLabels ? item.label : undefined}
                className={`flex items-center gap-3 py-2.5 rounded-[10px] text-[13px] font-medium transition-all duration-200 ${
                  showLabels ? 'px-3' : 'px-0 justify-center'
                } ${
                  isActive
                    ? 'seller-nav-active text-white'
                    : 'text-white/60 hover:bg-white/[0.06] hover:text-white/95'
                }`}
              >
                <span className="w-[18px] h-[18px] flex items-center justify-center shrink-0">
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                </span>
                {showLabels && <span className="truncate flex-1">{item.label}</span>}
                {item.badgeCount > 0 && showLabels && (
                  <span className="min-w-[20px] h-[20px] bg-[#F59E0B] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {item.badgeCount}
                  </span>
                )}
              </Link>
              </React.Fragment>
            );
          })
          )}
        </nav>

        <div className="p-2.5 border-t border-white/[0.06] space-y-1 shrink-0">
          {showLabels && user && (
            <div
              className="px-3.5 py-3 mb-1 rounded-[16px] border border-white/[0.08] backdrop-blur-sm"
              style={{
                background: 'linear-gradient(135deg, rgba(8,25,20,0.95), rgba(12,45,35,0.95))',
                boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
              }}
            >
              <div className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/35 mb-3">Account</div>
              <div className="flex items-center gap-3">
                <div className="shrink-0" style={{ filter: 'drop-shadow(0 0 15px rgba(16,185,129,0.25))' }}>
                  <UserAvatar
                    user={user}
                    size="sm"
                    variant="dark"
                    className="border-2"
                    style={{ borderColor: 'rgba(16,185,129,0.4)' }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold text-white/95 truncate leading-tight">{user.name || 'User'}</div>
                  <div className="text-[10px] text-[#10B981] font-semibold mt-0.5">{roleDisplay}</div>
                </div>
              </div>
            </div>
          )}

          <Link
            href={
              user?.role === 'wholesaler'
                ? '/wholesaler/profile'
                : user?.role === 'manufacturer'
                  ? '/profile'
                  : '/admin/settings/platform'
            }
            className={`flex items-center gap-3 py-2.5 rounded-lg text-[13px] font-medium text-white/50 hover:bg-white/[0.05] hover:text-white/80 transition-all duration-200 ${
              !showLabels ? 'justify-center px-0' : 'px-3'
            }`}
          >
            <Settings size={17} className="shrink-0" />
            {showLabels && <span>Settings</span>}
          </Link>
          <Link
            href={user?.role === 'admin' ? '/admin/support' : '/contact'}
            className={`flex items-center gap-3 py-2.5 rounded-lg text-[13px] font-medium text-white/50 hover:bg-white/[0.05] hover:text-white/80 transition-all duration-200 ${
              !showLabels ? 'justify-center px-0' : 'px-3'
            }`}
          >
            <HelpCircle size={17} className="shrink-0" />
            {showLabels && <span>Support</span>}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className={`flex items-center gap-3 py-2.5 rounded-lg text-[13px] font-medium text-red-400/70 hover:text-red-300 hover:bg-red-500/[0.08] transition-all duration-200 w-full ${
              !showLabels ? 'justify-center px-0' : 'px-3'
            }`}
          >
            <LogOut size={17} className="shrink-0" />
            {showLabels && <span>Sign out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
