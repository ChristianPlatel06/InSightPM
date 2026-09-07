"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onIdTokenChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { authErrorMessage } from "@/lib/auth-errors";

export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  error: string;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  logInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function toAuthUser(user: User): AuthUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
}

async function persistSession(user: User | null): Promise<void> {
  if (!user) {
    await fetch("/api/auth/session", { method: "DELETE", credentials: "include" });
    return;
  }

  const idToken = await user.getIdToken();
  const response = await fetch("/api/auth/session", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    throw new Error("Could not create a session");
  }
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    void setPersistence(auth, browserLocalPersistence);

    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      try {
        await persistSession(firebaseUser);
        if (!mounted) return;
        setUser(firebaseUser ? toAuthUser(firebaseUser) : null);
        setError("");
      } catch (err: unknown) {
        if (!mounted) return;
        setUser(null);
        setError(authErrorMessage(err));
      } finally {
        if (mounted) setLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    setError("");
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const trimmedName = displayName.trim();
    if (trimmedName) {
      await updateProfile(credential.user, { displayName: trimmedName });
    }
    await persistSession(credential.user);
    setUser({
      uid: credential.user.uid,
      email: credential.user.email,
      displayName: trimmedName || credential.user.displayName,
      photoURL: credential.user.photoURL,
    });
  }, []);

  const logIn = useCallback(async (email: string, password: string) => {
    setError("");
    const credential = await signInWithEmailAndPassword(auth, email, password);
    await persistSession(credential.user);
    setUser(toAuthUser(credential.user));
  }, []);

  const logInWithGoogle = useCallback(async () => {
    setError("");
    const credential = await signInWithPopup(auth, googleProvider);
    await persistSession(credential.user);
    setUser(toAuthUser(credential.user));
  }, []);

  const logOut = useCallback(async () => {
    setError("");
    await signOut(auth);
    await persistSession(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, error, signUp, logIn, logInWithGoogle, logOut }),
    [user, loading, error, signUp, logIn, logInWithGoogle, logOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
