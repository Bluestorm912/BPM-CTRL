import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import type { Tables } from "@/integrations/supabase/types";

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
  const [sessionReady, setSessionReady] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [roles, setRoles] = useState<AppRole[]>([]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsAdmin(hasAdminMetadata(session?.user ?? null));
        setRoles(hasAdminMetadata(session?.user ?? null) ? ["admin"] : []);
        setSessionReady(true);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsAdmin(hasAdminMetadata(session?.user ?? null));
      setRoles(hasAdminMetadata(session?.user ?? null) ? ["admin"] : []);
      setSessionReady(true);
    }).catch(() => {
      setSessionReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const checkAdmin = async () => {
      if (!sessionReady) return;

      if (!user) {
        setIsAdmin(false);
        setRoles([]);
        setRolesLoading(false);
        return;
      }

      setRolesLoading(true);
      const fallbackAdmin = hasAdminMetadata(user);
      const fallbackRoles: AppRole[] = fallbackAdmin ? ["admin"] : [];
      setIsAdmin(fallbackAdmin);
      setRoles(fallbackRoles);

      try {
        const { data: roleRows } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        const dbRoles = ((roleRows || []) as Pick<Tables<"user_roles">, "role">[])
          .map((row) => row.role as AppRole)
          .filter(Boolean);
        const nextRoles = Array.from(new Set([...fallbackRoles, ...dbRoles]));

        if (!cancelled) {
          setRoles(nextRoles);
          setIsAdmin(nextRoles.includes("admin"));
          setRolesLoading(false);
        }
      } catch {
        if (!cancelled) {
          setRoles(fallbackRoles);
          setIsAdmin(fallbackAdmin);
          setRolesLoading(false);
        }
      }
    };

    checkAdmin();

    return () => {
      cancelled = true;
    };
  }, [sessionReady, user]);

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
  const loading = !sessionReady || rolesLoading;

  return { user, session, loading, isAdmin, roles, hasRole, canAccessCms, signIn, signUp, resetPassword, updatePassword, signOut };
};
