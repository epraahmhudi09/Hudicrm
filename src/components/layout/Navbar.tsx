import { useEffect, useRef, useState } from "react";
import { LogOut, UserCircle, ChevronDown, UserCog, Languages, Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import Logo from "./Logo";
import ProfileModal from "../auth/ProfileModal";

interface NavbarProps {
  onToggleSidebar: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const { user, profilePhoto, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-amtel-700 to-amtel-600 shadow-md">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            aria-label={t.toggleSidebar}
            className="rounded-lg p-1.5 text-white/95 transition hover:bg-white/10"
          >
            <Menu size={20} />
          </button>
          <Logo variant="light" />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLanguage(language === "so" ? "en" : "so")}
            title="Language / Luuqad"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white/95 transition hover:bg-white/10"
          >
            <Languages size={15} />
            {language === "so" ? "SO" : "EN"}
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-white/95 transition hover:bg-white/10"
            >
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Avatar"
                  className="h-6 w-6 rounded-full object-cover"
                />
              ) : (
                <UserCircle size={22} />
              )}
              <span className="hidden sm:inline max-w-[160px] truncate text-sm font-medium">
                {user?.displayName || user?.email || t.account}
              </span>
              <ChevronDown size={14} className="opacity-80" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-lg border border-ink-100 bg-white py-1 text-ink-900 shadow-lg">
                <div className="border-b border-ink-100 px-3.5 py-2.5">
                  <p className="text-xs text-ink-500">{t.signedInAs}</p>
                  <p className="truncate text-sm font-medium">
                    {user?.displayName || user?.email}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setProfileOpen(true);
                  }}
                  className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-ink-700 transition hover:bg-ink-100"
                >
                  <UserCog size={15} />
                  {t.editProfile}
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    void logout();
                  }}
                  className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-amtel-600 transition hover:bg-amtel-50"
                >
                  <LogOut size={15} />
                  {t.signOut}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}
    </header>
  );
}
