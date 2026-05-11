import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Edit, FileText, ImageIcon, Music, Plus, Save, Send, Trash2, Upload, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useSectionContent, useCreateContent, useUpdateContent, getContentValue } from "@/hooks/useSiteContent";
import { uploadAssetFile } from "@/hooks/useSiteAssets";
import {
  useCreateCultureStory,
  useCultureStories,
  useDeleteCultureStory,
  useUpdateCultureStory,
  type CultureStory,
  type StoryStatus,
} from "@/hooks/useCultureStories";
import { useLogActivity } from "@/hooks/useActivityLog";

interface ArticleTemplate {
  titleMaxWords: number;
  introMaxWords: number;
  bodyMaxWords: number;
  heroWidth: number;
  heroHeight: number;
  galleryWidth: number;
  galleryHeight: number;
  galleryCount: number;
}

interface StoryFormState {
  title: string;
  intro: string;
  body: string;
  category: string;
  tags: string;
  hero_image: string;
  gallery_images: string[];
  audio_url: string;
  video_url: string;
  editor_notes: string;
}

const DEFAULT_TEMPLATE: ArticleTemplate = {
  titleMaxWords: 12,
  introMaxWords: 45,
  bodyMaxWords: 500,
  heroWidth: 1600,
  heroHeight: 900,
  galleryWidth: 1080,
  galleryHeight: 1080,
  galleryCount: 2,
};

const emptyForm = (galleryCount: number): StoryFormState => ({
  title: "",
  intro: "",
  body: "",
  category: "Culture",
  tags: "",
  hero_image: "",
  gallery_images: Array.from({ length: galleryCount }, () => ""),
  audio_url: "",
  video_url: "",
  editor_notes: "",
});

const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;
const clampGalleryCount = (value: number) => Math.max(1, Math.min(4, value || 1));
const parseTags = (value: string) => value.split(",").map((tag) => tag.trim()).filter(Boolean);

