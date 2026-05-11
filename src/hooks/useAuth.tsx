import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

const ADMIN_EMAILS = new Set(["michaelseth13@gmail.com", "bpmctrl101@gmail.com"]);

const hasAdminMetadata = (user: User | null) => {
  if (!user) return false;
  const email = user.email?.toLowerCase();
  return (
    (email ? ADMIN_EMAILS.has(email) : false) ||
    user.user_metadata?.role === "admin" ||
    user.app_metadata?.role === "admin"
  );
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsAdmin(hasAdminMetadata(session?.user ?? null));
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsAdmin(hasAdminMetadata(session?.user ?? null));
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      const fallbackAdmin = hasAdminMetadata(user);
      setIsAdmin(fallbackAdmin);

      try {
        const { data, error } = await supabase.rpc("has_role", {
          _user_id: user.id,
          _role: "admin",
        });

        if (!cancelled && !error) {
          setIsAdmin(!!data || fallbackAdmin);
        }
      } catch {
        if (!cancelled) setIsAdmin(fallbackAdmin);
      }
    };

    checkAdmin();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const signIn = async (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email: string, password: string) => {
    return supabase.auth.signUp({ email, password });
  };

  const signOut = async () => {
    return supabase.auth.signOut();
  };

  return { user, session, loading, isAdmin, signIn, signUp, signOut };
};
