import { ListChecks } from "lucide-react";
import { useActivityLog } from "@/hooks/useActivityLog";

const ActivityLog = () => {
  const { data, isLoading, error } = useActivityLog();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="h-16 rounded-xl bg-card border border-border animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="glow-border-orange rounded-2xl bg-card p-6">
        <h2 className="font-display text-2xl font-black gradient-text-orange mb-2">ACTIVITY LOG SETUP REQUIRED</h2>
        <p className="text-sm text-muted-foreground font-body">
          Apply the Supabase migration to record CMS changes.
        </p>
        <p className="mt-4 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground font-mono">
          {(error as Error).message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-black gradient-text-orange">ACTIVITY LOG</h2>
        <p className="text-muted-foreground text-sm font-body mt-1">
          Track uploads, edits, clones, visibility changes, and deletions.
        </p>
      </div>

      <div className="glow-border-orange rounded-2xl bg-card overflow-hidden">
        {(data || []).map((item) => (
          <div key={item.id} className="flex items-start gap-4 px-5 py-4 border-b border-border last:border-b-0">
            <div className="w-9 h-9 rounded-lg border border-primary/25 bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <ListChecks className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1">
                <p className="font-body text-sm text-foreground">{item.summary}</p>
                <p className="text-[11px] text-muted-foreground shrink-0">
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </div>
              <p className="font-display text-[10px] tracking-[0.18em] text-primary uppercase mt-1">
                {item.action} / {item.entity_type} {item.actor_email ? `by ${item.actor_email}` : ""}
              </p>
            </div>
          </div>
        ))}
        {(data || []).length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground font-body">
            No CMS activity has been recorded yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
