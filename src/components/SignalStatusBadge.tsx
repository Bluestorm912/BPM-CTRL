const SignalStatusBadge = ({ label = "Signal Online", active = true }: { label?: string; active?: boolean }) => (
  <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 font-display text-[10px] tracking-[0.22em] text-primary uppercase">
    <span className={`h-2 w-2 rounded-full ${active ? "bg-primary animate-pulse" : "bg-muted-foreground"}`} />
    {label}
  </span>
);

export default SignalStatusBadge;
