import { BarChart3, Clock, Eye, MousePointer2, Users } from "lucide-react";
import type { ElementType } from "react";
import { useAnalyticsSummary } from "@/hooks/useAnalytics";

const StatCard = ({ label, value, icon: Icon }: { label: string; value: number | string; icon: ElementType }) => (
  <div className="glow-border-orange rounded-2xl bg-card p-5">
    <div className="flex items-center justify-between mb-4">
      <p className="font-display text-xs tracking-[0.18em] text-muted-foreground uppercase">{label}</p>
      <Icon className="w-4 h-4 text-primary" />
    </div>
    <p className="font-display text-3xl font-black text-foreground">{value}</p>
  </div>
);

const AnalyticsDashboard = () => {
  const { data, isLoading, error } = useAnalyticsSummary();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-32 rounded-2xl bg-card border border-border animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="glow-border-orange rounded-2xl bg-card p-6">
        <h2 className="font-display text-2xl font-black gradient-text-orange mb-2">ANALYTICS SETUP REQUIRED</h2>
        <p className="text-sm text-muted-foreground font-body">
          Apply the Supabase migration to start recording visits and viewing analytics.
        </p>
        <p className="mt-4 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground font-mono">
          {(error as Error).message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-black gradient-text-orange">ANALYTICS</h2>
        <p className="text-muted-foreground text-sm font-body mt-1">
          WordPress-style visit tracking for the last 30 days.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Visits" value={data?.totalVisits || 0} icon={Eye} />
        <StatCard label="Unique Sessions" value={data?.uniqueSessions || 0} icon={Users} />
        <StatCard label="Today" value={data?.todayVisits || 0} icon={Clock} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glow-border-orange rounded-2xl bg-card p-5">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h3 className="font-display text-sm tracking-[0.18em] uppercase text-foreground">Top Pages</h3>
          </div>
          <div className="space-y-3">
            {(data?.topPaths || []).map((item) => (
              <div key={item.path}>
                <div className="flex items-center justify-between gap-3 text-sm mb-1">
                  <span className="font-body text-foreground truncate">{item.path}</span>
                  <span className="font-display text-xs text-primary">{item.visits}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full gradient-bg-orange"
                    style={{ width: `${Math.max(8, (item.visits / Math.max(1, data?.totalVisits || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
            {(data?.topPaths || []).length === 0 && (
              <p className="text-sm text-muted-foreground font-body">No visits recorded yet.</p>
            )}
          </div>
        </div>

        <div className="glow-border-orange rounded-2xl bg-card p-5">
          <div className="flex items-center gap-2 mb-5">
            <MousePointer2 className="w-4 h-4 text-primary" />
            <h3 className="font-display text-sm tracking-[0.18em] uppercase text-foreground">Recent Visits</h3>
          </div>
          <div className="space-y-3">
            {(data?.recentVisits || []).map((visit) => (
              <div key={visit.id} className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-body text-sm text-foreground truncate">{visit.path}</p>
                  <p className="text-[11px] text-muted-foreground shrink-0">
                    {new Date(visit.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {visit.referrer && <p className="text-[11px] text-muted-foreground truncate mt-1">{visit.referrer}</p>}
              </div>
            ))}
            {(data?.recentVisits || []).length === 0 && (
              <p className="text-sm text-muted-foreground font-body">No recent visits yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
