import { Heart, RadioTower } from "lucide-react";
import { Button } from "@/components/ui/button";

const SupportCTA = () => (
  <section className="px-4 md:px-6 py-14 md:py-20">
    <div className="glow-border-orange rounded-2xl p-6 md:p-10 relative overflow-hidden">
      <div className="scanline absolute inset-0 opacity-10" />
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-center">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <RadioTower className="h-5 w-5 text-primary" />
            <p className="font-display text-xs tracking-[0.26em] text-primary uppercase">Member Circle</p>
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-black gradient-text-orange">BUILD THE SIGNAL WITH US</h2>
          <p className="mt-4 max-w-2xl text-sm md:text-base text-foreground/68 font-body">
            Members keep BPM CTRL independent: radio, playlists, drops, events, and the platform holding it together.
          </p>
        </div>
        <a href="/supporters">
          <Button variant="neon" size="xl">
            <Heart className="h-5 w-5 mr-2" />
            Become a Member
          </Button>
        </a>
      </div>
    </div>
  </section>
);

export default SupportCTA;
