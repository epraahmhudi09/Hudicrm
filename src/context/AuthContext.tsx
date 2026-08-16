import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { doc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { onDocSnapshotWithRetry } from "../utils/firestoreRetry";
import { recordUnlock } from "../utils/biometricAuth";

interface AuthContextValue {
  user: User | null;
  profilePhoto: string | null;
  tenantId: string | null;
  isPlatformAdmin: boolean;
  profileLoading: boolean;
  // True only once every retry to load the users/{uid} profile doc has
  // failed — distinct from tenantId simply being null because the account
  // was never provisioned, so the UI can tell "couldn't load, try again"
  // apart from "this account isn't set up yet."
  profileLoadFailed: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileLoadFailed, setProfileLoadFailed] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      setProfilePhoto(null);
      setTenantId(null);
      setIsPlatformAdmin(false);
      setProfileLoading(false);
      setProfileLoadFailed(false);
      return;
    }
    setProfileLoading(true);
    setProfileLoadFailed(false);
    const unsubscribe = onDocSnapshotWithRetry(
      doc(db, "users", user.uid),
      (snap) => {
        const data = snap.data();
        setProfilePhoto((data?.photoDataUrl as string | undefined) ?? null);
        setTenantId((data?.tenantId as string | undefined) ?? null);
        setIsPlatformAdmin((data?.isPlatformAdmin as boolean | undefined) ?? false);
        setProfileLoading(false);
        setProfileLoadFailed(false);
      },
      () => {
        // Every retry failed — stop spinning forever and let the UI show a
        // "couldn't load, try again" state instead of hanging indefinitely.
        setProfileLoading(false);
        setProfileLoadFailed(true);
      }
    );
    return unsubscribe;
  }, [user]);

  const login = async (email: string, password: string) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    recordUnlock(credential.user.uid);
  };

  const logout = async () => {
    await signOut(auth);
  };

  // Firebase doesn't re-fire onAuthStateChanged after updateProfile(), so the
  // cached `user` object goes stale. Reload it and swap in a fresh reference
  // (same prototype, so methods like getIdToken still work) to force a re-render.
  const refreshUser = async () => {
    if (!auth.currentUser) return;
    await auth.currentUser.reload();
    const fresh = Object.assign(
      Object.create(Object.getPrototypeOf(auth.currentUser)),
      auth.currentUser
    ) as User;
    setUser(fresh);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profilePhoto,
        tenantId,
        isPlatformAdmin,
        profileLoading,
        profileLoadFailed,
        loading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

// App.tsx only renders the rest of the app once tenantId has finished
// loading, so by the time any data-fetching component mounts, it's always
// present — this just gives call sites a plain string instead of every one
// of them re-checking for null.
export function useTenantId(): string {
  const { tenantId } = useAuth();
  if (!tenantId) throw new Error("useTenantId called before the tenant finished loading");
  return tenantId;
}
