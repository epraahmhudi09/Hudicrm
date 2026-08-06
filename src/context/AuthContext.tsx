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
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase";

interface AuthContextValue {
  user: User | null;
  profilePhoto: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
      return;
    }
    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (snap) => {
      setProfilePhoto((snap.data()?.photoDataUrl as string | undefined) ?? null);
    });
    return unsubscribe;
  }, [user]);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
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
      value={{ user, profilePhoto, loading, login, logout, refreshUser }}
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