const safeJson = <T,>(value: string, fallback: T): T => {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const statusLabel: Record<StoryStatus, string> = {
  draft: "Draft",
  in_review: "In Review",
  published: "Published",
  rejected: "Needs Work",
};

const ArticlesManager = () => {
  const { toast } = useToast();
  const { user, hasRole } = useAuth();
  const canPublish = hasRole("admin", "editor");
  const canEditTemplate = hasRole("admin", "editor");
  const { data: content } = useSectionContent("articles");
  const { data: stories, isLoading, error } = useCultureStories();
  const createContent = useCreateContent();
  const updateContent = useUpdateContent();
  const createStory = useCreateCultureStory();
  const updateStory = useUpdateCultureStory();
  const deleteStory = useDeleteCultureStory();
  const logActivity = useLogActivity();

  const [sectionTagline, setSectionTagline] = useState("Field Notes");
  const [sectionTitle, setSectionTitle] = useState("CULTURE STORIES");
  const [sectionDescription, setSectionDescription] = useState("Stories, interviews, field notes, photos, audio, and video from the BPM CTRL network.");
  const [template, setTemplate] = useState<ArticleTemplate>(DEFAULT_TEMPLATE);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<StoryFormState>(emptyForm(DEFAULT_TEMPLATE.galleryCount));
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<Array<File | null>>(Array.from({ length: DEFAULT_TEMPLATE.galleryCount }, () => null));
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!content) return;
    setSectionTagline(getContentValue(content, "articles_tagline", "Field Notes"));
    setSectionTitle(getContentValue(content, "articles_title", "CULTURE STORIES"));
    setSectionDescription(getContentValue(content, "articles_description", "Stories, interviews, field notes, photos, audio, and video from the BPM CTRL network."));
    const parsedTemplate = safeJson<ArticleTemplate>(getContentValue(content, "articles_template", JSON.stringify(DEFAULT_TEMPLATE)), DEFAULT_TEMPLATE);
    setTemplate({ ...DEFAULT_TEMPLATE, ...parsedTemplate, galleryCount: clampGalleryCount(parsedTemplate.galleryCount || DEFAULT_TEMPLATE.galleryCount) });
  }, [content]);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      gallery_images: Array.from({ length: clampGalleryCount(template.galleryCount) }, (_, index) => current.gallery_images[index] || ""),
    }));
    setGalleryFiles((current) => Array.from({ length: clampGalleryCount(template.galleryCount) }, (_, index) => current[index] || null));
  }, [template.galleryCount]);

  const visibleStories = useMemo(() => {
    if (!stories) return [];
    if (canPublish) return stories;
    return stories.filter((story) => story.author_id === user?.id);
  }, [canPublish, stories, user?.id]);

  const stats = useMemo(() => ({
    title: countWords(form.title),
    intro: countWords(form.intro),
    body: countWords(form.body),
  }), [form.body, form.intro, form.title]);

  const upsertContentValue = async (key: string, value: string, type: "text" | "json", sortOrder: number) => {
    const existing = content?.find((row) => row.content_key === key);
    if (existing) {
      await updateContent.mutateAsync({ id: existing.id, content_value: value, content_type: type, sort_order: sortOrder });
      return;
    }
    await createContent.mutateAsync({ section: "articles", content_key: key, content_value: value, content_type: type, sort_order: sortOrder });
  };

  const uploadIfProvided = async (file: File | null, path: string, fallbackUrl: string) => {
    if (!file) return fallbackUrl.trim();
    const { publicUrl } = await uploadAssetFile(file, path);
    return publicUrl;
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm(clampGalleryCount(template.galleryCount)));
    setHeroFile(null);
    setGalleryFiles(Array.from({ length: clampGalleryCount(template.galleryCount) }, () => null));
    setAudioFile(null);
    setVideoFile(null);
  };

  const validateWordCounts = () => {
    if (stats.title > template.titleMaxWords) return `Title must be ${template.titleMaxWords} words or fewer.`;
    if (stats.intro > template.introMaxWords) return `Intro must be ${template.introMaxWords} words or fewer.`;
    if (stats.body > template.bodyMaxWords) return `Body must be ${template.bodyMaxWords} words or fewer.`;
    return "";
  };

  const saveTemplate = async () => {
    if (!canEditTemplate) return;
    setSaving(true);
    try {
      const nextTemplate = { ...template, galleryCount: clampGalleryCount(template.galleryCount) };
      await upsertContentValue("articles_template", JSON.stringify(nextTemplate), "json", 0);
      await upsertContentValue("articles_tagline", sectionTagline, "text", 2);
      await upsertContentValue("articles_title", sectionTitle, "text", 3);
      await upsertContentValue("articles_description", sectionDescription, "text", 4);
      toast({ title: "Story section saved" });
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const saveStory = async (nextStatus: StoryStatus) => {
    const errorMessage = validateWordCounts();
    if (errorMessage) {
      toast({ title: "Tighten the copy", description: errorMessage, variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const storyId = editingId || crypto.randomUUID();
      const hero_image = await uploadIfProvided(heroFile, `articles/${storyId}/hero-${Date.now()}`, form.hero_image);
      const audio_url = await uploadIfProvided(audioFile, `articles/${storyId}/audio-${Date.now()}`, form.audio_url);
      const video_url = await uploadIfProvided(videoFile, `articles/${storyId}/video-${Date.now()}`, form.video_url);
      const gallery_images = await Promise.all(
        form.gallery_images.map((url, index) =>
          uploadIfProvided(galleryFiles[index] || null, `articles/${storyId}/gallery-${index + 1}-${Date.now()}`, url)
        )
      );

      const payload = {
        title: form.title.trim(),
        intro: form.intro.trim(),
        body: form.body.trim(),
        category: form.category.trim() || "Culture",
        tags: parseTags(form.tags),
        hero_image,
        gallery_images: gallery_images.filter(Boolean),
        audio_url,
        video_url,
        editor_notes: form.editor_notes.trim(),
        status: nextStatus,
        published_at: nextStatus === "published" ? new Date().toISOString() : null,
      };

      if (editingId) {
        await updateStory.mutateAsync({ id: editingId, ...payload });
      } else {
        await createStory.mutateAsync(payload);
      }

      logActivity.mutate({
        action: editingId ? "update" : "create",
        entityType: "culture_story",
        entityId: editingId || storyId,
        summary: `${editingId ? "Updated" : "Created"} story "${payload.title}" as ${statusLabel[nextStatus]}`,
        metadata: { status: nextStatus, category: payload.category },
      });

      toast({ title: nextStatus === "published" ? "Story published" : nextStatus === "in_review" ? "Story sent for review" : "Draft saved" });
      resetForm();
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const editStory = (story: CultureStory) => {
    setEditingId(story.id);
    setForm({
      title: story.title,
      intro: story.intro,
      body: story.body,
      category: story.category || "Culture",
      tags: story.tags.join(", "),
      hero_image: story.hero_image || "",
      gallery_images: Array.from({ length: clampGalleryCount(template.galleryCount) }, (_, index) => story.gallery_images[index] || ""),
      audio_url: story.audio_url || "",
      video_url: story.video_url || "",
      editor_notes: story.editor_notes || "",
    });
  };

  const removeStory = async (story: CultureStory) => {
    if (!confirm("Delete this story?")) return;
    await deleteStory.mutateAsync(story.id);
    toast({ title: "Story deleted" });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-black gradient-text-orange flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" /> EDITORIAL DESK
        </h2>
        <p className="text-muted-foreground text-sm font-body mt-1">
          Onboard writers and creators, collect drafts, review submissions, and publish culture stories from anywhere.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-muted-foreground">
          Story table is not installed yet. Apply the latest Supabase migration to enable role-based story submissions.
        </div>
      )}

      {canEditTemplate && (
        <div className="liquid-glass rounded-3xl p-6">
          <div className="liquid-content space-y-5">
            <h3 className="font-display text-sm font-bold text-foreground tracking-wider uppercase">Public Section & Brief</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Eyebrow</Label>
                <Input value={sectionTagline} onChange={(event) => setSectionTagline(event.target.value)} className="mt-1 bg-muted border-border" />
              </div>
              <div>
                <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Title</Label>
                <Input value={sectionTitle} onChange={(event) => setSectionTitle(event.target.value)} className="mt-1 bg-muted border-border" />
              </div>
              <div>
                <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Description</Label>
                <Input value={sectionDescription} onChange={(event) => setSectionDescription(event.target.value)} className="mt-1 bg-muted border-border" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                ["Title Max Words", "titleMaxWords"],
                ["Intro Max Words", "introMaxWords"],
                ["Body Max Words", "bodyMaxWords"],
                ["Gallery Slots", "galleryCount"],
              ].map(([label, key]) => (
                <div key={key}>
                  <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">{label}</Label>
                  <Input
                    type="number"
                    value={(template as any)[key]}
                    onChange={(event) => setTemplate({ ...template, [key]: parseInt(event.target.value, 10) || 0 })}
                    className="mt-1 bg-muted border-border"
                  />
                </div>
              ))}
            </div>
            <Button variant="neon" onClick={saveTemplate} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Brief"}
            </Button>
          </div>
        </div>
      )}

      <div className="liquid-glass rounded-3xl p-6">
        <div className="liquid-content">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h3 className="font-display text-sm font-bold text-foreground tracking-wider uppercase">
              {editingId ? "Edit Story" : "New Story"}
            </h3>
            <Button variant="portal" type="button" onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" /> New Draft
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Title</Label>
              <Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="mt-1 bg-muted border-border" />
              <p className="mt-1 text-[11px] text-muted-foreground">{stats.title}/{template.titleMaxWords} words</p>
            </div>
            <div>
              <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Intro</Label>
              <Textarea value={form.intro} onChange={(event) => setForm({ ...form, intro: event.target.value })} className="mt-1 bg-muted border-border" rows={3} />
              <p className="mt-1 text-[11px] text-muted-foreground">{stats.intro}/{template.introMaxWords} words</p>
            </div>
            <div>
              <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Story</Label>
              <Textarea value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} className="mt-1 bg-muted border-border" rows={9} />
              <p className="mt-1 text-[11px] text-muted-foreground">{stats.body}/{template.bodyMaxWords} words</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Category</Label>
                <Input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="mt-1 bg-muted border-border" />
              </div>
              <div>
                <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Tags</Label>
                <Input value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} className="mt-1 bg-muted border-border" placeholder="Lagos, fashion, dance" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                  <ImageIcon className="w-3.5 h-3.5" /> Hero Image URL
                </Label>
                <Input value={form.hero_image} onChange={(event) => setForm({ ...form, hero_image: event.target.value })} className="mt-1 bg-muted border-border" />
                <label className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted hover:bg-muted/80 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-primary" />
                  <span className="text-xs font-body text-foreground">{heroFile ? heroFile.name : "Upload hero image"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => setHeroFile(event.target.files?.[0] || null)} />
                </label>
              </div>
              <div>
                <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                  <Music className="w-3.5 h-3.5" /> Audio URL
                </Label>
                <Input value={form.audio_url} onChange={(event) => setForm({ ...form, audio_url: event.target.value })} className="mt-1 bg-muted border-border" />
                <label className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted hover:bg-muted/80 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-primary" />
                  <span className="text-xs font-body text-foreground">{audioFile ? audioFile.name : "Upload audio"}</span>
                  <input type="file" accept="audio/*" className="hidden" onChange={(event) => setAudioFile(event.target.files?.[0] || null)} />
                </label>
              </div>
            </div>

            <div>
              <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase flex items-center gap-2 mb-2">
                <ImageIcon className="w-3.5 h-3.5" /> Gallery
              </Label>
              <div className="space-y-3">
                {form.gallery_images.map((imageUrl, index) => (
                  <div key={`gallery-${index}`} className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2">
                    <Input
                      value={imageUrl}
                      onChange={(event) => {
                        const next = [...form.gallery_images];
                        next[index] = event.target.value;
                        setForm({ ...form, gallery_images: next });
                      }}
                      className="bg-muted border-border"
                      placeholder={`Gallery image ${index + 1} URL`}
                    />
                    <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted hover:bg-muted/80 cursor-pointer transition-colors">
                      <Upload className="w-4 h-4 text-primary" />
                      <span className="text-xs font-body text-foreground whitespace-nowrap">{galleryFiles[index]?.name || `Upload ${index + 1}`}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                          const next = [...galleryFiles];
                          next[index] = event.target.files?.[0] || null;
                          setGalleryFiles(next);
                        }}
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                <Video className="w-3.5 h-3.5" /> Video URL
              </Label>
              <Input value={form.video_url} onChange={(event) => setForm({ ...form, video_url: event.target.value })} className="mt-1 bg-muted border-border" />
              <label className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted hover:bg-muted/80 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-primary" />
                <span className="text-xs font-body text-foreground">{videoFile ? videoFile.name : "Upload video"}</span>
                <input type="file" accept="video/*" className="hidden" onChange={(event) => setVideoFile(event.target.files?.[0] || null)} />
              </label>
            </div>

            {canPublish && (
              <div>
                <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Editor Notes</Label>
                <Textarea value={form.editor_notes} onChange={(event) => setForm({ ...form, editor_notes: event.target.value })} className="mt-1 bg-muted border-border" rows={3} />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <Button variant="portal" type="button" disabled={saving} onClick={() => saveStory("draft")}>
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button variant="neon" type="button" disabled={saving} onClick={() => saveStory(canPublish ? "published" : "in_review")}>
                {canPublish ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                {canPublish ? "Publish" : "Send for Review"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-display text-sm font-bold text-foreground tracking-wider uppercase">
          {canPublish ? "All Stories" : "My Stories"}
        </h3>
        {isLoading ? (
          <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">Loading stories...</div>
        ) : visibleStories.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">No stories yet.</div>
        ) : (
          visibleStories.map((story) => (
            <div key={story.id} className="rounded-2xl border border-border bg-card/70 p-4 md:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-primary/25 px-2 py-1 font-display text-[10px] uppercase tracking-wider text-primary">
                      {statusLabel[story.status]}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{story.author_name || story.author_email}</span>
                  </div>
                  <h4 className="font-display text-base text-foreground">{story.title}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{story.intro}</p>
                  {story.editor_notes && <p className="mt-2 text-xs text-primary">Editor note: {story.editor_notes}</p>}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => editStory(story)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  {(canPublish || story.status !== "published") && (
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => removeStory(story)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ArticlesManager;
