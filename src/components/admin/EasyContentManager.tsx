import { useEffect, useMemo, useState } from "react";
import type { ElementType } from "react";
import { AlertTriangle, Database, FileText, Radio, Save, Sparkles, Ticket, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  getContentValue,
  useAllSiteContent,
  useCreateContent,
  useUpdateContent,
  type SiteContent,
} from "@/hooks/useSiteContent";
import { useLogActivity } from "@/hooks/useActivityLog";

type FieldType = "text" | "textarea" | "url";

interface EasyField {
  key: string;
  label: string;
  type?: FieldType;
  placeholder?: string;
}

interface EasySection {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  icon: ElementType;
  fields: EasyField[];
}

const EASY_SECTIONS: EasySection[] = [
  {
    id: "hero",
    title: "Hero Signal",
    eyebrow: "First screen",
    description: "Main landing copy and primary calls to action.",
    icon: Zap,
    fields: [
      { key: "hero_tagline", label: "Tagline" },
      { key: "hero_title", label: "Main Title" },
      { key: "hero_subtitle_1", label: "Subtitle Line 1" },
      { key: "hero_subtitle_2", label: "Subtitle Line 2" },
      { key: "hero_cta_primary", label: "Primary Button" },
      { key: "hero_cta_primary_href", label: "Primary Button Link", type: "url", placeholder: "#signal" },
      { key: "hero_cta_secondary", label: "Ticket Button" },
    ],
  },
  {
    id: "event",
    title: "Next Event",
    eyebrow: "Tickets and details",
    description: "Everything shown in the upcoming event card.",
    icon: Ticket,
    fields: [
      { key: "event_tagline", label: "Small Label" },
      { key: "event_name", label: "Event Name" },
      { key: "event_description", label: "Event Description", type: "textarea" },
      { key: "event_date", label: "Date" },
      { key: "event_location", label: "Location" },
      { key: "event_capacity", label: "Capacity" },
      { key: "event_lineup", label: "Lineup" },
      { key: "event_cta_primary", label: "Primary Button" },
      { key: "event_cta_secondary", label: "Secondary Button" },
    ],
  },
  {
    id: "broadcast",
    title: "Broadcast",
    eyebrow: "Media section",
    description: "Title and intro for sets, clips, interviews, and uploaded media.",
    icon: Radio,
    fields: [
      { key: "broadcast_tagline", label: "Small Label" },
      { key: "broadcast_title", label: "Section Title" },
      { key: "broadcast_description", label: "Description", type: "textarea" },
    ],
  },
  {
    id: "style",
    title: "Style Index",
    eyebrow: "Fashion culture",
    description: "Copy above the style gallery. Images are managed in Assets.",
    icon: Sparkles,
    fields: [
      { key: "style_tagline", label: "Small Label" },
      { key: "style_title", label: "Section Title" },
      { key: "style_description", label: "Description", type: "textarea" },
    ],
  },
  {
    id: "archive",
    title: "Archive",
    eyebrow: "Past drops",
    description: "Copy above the transmission archive. Media is managed in Assets.",
    icon: FileText,
    fields: [
      { key: "archive_tagline", label: "Small Label" },
      { key: "archive_title", label: "Section Title" },
      { key: "archive_description", label: "Description", type: "textarea" },
    ],
  },
  {
    id: "community",
    title: "Community Mission",
    eyebrow: "Brand story",
    description: "The culture statement shown near the bottom of the page.",
    icon: Users,
    fields: [
      { key: "community_title_1", label: "Headline Line 1" },
      { key: "community_title_2", label: "Headline Line 2" },
      { key: "community_body_1", label: "Paragraph 1", type: "textarea" },
      { key: "community_body_2", label: "Paragraph 2", type: "textarea" },
      { key: "community_body_3", label: "Closing Line" },
    ],
  },
  {
    id: "email",
    title: "Email Signup",
    eyebrow: "Footer capture",
    description: "Copy for the email capture panel.",
    icon: Radio,
    fields: [
      { key: "email_title", label: "Panel Title" },
      { key: "email_description", label: "Description", type: "textarea" },
      { key: "email_cta", label: "Button Text" },
    ],
  },
];

const flattenFields = () =>
  EASY_SECTIONS.flatMap((section) =>
    section.fields.map((field, index) => ({
      ...field,
      section: section.id,
      sortOrder: index,
    }))
  );

