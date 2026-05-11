import { ArrowRight, Orbit, Radio, ShoppingBag, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import RadioPlayerPanel from "@/components/RadioPlayerPanel";
import SignalStatusBadge from "@/components/SignalStatusBadge";

const ControlRoomHero = () => (
  <section className="relative min-h-screen overflow-hidden px-4 md:px-6 pt-28 pb-16 flex items-center">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,hsl(22_100%_55%/0.18),transparent_32%),radial-gradient(circle_at_80%_55%,hsl(33_100%_65%/0.10),transparent_30%)]" />
    <div className="absolute inset-0 scanline" />
    <div className="absolute inset-x-0 top-24 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
    <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_460px] gap-6 items-center">
      <div>
        <SignalStatusBadge label="BPM Command Station" />
        <h1 className="mt-6 font-display text-5xl md:text-7xl lg:text-8xl font-black leading-none gradient-text-orange">
          BPM CONTROL
        </h1>
        <p className="mt-6 max-w-2xl text-lg md:text-xl text-orange-amber/75 font-body">
          A live signal for music, culture, DJs, creators, and listeners. Tune in, browse transmissions, support the mission, and shop the frequency.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <a href="/radio">
            <Button variant="neon" size="xl">
              <Radio className="h-5 w-5 mr-2" />
              Enter Radio
            </Button>
          </a>
          <a href="/supporters">
            <Button variant="portal" size="xl">
              <Users className="h-5 w-5 mr-2" />
              Support Signal
            </Button>
          </a>
        </div>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl">
          {[
            ["Live", "radio control"],
            ["SoundCloud", "music embeds"],
            ["Archive", "shows and mixes"],
            ["Shop", "signal goods"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-border bg-card/70 p-4">
              <p className="font-display text-[10px] tracking-wider text-primary uppercase">{label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{value}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <div className="rounded-2xl border border-primary/30 bg-background/60 p-3">
          <div className="aspect-square rounded-xl border border-border bg-card relative overflow-hidden flex items-center justify-center">
            <div className="absolute h-3/4 w-3/4 rounded-full border border-primary/20 animate-signal-pulse" />
            <div className="absolute h-1/2 w-1/2 rounded-full border border-orange-amber/20" />
            <Orbit className="h-24 w-24 text-primary animate-pulse-glow" />
          </div>
        </div>
        <RadioPlayerPanel compact />
        <div className="grid grid-cols-2 gap-3">
          <a href="/shop" className="rounded-xl border border-border bg-card p-4 hover:border-primary/50 transition-colors">
            <ShoppingBag className="h-5 w-5 text-primary mb-3" />
            <span className="font-display text-xs tracking-wider uppercase">Shop</span>
          </a>
          <a href="#transmissions" className="rounded-xl border border-border bg-card p-4 hover:border-primary/50 transition-colors">
            <ArrowRight className="h-5 w-5 text-primary mb-3" />
            <span className="font-display text-xs tracking-wider uppercase">Browse</span>
          </a>
        </div>
      </div>
    </div>
  </section>
);

export default ControlRoomHero;
