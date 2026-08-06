import { useState } from "react";
import { LogOut, UserCircle, ChevronDown, UserCog } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Logo from "./Logo";
import ProfileModal from "../auth/ProfileModal";

export default function Navbar() {
  const { user, profilePhoto, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-amtel-700 to-amtel-600 shadow-md">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6">
        <Logo variant="light" />

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
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
              {user?.displayName || user?.email || "Account"}
            </span>
            <ChevronDown size={14} className="opacity-80" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-lg border border-ink-100 bg-white py-1 text-ink-900 shadow-lg">
              <div className="border-b border-ink-100 px-3.5 py-2.5">
                <p className="text-xs text-ink-500">Signed in as</p>
                <p className="truncate text-sm font-medium">
                  {user?.displayName || user?.email}
                </p>
              </div>
              <button
                onClick={() => setProfileOpen(true)}
                className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-ink-700 transition hover:bg-ink-100"
              >
                <UserCog size={15} />
                Edit Profile
              </button>
              <button
                onClick={() => void logout()}
                className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-amtel-600 transition hover:bg-amtel-50"
              >
                <LogOut size={15} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}
    </header>
  );
}