const EasyContentManager = () => {
  const { toast } = useToast();
  const { data: allContent, isLoading, error } = useAllSiteContent();
  const updateContent = useUpdateContent();
  const createContent = useCreateContent();
  const logActivity = useLogActivity();
  const [activeSection, setActiveSection] = useState(EASY_SECTIONS[0].id);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const fieldIndex = useMemo(() => flattenFields(), []);
  const contentByKey = useMemo(() => {
    const map = new Map<string, SiteContent>();
    (allContent || []).forEach((item) => map.set(`${item.section}:${item.content_key}`, item));
    return map;
  }, [allContent]);

  useEffect(() => {
    const next: Record<string, string> = {};
    EASY_SECTIONS.forEach((section) => {
      const sectionContent = (allContent || []).filter((item) => item.section === section.id);
      section.fields.forEach((field) => {
        next[`${section.id}:${field.key}`] = getContentValue(sectionContent, field.key, "");
      });
    });
    setValues(next);
  }, [allContent]);

  const active = EASY_SECTIONS.find((section) => section.id === activeSection) || EASY_SECTIONS[0];
  const ActiveIcon = active.icon;

  const saveSection = async () => {
    setSaving(true);
    try {
      const sectionFields = fieldIndex.filter((field) => field.section === active.id);
      for (const field of sectionFields) {
        const mapKey = `${active.id}:${field.key}`;
        const existing = contentByKey.get(mapKey);
        const value = values[mapKey] || "";

        if (existing) {
          await updateContent.mutateAsync({
            id: existing.id,
            content_value: value,
            content_type: "text",
            sort_order: field.sortOrder,
            is_active: true,
          });
        } else {
          await createContent.mutateAsync({
            section: active.id,
            content_key: field.key,
            content_value: value,
            content_type: "text",
            sort_order: field.sortOrder,
          });
        }
      }

      toast({ title: `${active.title} saved` });
      logActivity.mutate({
        action: "update",
        entityType: "content_section",
        entityId: active.id,
        summary: `Updated frontend section "${active.title}"`,
        metadata: { section: active.id },
      });
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <aside className="space-y-3">
          <div className="h-8 w-48 rounded bg-muted animate-pulse" />
          <div className="h-4 w-64 rounded bg-muted/70 animate-pulse" />
          <div className="glow-border-orange rounded-2xl bg-card p-2 space-y-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-14 rounded-xl bg-muted/60 animate-pulse" />
            ))}
          </div>
        </aside>
        <section className="glow-border-orange rounded-2xl bg-card p-5 md:p-7">
          <div className="flex items-start justify-between gap-4 mb-8">
            <div className="space-y-3">
              <div className="h-3 w-32 rounded bg-primary/30 animate-pulse" />
              <div className="h-8 w-72 rounded bg-muted animate-pulse" />
              <div className="h-4 w-96 max-w-full rounded bg-muted/70 animate-pulse" />
            </div>
            <div className="h-10 w-32 rounded bg-primary/20 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                <div className="h-10 rounded bg-muted/70 animate-pulse" />
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glow-border-orange rounded-2xl bg-card p-6 md:p-8 relative overflow-hidden">
        <div className="scanline absolute inset-0 pointer-events-none opacity-10 rounded-2xl" />
        <div className="relative z-10 flex flex-col md:flex-row gap-5">
          <div className="w-12 h-12 rounded-xl border border-primary/25 bg-primary/10 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-primary" />
              <p className="font-display text-xs tracking-[0.22em] text-primary uppercase">CMS setup required</p>
            </div>
            <h2 className="font-display text-2xl font-black text-foreground mb-2">Content database is not installed yet</h2>
            <p className="text-sm text-muted-foreground font-body max-w-2xl">
              Apply the BPM CTRL Supabase migration to enable this editor.
            </p>
            <p className="mt-4 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground font-mono">
              {(error as Error).message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
      <aside className="space-y-3">
        <div>
          <h2 className="font-display text-2xl font-black gradient-text-orange">FRONTEND STUDIO</h2>
          <p className="text-muted-foreground text-sm font-body mt-1">
            Edit the words visitors see on the website.
          </p>
        </div>

        <div className="glow-border-orange rounded-2xl bg-card p-2">
          {EASY_SECTIONS.map((section) => {
            const Icon = section.icon;
            const selected = section.id === active.id;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
                  selected ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
              >
                <span className="w-9 h-9 rounded-lg border border-primary/20 bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </span>
                <span>
                  <span className="block font-display text-xs tracking-[0.16em] uppercase">{section.title}</span>
                  <span className="block text-[11px] font-body mt-0.5">{section.eyebrow}</span>
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="glow-border-orange rounded-2xl bg-card p-5 md:p-7 relative overflow-hidden">
        <div className="scanline absolute inset-0 pointer-events-none opacity-10 rounded-2xl" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-7">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl border border-primary/25 bg-primary/10 flex items-center justify-center">
                <ActiveIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-display text-[10px] tracking-[0.28em] text-primary uppercase">{active.eyebrow}</p>
                <h3 className="font-display text-2xl md:text-3xl font-black text-foreground mt-1">{active.title}</h3>
                <p className="text-sm text-muted-foreground font-body mt-1 max-w-xl">{active.description}</p>
              </div>
            </div>
            <Button variant="neon" onClick={saveSection} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Section"}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {active.fields.map((field) => {
              const valueKey = `${active.id}:${field.key}`;
              const isLong = field.type === "textarea";
              return (
                <div key={field.key} className={isLong ? "md:col-span-2" : ""}>
                  <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">
                    {field.label}
                  </Label>
                  {isLong ? (
                    <Textarea
                      value={values[valueKey] || ""}
                      onChange={(event) => setValues((current) => ({ ...current, [valueKey]: event.target.value }))}
                      className="mt-1 bg-muted border-border min-h-[130px]"
                      placeholder={field.placeholder}
                    />
                  ) : (
                    <Input
                      type={field.type === "url" ? "text" : "text"}
                      value={values[valueKey] || ""}
                      onChange={(event) => setValues((current) => ({ ...current, [valueKey]: event.target.value }))}
                      className="mt-1 bg-muted border-border"
                      placeholder={field.placeholder}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default EasyContentManager;
