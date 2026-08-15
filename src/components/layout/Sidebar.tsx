import { type ReactNode } from "react";
import {
  BarChart3,
  CalendarX2,
  Download,
  LayoutDashboard,
  MessageSquareText,
  Package,
  PhoneCall,
  Settings,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useInstallPrompt } from "../../hooks/useInstallPrompt";
import Logo from "./Logo";

export type AppView =
  | "dashboard"
  | "customers"
  | "debtCustomers"
  | "expiredBundles"
  | "bundles"
  | "analytics"
  | "smsReminders"
  | "escalations"
  | "settings";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  view: AppView;
  onNavigate: (view: AppView) => void;
}

export default function Sidebar({ open, onClose, view, onNavigate }: SidebarProps) {
  const { t } = useLanguage();
  const { canInstall, promptInstall } = useInstallPrompt();

  const items: Array<{ key: AppView; label: string; icon: ReactNode }> = [
    { key: "dashboard", label: t.navDashboard, icon: <LayoutDashboard size={18} /> },
    { key: "customers", label: t.navCustomers, icon: <Users size={18} /> },
    { key: "debtCustomers", label: t.navDebtCustomers, icon: <Wallet size={18} /> },
    { key: "expiredBundles", label: t.navExpiredBundles, icon: <CalendarX2 size={18} /> },
    { key: "smsReminders", label: t.navSmsReminders, icon: <MessageSquareText size={18} /> },
    { key: "escalations", label: t.navEscalations, icon: <PhoneCall size={18} /> },
    { key: "bundles", label: t.navBundles, icon: <Package size={18} /> },
    { key: "analytics", label: t.navAnalytics, icon: <BarChart3 size={18} /> },
  ];

  const settingsItem: { key: AppView; label: string; icon: ReactNode } = {
    key: "settings",
    label: t.navSettings,
    icon: <Settings size={18} />,
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-ink-900/50" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white shadow-xl transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-ink-100 px-4">
          <Logo variant="dark" showTagline={false} />
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-500 transition hover:bg-ink-100"
            aria-label={t.toggleSidebar}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {items.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                onNavigate(item.key);
                onClose();
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                view === item.key
                  ? "bg-amtel-50 text-amtel-700"
                  : "text-ink-700 hover:bg-ink-100"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-ink-100 p-3 space-y-1">
          {canInstall && (
            <button
              onClick={promptInstall}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-amtel-700 transition hover:bg-amtel-50"
            >
              <Download size={18} />
              {t.installApp}
            </button>
          )}
          <button
            onClick={() => {
              onNavigate(settingsItem.key);
              onClose();
            }}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              view === settingsItem.key
                ? "bg-amtel-50 text-amtel-700"
                : "text-ink-700 hover:bg-ink-100"
            }`}
          >
            {settingsItem.icon}
            {settingsItem.label}
          </button>
        </div>
      </aside>
    </>
  );
}
