import logo from "@/assets/logo.png";
import heroBg from "@/assets/hero-bg.jpg";
import Navbar from "@/components/Navbar";
import BackToTop from "@/components/BackToTop";
import TransmissionTicker from "@/components/TransmissionTicker";
import ControlRoomHero from "@/components/ControlRoomHero";
import MusicGallery from "@/components/MusicGallery";
import SupportCTA from "@/components/SupportCTA";
import RadioPlayerPanel from "@/components/RadioPlayerPanel";
import SoundCloudCard from "@/components/SoundCloudCard";
import { soundCloudTransmissions } from "@/data/soundcloud";
import { Button } from "@/components/ui/button";
import { useSiteLinks } from "@/hooks/useSiteLinks";
import { usePageMeta } from "@/hooks/usePageMeta";
import EventSection from "@/components/EventSection";
import CommunitySection from "@/components/CommunitySection";

const Index = () => {
  const links = useSiteLinks();
  const featured = soundCloudTransmissions.find((item) => item.featured) || soundCloudTransmissions[0];
  usePageMeta(
    "BPM CTRL - Radio, Playlists, Drops",
    "BPM CTRL is a black-glass music and culture app for radio, playlists, members, and drops."
  );

  return (
    <div className="min-h-screen bg-background">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:px-4 focus:py-2 focus:rounded focus:bg-primary focus:text-primary-foreground focus:font-display focus:text-sm focus:tracking-wider focus:outline-none">
        Skip to content
      </a>
      <Navbar />
      <TransmissionTicker />

      <main id="main-content">
        <ControlRoomHero />

        <section className="px-4 md:px-6 py-14 md:py-20 border-y border-primary/15 bg-transparent">
          <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-[420px_minmax(0,1fr)] gap-6">
            <div>
              <p className="font-display text-xs tracking-[0.3em] text-primary uppercase">Live Console</p>
              <h2 className="mt-2 font-display text-3xl md:text-5xl font-black gradient-text-orange">PRESS PLAY FIRST</h2>
              <p className="mt-4 text-foreground/68 font-body">
                The first screen is built for listening: one player, one featured transmission, and clear routes into radio, drops, and community.
              </p>
              <div className="mt-6">
                <RadioPlayerPanel />
              </div>
            </div>
            <SoundCloudCard item={featured} embed />
          </div>
        </section>

        <section id="transmissions" className="px-4 md:px-6 py-14 md:py-20">
          <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6">
            <div className="glass-panel rounded-2xl overflow-hidden relative min-h-[420px]">
              <img src={heroBg} alt="BPM Control radio atmosphere" className="absolute inset-0 h-full w-full object-cover opacity-35" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
              <div className="relative z-10 p-6 md:p-10 h-full flex flex-col justify-end">
                <p className="font-display text-xs tracking-[0.3em] text-primary uppercase">Latest Transmission</p>
                <h2 className="mt-3 font-display text-4xl md:text-6xl font-black gradient-text-orange">SIGNAL ARCHIVE</h2>
                <p className="mt-4 max-w-2xl text-foreground/68">
                  Browse sets, playlists, radio notes, and cultural drops without leaving the BPM CTRL app.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <a href="/radio"><Button variant="neon" size="lg">Open Radio</Button></a>
                  <a href="/shop"><Button variant="portal" size="lg">View Drops</Button></a>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
              {[
                ["Live Radio", "stream inside the app"],
                ["Playlists", "embedded music rooms"],
                ["Members", "keep the signal active"],
                ["Shop", "drops and member access"],
              ].map(([title, text]) => (
                <div key={title} className="glass-panel rounded-xl p-5">
                  <p className="font-display text-sm text-foreground">{title}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <MusicGallery />
        <EventSection />
        <CommunitySection />
        <SupportCTA />
      </main>

      <footer className="py-10 px-4 border-t border-border" role="contentinfo">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src={logo} alt="BPM CTRL" className="h-6 w-auto" />
            <span className="font-display text-xs tracking-[0.15em] text-muted-foreground">2026</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-4 font-display text-xs tracking-wider uppercase text-muted-foreground">
            <a href="/radio" className="hover:text-primary">Radio</a>
            <a href="/shop" className="hover:text-primary">Shop</a>
            <a href="/supporters" className="hover:text-primary">Members</a>
            <a href={links.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-primary">Instagram</a>
          </nav>
        </div>
      </footer>
      <BackToTop />
    </div>
  );
};

export default Index;
