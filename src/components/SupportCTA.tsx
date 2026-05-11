import { Heart, RadioTower } from "lucide-react";
import { Button } from "@/components/ui/button";

const SupportCTA = () => (
  <section className="px-4 md:px-6 py-14 md:py-20">
    <div className="glow-border-orange rounded-2xl bg-card p-6 md:p-10 relative overflow-hidden">
      <div className="scanline absolute inset-0 opacity-10" />
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-center">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <RadioTower className="h-5 w-5 text-primary" />
            <p className="font-display text-xs tracking-[0.26em] text-primary uppercase">Supporter Channel</p>
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-black gradient-text-orange">KEEP THE SIGNAL ALIVE</h2>
          <p className="mt-4 max-w-2xl text-sm md:text-base text-muted-foreground font-body">
            Supporters help fund radio operations, programming, creators, events, content, and the platform infrastructure behind BPM Control.
          </p>
        </div>
        <a href="/supporters">
          <Button variant="neon" size="xl">
            <Heart className="h-5 w-5 mr-2" />
            Join Supporters
          </Button>
        </a>
      </div>
    </div>
  </section>
);

export default SupportCTA;
