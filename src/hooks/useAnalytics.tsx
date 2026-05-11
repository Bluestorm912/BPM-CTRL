import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const VISIT_SESSION_KEY = "bpmctrl_visit_session_id";

const getSessionId = () => {
  const existing = sessionStorage.getItem(VISIT_SESSION_KEY);
  if (existing) return existing;
  const next = crypto.randomUUID();
  sessionStorage.setItem(VISIT_SESSION_KEY, next);
  return next;
};

export const useTrackPageVisit = () => {
  const location = useLocation();

  useEffect(() => {
    const track = async () => {
      try {
        await (supabase as any).from("page_visits").insert({
          path: `${location.pathname || "/"}${location.search || ""}`,
          title: document.title || "BPM CTRL",
          referrer: document.referrer || "",
          user_agent: navigator.userAgent || "",
          session_id: getSessionId(),
          metadata: {
            language: navigator.language,
            screen: `${window.screen.width}x${window.screen.height}`,
          },
        });
      } catch {
        // Analytics should never block the public site.
      }
    };

    track();
  }, [location.pathname, location.search]);
};

export interface AnalyticsSummary {
  totalVisits: number;
  uniqueSessions: number;
  todayVisits: number;
  topPaths: Array<{ path: string; visits: number }>;
  recentVisits: Array<{ id: string; path: string; referrer: string; session_id: string; created_at: string }>;
}

export const useAnalyticsSummary = () =>
  useQuery({
    queryKey: ["analytics-summary"],
    queryFn: async (): Promise<AnalyticsSummary> => {
      const since = new Date();
      since.setDate(since.getDate() - 30);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await (supabase as any)
        .from("page_visits")
        .select("id,path,referrer,session_id,created_at")
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: false })
        .limit(1000);

      if (error) throw error;

      const rows = (data || []) as Array<{ id: string; path: string; referrer: string; session_id: string; created_at: string }>;
      const sessionIds = new Set(rows.map((row) => row.session_id).filter(Boolean));
      const pathCounts = rows.reduce<Record<string, number>>((acc, row) => {
        acc[row.path || "/"] = (acc[row.path || "/"] || 0) + 1;
        return acc;
      }, {});

      return {
        totalVisits: rows.length,
        uniqueSessions: sessionIds.size,
        todayVisits: rows.filter((row) => new Date(row.created_at) >= today).length,
        topPaths: Object.entries(pathCounts)
          .map(([path, visits]) => ({ path, visits }))
          .sort((a, b) => b.visits - a.visits)
          .slice(0, 6),
        recentVisits: rows.slice(0, 12),
      };
    },
    retry: false,
  });
