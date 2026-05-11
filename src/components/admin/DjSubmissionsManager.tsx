import { CheckCircle2, Headphones, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAllDjSetSubmissions, useUpdateDjSetSubmission } from "@/hooks/useCommunitySubmissions";

const DjSubmissionsManager = () => {
  const { toast } = useToast();
  const { data: submissions, isLoading, error } = useAllDjSetSubmissions();
  const updateSubmission = useUpdateDjSetSubmission();

  const updateStatus = async (id: string, status: "published" | "rejected") => {
    try {
      await updateSubmission.mutateAsync({ id, status });
      toast({ title: status === "published" ? "Set published" : "Set rejected" });
    } catch (err: any) {
      toast({ title: "Could not update set", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-black gradient-text-orange flex items-center gap-2">
          <Headphones className="h-5 w-5 text-primary" /> DJ SETS
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Review DJ submissions from the community. Publish only the sets that fit the BPM CTRL signal.
        </p>
      </div>

      {error && <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-muted-foreground">Apply the latest Supabase migration to enable DJ submissions.</p>}

      <div className="space-y-3">
        {isLoading ? (
          <p className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">Loading submissions...</p>
        ) : !submissions?.length ? (
          <p className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">No DJ sets submitted yet.</p>
        ) : (
          submissions.map((submission) => (
            <div key={submission.id} className="liquid-glass rounded-3xl p-4 md:p-5">
              <div className="liquid-content">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-primary/25 px-2 py-1 font-display text-[10px] uppercase tracking-wider text-primary">
                        {submission.status}
                      </span>
                      <span className="text-xs text-muted-foreground">{submission.city}, {submission.country}</span>
                    </div>
                    <h3 className="font-display text-lg text-foreground">{submission.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{submission.dj_name} / {submission.genre}</p>
                    {submission.notes && <p className="mt-2 max-w-2xl text-sm text-foreground/70">{submission.notes}</p>}
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-primary">
                      {submission.audio_url && <a href={submission.audio_url} target="_blank" rel="noopener noreferrer">Audio upload</a>}
                      {submission.set_url && <a href={submission.set_url} target="_blank" rel="noopener noreferrer">Set link</a>}
                      <a href={`mailto:${submission.email}`} className="text-muted-foreground hover:text-primary">{submission.email}</a>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="neon" size="sm" onClick={() => updateStatus(submission.id, "published")}>
                      <CheckCircle2 className="h-4 w-4 mr-2" /> Publish
                    </Button>
                    <Button variant="portal" size="sm" onClick={() => updateStatus(submission.id, "rejected")}>
                      <XCircle className="h-4 w-4 mr-2" /> Reject
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DjSubmissionsManager;
