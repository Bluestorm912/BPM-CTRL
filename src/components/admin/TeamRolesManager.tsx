import { useState } from "react";
import { ShieldCheck, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ROLE_OPTIONS, useAssignStaffRole, useRemoveStaffRole, useStaffMembers } from "@/hooks/useTeamRoles";
import type { AppRole } from "@/hooks/useAuth";

const TeamRolesManager = () => {
  const { toast } = useToast();
  const { data: members, isLoading, error } = useStaffMembers();
  const assignRole = useAssignStaffRole();
  const removeRole = useRemoveStaffRole();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AppRole>("writer");

  const assign = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await assignRole.mutateAsync({ email, role });
      toast({ title: "Role assigned", description: `${email} can now access the assigned workspace.` });
      setEmail("");
      setRole("writer");
    } catch (err: any) {
      toast({ title: "Could not assign role", description: err.message, variant: "destructive" });
    }
  };

  const remove = async (userId: string, nextRole: AppRole) => {
    try {
      await removeRole.mutateAsync({ userId, role: nextRole });
      toast({ title: "Role removed" });
    } catch (err: any) {
      toast({ title: "Could not remove role", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-black gradient-text-orange flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" /> TEAM ACCESS
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Assign page-style roles so writers, creators, editors, and managers only see the tools they need.
        </p>
      </div>

      <form onSubmit={assign} className="liquid-glass rounded-3xl p-5 md:p-6">
        <div className="liquid-content grid grid-cols-1 md:grid-cols-[1fr_260px_auto] gap-4 md:items-end">
          <div>
            <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Creator Email</Label>
            <Input value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 bg-muted border-border" type="email" placeholder="writer@example.com" required />
          </div>
          <div>
            <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Role</Label>
            <select value={role} onChange={(event) => setRole(event.target.value as AppRole)} className="mt-1 w-full rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground">
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <Button variant="neon" type="submit" disabled={assignRole.isPending}>
            <UserPlus className="h-4 w-4 mr-2" />
            Assign
          </Button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ROLE_OPTIONS.map((option) => (
          <div key={option.value} className="rounded-2xl border border-primary/15 bg-black/20 p-4">
            <p className="font-display text-sm uppercase tracking-wider text-foreground">{option.label}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{option.description}</p>
          </div>
        ))}
      </div>

      <div className="liquid-glass rounded-3xl p-5 md:p-6">
        <div className="liquid-content space-y-3">
          <h3 className="font-display text-sm uppercase tracking-wider text-foreground">Current Team</h3>
          {error && <p className="text-sm text-destructive">Apply the latest Supabase migration to enable team role management.</p>}
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading team...</p>
          ) : !members?.length ? (
            <p className="text-sm text-muted-foreground">No staff roles assigned yet.</p>
          ) : (
            members.map((member) => (
              <div key={member.user_id} className="rounded-2xl border border-border bg-muted/30 p-4">
                <p className="font-body text-sm text-foreground">{member.email}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {member.roles.map((memberRole) => {
                    const label = ROLE_OPTIONS.find((option) => option.value === memberRole)?.label || memberRole;
                    return (
                      <span key={memberRole} className="inline-flex items-center gap-2 rounded-full border border-primary/25 px-3 py-1 text-xs text-primary">
                        {label}
                        <button type="button" onClick={() => remove(member.user_id, memberRole)} aria-label={`Remove ${label}`}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamRolesManager;
