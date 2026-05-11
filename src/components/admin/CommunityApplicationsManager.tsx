import { HandHeart, Mail } from "lucide-react";
import { useCommunityApplications } from "@/hooks/useCommunitySubmissions";

const CommunityApplicationsManager = () => {
  const { data: applications, isLoading, error } = useCommunityApplications();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-black gradient-text-orange flex items-center gap-2">
          <HandHeart className="h-5 w-5 text-primary" /> COMMUNITY APPLICATIONS
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Volunteers, interns, and funders who want to support the cause.
        </p>
      </div>

      {error && <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-muted-foreground">Apply the latest Supabase migration to enable applications.</p>}

      <div className="space-y-3">
        {isLoading ? (
          <p className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">Loading applications...</p>
        ) : !applications?.length ? (
          <p className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">No applications yet.</p>
        ) : (
          applications.map((application) => (
            <div key={application.id} className="liquid-glass rounded-3xl p-4 md:p-5">
              <div className="liquid-content">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-primary/25 px-2 py-1 font-display text-[10px] uppercase tracking-wider text-primary">
                        {application.interest}
                      </span>
                      <span className="text-xs text-muted-foreground">{application.city}, {application.country}</span>
                    </div>
                    <h3 className="font-display text-lg text-foreground">{application.full_name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{application.skills}</p>
                    <p className="mt-2 max-w-2xl text-sm text-foreground/70">{application.message}</p>
                  </div>
                  <a href={`mailto:${application.email}`} className="inline-flex items-center gap-2 text-sm text-primary">
                    <Mail className="h-4 w-4" /> Reply
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommunityApplicationsManager;
