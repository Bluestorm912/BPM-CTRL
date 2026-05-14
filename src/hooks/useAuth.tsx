import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

const ADMIN_EMAILS = new Set(["michaelseth13@gmail.com", "bpmctrl101@gmail.com"]);
export type AppRole =
  | "admin"
  | "editor"
  | "writer"
  | "creator"
  | "media_manager"
  | "shop_manager"
  | "analyst"
  | "moderator"
  | "user";

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
  const [roles, setRoles] = useState<AppRole[]>([]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsAdmin(hasAdminMetadata(session?.user ?? null));
        setRoles(hasAdminMetadata(session?.user ?? null) ? ["admin"] : []);
        setLoading(!!session?.user);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsAdmin(hasAdminMetadata(session?.user ?? null));
      setRoles(hasAdminMetadata(session?.user ?? null) ? ["admin"] : []);
      setLoading(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        setRoles([]);
        setLoading(false);
        return;
      }

      const fallbackAdmin = hasAdminMetadata(user);
      const fallbackRoles: AppRole[] = fallbackAdmin ? ["admin"] : [];
      setIsAdmin(fallbackAdmin);
      setRoles(fallbackRoles);

      try {
        const { data: roleRows } = await (supabase as any)
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        const dbRoles = ((roleRows || []).map((row: any) => row.role) as AppRole[]).filter(Boolean);
        const nextRoles = Array.from(new Set([...fallbackRoles, ...dbRoles]));

        if (!cancelled) {
          setRoles(nextRoles);
          setIsAdmin(nextRoles.includes("admin"));
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setRoles(fallbackRoles);
          setIsAdmin(fallbackAdmin);
          setLoading(false);
        }
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
    return supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/admin/login`,
      },
    });
  };

  const resetPassword = async (email: string) => {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/login`,
    });
  };

  const updatePassword = async (password: string) => {
    return supabase.auth.updateUser({ password });
  };

  const signOut = async () => {
    return supabase.auth.signOut();
  };

  const hasRole = (...allowed: AppRole[]) => roles.some((role) => allowed.includes(role));
  const canAccessCms = hasRole("admin", "editor", "writer", "creator", "media_manager", "shop_manager", "analyst", "moderator");

  return { user, session, loading, isAdmin, roles, hasRole, canAccessCms, signIn, signUp, resetPassword, updatePassword, signOut };
};
