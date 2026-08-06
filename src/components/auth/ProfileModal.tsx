import { useState, type FormEvent } from "react";
import {
  X,
  Loader2,
  Check,
  AlertCircle,
  UserCircle,
  Camera,
} from "lucide-react";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { resizeImageToDataUrl } from "../../utils/imageResize";

interface ProfileModalProps {
  onClose: () => void;
}

function friendlyError(code: string): string {
  switch (code) {
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Current password is incorrect.";
    case "auth/weak-password":
      return "New password must be at least 6 characters.";
    case "auth/requires-recent-login":
      return "Please sign out and back in, then try changing your password again.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

type SectionStatus = "idle" | "saving" | "success" | "error";

export default function ProfileModal({ onClose }: ProfileModalProps) {
  const { user, profilePhoto, refreshUser } = useAuth();

  const [name, setName] = useState(user?.displayName ?? "");
  const [nameStatus, setNameStatus] = useState<SectionStatus>("idle");
  const [nameError, setNameError] = useState<string | null>(null);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarStatus, setAvatarStatus] = useState<SectionStatus>("idle");
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<SectionStatus>("idle");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  async function handleSaveName(e: FormEvent) {
    e.preventDefault();
    if (!auth.currentUser || !name.trim()) return;
    setNameStatus("saving");
    setNameError(null);
    try {
      await updateProfile(auth.currentUser, { displayName: name.trim() });
      await refreshUser();
      setNameStatus("success");
      setTimeout(() => setNameStatus("idle"), 2000);
    } catch (err) {
      setNameError(err instanceof Error ? err.message : "Couldn't update name.");
      setNameStatus("error");
    }
  }

  async function handleAvatarChange(file: File) {
    if (!auth.currentUser) return;
    setAvatarError(null);
    setAvatarStatus("saving");
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      setAvatarPreview(dataUrl);
      await setDoc(
        doc(db, "users", auth.currentUser.uid),
        { photoDataUrl: dataUrl, updatedAt: serverTimestamp() },
        { merge: true }
      );
      setAvatarStatus("success");
      setTimeout(() => setAvatarStatus("idle"), 2000);
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "Couldn't upload that image.");
      setAvatarStatus("error");
    }
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    if (!auth.currentUser?.email) return;

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      setPasswordStatus("error");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match.");
      setPasswordStatus("error");
      return;
    }

    setPasswordStatus("saving");
    setPasswordError(null);
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      setPasswordStatus("success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordStatus("idle"), 2000);
    } catch (err) {
      const code = (err as { code?: string }).code ?? "";
      setPasswordError(friendlyError(code));
      setPasswordStatus("error");
    }
  }

  const displayedAvatar = avatarPreview ?? profilePhoto;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-ink-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-500 transition hover:bg-ink-100 hover:text-ink-900"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-ink-100 text-ink-400">
                {displayedAvatar ? (
                  <img src={displayedAvatar} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <UserCircle size={48} />
                )}
              </div>
              <label className="absolute -right-1 -bottom-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-amtel-600 text-white shadow-sm transition hover:bg-amtel-700">
                <Camera size={13} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (file) void handleAvatarChange(file);
                  }}
                />
              </label>
            </div>
            {avatarStatus === "saving" && (
              <p className="flex items-center gap-1.5 text-xs text-ink-500">
                <Loader2 size={12} className="animate-spin" /> Uploading...
              </p>
            )}
            {avatarStatus === "success" && (
              <p className="flex items-center gap-1.5 text-xs text-green-600">
                <Check size={12} /> Avatar updated
              </p>
            )}
            {avatarError && <p className="text-xs text-amtel-600">{avatarError}</p>}
          </div>

          {/* Display name */}
          <form onSubmit={handleSaveName} className="space-y-2 border-t border-ink-100 pt-5">
            <label htmlFor="displayName" className="block text-sm font-medium text-ink-700">
              Display Name
            </label>
            <div className="flex gap-2">
              <input
                id="displayName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="flex-1 rounded-lg border border-ink-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-amtel-500 focus:ring-2 focus:ring-amtel-500/20"
              />
              <button
                type="submit"
                disabled={nameStatus === "saving" || !name.trim()}
                className="flex items-center gap-1.5 rounded-lg bg-amtel-600 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-amtel-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {nameStatus === "saving" && <Loader2 size={14} className="animate-spin" />}
                Save
              </button>
            </div>
            {nameStatus === "success" && (
              <p className="flex items-center gap-1.5 text-xs text-green-600">
                <Check size={12} /> Name updated
              </p>
            )}
            {nameError && (
              <p className="flex items-center gap-1.5 text-xs text-amtel-600">
                <AlertCircle size={12} /> {nameError}
              </p>
            )}
          </form>

          {/* Change password */}
          <form onSubmit={handleChangePassword} className="space-y-3 border-t border-ink-100 pt-5">
            <p className="text-sm font-medium text-ink-700">Change Password</p>

            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              autoComplete="current-password"
              className="w-full rounded-lg border border-ink-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-amtel-500 focus:ring-2 focus:ring-amtel-500/20"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min. 6 characters)"
              autoComplete="new-password"
              className="w-full rounded-lg border border-ink-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-amtel-500 focus:ring-2 focus:ring-amtel-500/20"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              autoComplete="new-password"
              className="w-full rounded-lg border border-ink-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-amtel-500 focus:ring-2 focus:ring-amtel-500/20"
            />

            <button
              type="submit"
              disabled={passwordStatus === "saving" || !currentPassword || !newPassword}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-amtel-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amtel-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {passwordStatus === "saving" && <Loader2 size={14} className="animate-spin" />}
              Update Password
            </button>

            {passwordStatus === "success" && (
              <p className="flex items-center gap-1.5 text-xs text-green-600">
                <Check size={12} /> Password updated
              </p>
            )}
            {passwordError && (
              <p className="flex items-center gap-1.5 text-xs text-amtel-600">
                <AlertCircle size={12} /> {passwordError}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
