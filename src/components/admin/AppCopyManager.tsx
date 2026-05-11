import { useEffect, useMemo, useState } from "react";
import { FileText, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useSectionContent, useCreateContent, useUpdateContent } from "@/hooks/useSiteContent";
import { dictionaries, languages } from "@/i18n/copy";

interface CopyField {
  key: string;
  value: string;
  label: string;
}

const flattenCopy = (source: any, prefix = ""): CopyField[] =>
  Object.entries(source).flatMap(([key, value]) => {
    const nextKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      return [{ key: nextKey, value, label: nextKey.split(".").join(" / ") }];
    }
    if (Array.isArray(value)) return [];
    if (value && typeof value === "object") return flattenCopy(value, nextKey);
    return [];
  });

const AppCopyManager = () => {
  const { toast } = useToast();
  const { data: content, isLoading } = useSectionContent("app_copy");
  const createContent = useCreateContent();
  const updateContent = useUpdateContent();
  const [activeLanguage, setActiveLanguage] = useState("en");
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const fields = useMemo(() => flattenCopy((dictionaries as any).en), []);

  useEffect(() => {
    const next: Record<string, string> = {};
    fields.forEach((field) => {
      const contentKey = `${activeLanguage}.${field.key}`;
      const existing = content?.find((item) => item.content_key === contentKey);
      next[field.key] = existing?.content_value ?? field.value;
    });
    setValues(next);
  }, [activeLanguage, content, fields]);

  const save = async () => {
    setSaving(true);
    try {
      for (const [index, field] of fields.entries()) {
        const contentKey = `${activeLanguage}.${field.key}`;
        const existing = content?.find((item) => item.content_key === contentKey);
        const value = values[field.key] ?? "";
        if (existing) {
          await updateContent.mutateAsync({ id: existing.id, content_value: value, content_type: "text", sort_order: index });
        } else {
          await createContent.mutateAsync({
            section: "app_copy",
            content_key: contentKey,
            content_value: value,
            content_type: "text",
            sort_order: index,
          });
        }
      }
      toast({ title: "App copy saved", description: "Public text will update without a code deploy." });
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-display text-2xl font-black gradient-text-orange flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> APP COPY
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Edit public site words from the backend. This keeps the app ready for future language expansion without showing a language button.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {languages.map((language) => (
            <button
              key={language.code}
              type="button"
              onClick={() => setActiveLanguage(language.code)}
              className={`rounded-full border px-3 py-2 font-display text-xs uppercase tracking-wider ${
                activeLanguage === language.code ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"
              }`}
            >
              {language.name}
            </button>
          ))}
          <Button variant="neon" onClick={save} disabled={saving || isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Copy"}
          </Button>
        </div>
      </div>

      <div className="liquid-glass rounded-3xl p-5 md:p-6">
        <div className="liquid-content grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field) => {
            const long = (values[field.key] || field.value).length > 90;
            return (
              <div key={field.key} className={long ? "md:col-span-2" : ""}>
                <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">{field.label}</Label>
                {long ? (
                  <Textarea
                    value={values[field.key] || ""}
                    onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))}
                    className="mt-1 min-h-24 bg-muted border-border"
                  />
                ) : (
                  <Input
                    value={values[field.key] || ""}
                    onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))}
                    className="mt-1 bg-muted border-border"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AppCopyManager;
