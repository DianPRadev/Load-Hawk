import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

interface SignUpMeta {
  name: string;
  phone?: string;
  cdl_class?: string;
}

interface AuthResult {
  error: string | null;
  needsConfirmation?: boolean;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, meta: SignUpMeta) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  updateUserRole: (role: string) => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, meta: SignUpMeta): Promise<AuthResult> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: meta,
      },
    });

    if (error) return { error: error.message };

    // Supabase returns a user with identities=[] if email confirmation is required
    // and the email is already registered but unconfirmed
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      return { error: "An account with this email already exists." };
    }

    // Check if email confirmation is required
    // If session is null but user exists, email confirmation is pending
    if (data.user && !data.session) {
      // Persist terms acceptance even before confirmation
      await supabase.from("profiles").upsert({
        id: data.user.id,
        phone: meta.phone || "",
        cdl_class: meta.cdl_class || "",
        accepted_terms_at: new Date().toISOString(),
      }, { onConflict: "id" });
      return { error: null, needsConfirmation: true };
    }

    // Auto-confirmed: user + session are both returned
    // The DB trigger will auto-create the profile row
    // Now update the profile with additional fields from signup
    if (data.user && data.session) {
      await supabase.from("profiles").update({
        phone: meta.phone || "",
        cdl_class: meta.cdl_class || "",
        accepted_terms_at: new Date().toISOString(),
      }).eq("id", data.user.id);
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Friendlier error messages
      if (error.message.includes("Invalid login credentials")) {
        return { error: "Incorrect email or password." };
      }
      if (error.message.includes("Email not confirmed")) {
        return { error: "Please check your email and confirm your account first." };
      }
      return { error: error.message };
    }
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Save the user's selected role to their profile
  const updateUserRole = async (role: string) => {
    if (!user) return;
    await supabase.from("profiles").update({ role }).eq("id", user.id);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, updateUserRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
