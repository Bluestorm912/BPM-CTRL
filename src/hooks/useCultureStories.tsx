import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type StoryStatus = "draft" | "in_review" | "published" | "rejected";

export interface CultureStory {
  id: string;
  author_id: string;
  author_name: string;
  author_email: string;
  title: string;
  intro: string;
  body: string;
  category: string;
  tags: string[];
  hero_image: string;
  gallery_images: string[];
  audio_url: string;
  video_url: string;
  status: StoryStatus;
  editor_notes: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CultureStoryInput {
  title: string;
  intro: string;
  body: string;
  category: string;
  tags: string[];
  hero_image: string;
  gallery_images: string[];
  audio_url: string;
  video_url: string;
  status?: StoryStatus;
  editor_notes?: string;
}

const normalizeStory = (story: any): CultureStory => ({
  ...story,
  tags: Array.isArray(story.tags) ? story.tags : [],
  gallery_images: Array.isArray(story.gallery_images) ? story.gallery_images : [],
});

export const usePublishedCultureStories = () =>
  useQuery({
    queryKey: ["culture-stories", "published"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("culture_stories")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (error) throw error;
      return (data || []).map(normalizeStory) as CultureStory[];
    },
    retry: false,
  });

export const useCultureStories = () =>
  useQuery({
    queryKey: ["culture-stories", "studio"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("culture_stories")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return (data || []).map(normalizeStory) as CultureStory[];
    },
    retry: false,
  });

export const useCreateCultureStory = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (story: CultureStoryInput) => {
      if (!user) throw new Error("Sign in required");

      const { data, error } = await (supabase as any)
        .from("culture_stories")
        .insert({
          ...story,
          author_id: user.id,
          author_email: user.email || "",
          author_name: user.user_metadata?.full_name || user.email || "BPM CTRL Creator",
          status: story.status || "draft",
        })
        .select()
        .single();

      if (error) throw error;
      return normalizeStory(data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["culture-stories"] }),
  });
};

export const useUpdateCultureStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CultureStoryInput> & { id: string; published_at?: string | null }) => {
      const { data, error } = await (supabase as any)
        .from("culture_stories")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return normalizeStory(data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["culture-stories"] }),
  });
};

export const useDeleteCultureStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("culture_stories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["culture-stories"] }),
  });
};
