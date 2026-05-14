import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface HealthItem {
  name: string;
  ok: boolean;
  message?: string;
}

interface SupabaseSchemaProbe {
  from: (table: string) => {
    select: (columns: string) => {
      limit: (count: number) => Promise<{ error: { code?: string; message?: string } | null }>;
    };
  };
  rpc: (fn: string, args: Record<string, unknown>) => Promise<{ error: { code?: string; message?: string } | null }>;
}

const tableChecks = [
  "site_content",
  "site_assets",
  "user_roles",
  "shop_products",
  "culture_stories",
  "dj_set_submissions",
  "community_applications",
];

const isMissingSchema = (code?: string) => code === "PGRST202" || code === "PGRST205";
const schemaProbe = supabase as unknown as SupabaseSchemaProbe;

export const useCmsHealth = () =>
  useQuery({
    queryKey: ["cms-health"],
    queryFn: async () => {
      const tableResults: HealthItem[] = await Promise.all(
        tableChecks.map(async (table) => {
          const { error } = await schemaProbe.from(table).select("*").limit(1);
          return {
            name: table,
            ok: !isMissingSchema(error?.code),
            message: error?.message,
          };
        })
      );

      const { error: roleFunctionError } = await schemaProbe.rpc("has_any_role", {
        _user_id: "00000000-0000-0000-0000-000000000000",
        _roles: ["admin"],
      });

      const functionResults: HealthItem[] = [
        {
          name: "has_any_role()",
          ok: !isMissingSchema(roleFunctionError?.code),
          message: roleFunctionError?.message,
        },
      ];

      const checks = [...tableResults, ...functionResults];
      return {
        checks,
        missing: checks.filter((item) => !item.ok),
      };
    },
    retry: false,
    staleTime: 60_000,
  });
