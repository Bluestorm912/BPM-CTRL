import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/hooks/useAuth";

export interface StaffMember {
  user_id: string;
  email: string;
  roles: AppRole[];
  created_at: string;
}

export const ROLE_OPTIONS: Array<{ value: AppRole; label: string; description: string }> = [
  { value: "admin", label: "Admin", description: "Full control: roles, content, media, radio, shop, analytics." },
  { value: "editor", label: "Editor", description: "Approves stories and manages public copy/content." },
  { value: "writer", label: "Writer", description: "Writes drafts and sends stories for review." },
  { value: "creator", label: "Creator", description: "Uploads multimedia stories and creative assets." },
  { value: "media_manager", label: "Media Manager", description: "Manages uploads, media library, and transmission assets." },
  { value: "shop_manager", label: "Shop Manager", description: "Manages shop drops and customer/order workspaces." },
  { value: "analyst", label: "Analyst", description: "Views analytics and activity without publishing access." },
  { value: "moderator", label: "Moderator", description: "Helps review submissions and community activity." },
];

export const useStaffMembers = () =>
  useQuery({
    queryKey: ["staff-members"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc("list_staff_members");
      if (error) throw error;
      return (data || []) as StaffMember[];
    },
    retry: false,
  });

export const useAssignStaffRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, role }: { email: string; role: AppRole }) => {
      const { error } = await (supabase as any).rpc("assign_staff_role_by_email", {
        p_email: email.trim().toLowerCase(),
        p_role: role,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff-members"] }),
  });
};

export const useRemoveStaffRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await (supabase as any).rpc("remove_staff_role", {
        p_user_id: userId,
        p_role: role,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff-members"] }),
  });
};
