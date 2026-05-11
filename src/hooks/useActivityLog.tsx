import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface ActivityLogItem {
  id: string;
  actor_id: string | null;
  actor_email: string;
  action: string;
  entity_type: string;
  entity_id: string;
  summary: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export const useActivityLog = () =>
  useQuery({
    queryKey: ["admin-activity-log"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("admin_activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(80);

      if (error) throw error;
      return (data || []) as ActivityLogItem[];
    },
    retry: false,
  });

export const useLogActivity = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: {
      action: string;
      entityType: string;
      entityId?: string;
      summary: string;
      metadata?: Record<string, unknown>;
    }) => {
      const { error } = await (supabase as any).from("admin_activity_log").insert({
        actor_id: user?.id || null,
        actor_email: user?.email || "",
        action: item.action,
        entity_type: item.entityType,
        entity_id: item.entityId || "",
        summary: item.summary,
        metadata: item.metadata || {},
      });

      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-activity-log"] }),
  });
};
