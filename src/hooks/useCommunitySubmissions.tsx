import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SubmissionStatus = "pending" | "published" | "rejected";

export interface DjSetSubmission {
  id: string;
  dj_name: string;
  email: string;
  city: string;
  country: string;
  title: string;
  genre: string;
  set_url: string;
  audio_url: string;
  cover_image_url: string;
  notes: string;
  status: SubmissionStatus;
  admin_notes: string;
  created_at: string;
  updated_at: string;
}

export interface CommunityApplication {
  id: string;
  full_name: string;
  email: string;
  city: string;
  country: string;
  interest: "volunteer" | "intern" | "fund";
  skills: string;
  message: string;
  status: "new" | "contacted" | "closed";
  created_at: string;
}

export const usePublishedDjSets = () =>
  useQuery({
    queryKey: ["dj-set-submissions", "published"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("dj_set_submissions")
        .select("*")
        .eq("status", "published")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data || []) as DjSetSubmission[];
    },
    retry: false,
  });

export const useAllDjSetSubmissions = () =>
  useQuery({
    queryKey: ["dj-set-submissions", "admin"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("dj_set_submissions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as DjSetSubmission[];
    },
    retry: false,
  });

export const useSubmitDjSet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (submission: Partial<DjSetSubmission>) => {
      const { error } = await (supabase as any).from("dj_set_submissions").insert({
        ...submission,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dj-set-submissions"] }),
  });
};

export const useUpdateDjSetSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DjSetSubmission> & { id: string }) => {
      const { error } = await (supabase as any)
        .from("dj_set_submissions")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dj-set-submissions"] }),
  });
};

export const useCommunityApplications = () =>
  useQuery({
    queryKey: ["community-applications"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("community_applications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as CommunityApplication[];
    },
    retry: false,
  });

export const useSubmitCommunityApplication = () =>
  useMutation({
    mutationFn: async (application: Omit<CommunityApplication, "id" | "status" | "created_at">) => {
      const { error } = await (supabase as any).from("community_applications").insert(application);
      if (error) throw error;
    },
  });

export const uploadCommunityFile = async (file: File, path: string) => {
  const { data, error } = await supabase.storage.from("community-submissions").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data: publicData } = supabase.storage.from("community-submissions").getPublicUrl(data.path);
  return publicData.publicUrl;
};
