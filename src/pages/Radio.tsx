import { motion } from "framer-motion";
import { ArrowLeft, CalendarDays, Pause, Play, Radio as RadioIcon, Signal, SkipForward, Volume2 } from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { useRadioPlayer } from "@/hooks/useRadio";
import MusicGallery from "@/components/MusicGallery";
import { usePageMeta } from "@/hooks/usePageMeta";

const FEATURED_SHOWS = [
  {
    title: "Body Signal",
    host: "BPM CTRL Residents",
    time: "Fridays 22:00",
    tags: ["Afro House", "Club", "Lagos"],
    description: "Floor-focused transmissions from the BPM CTRL archive and resident circle.",
  },
  {
    title: "Style Frequency",
    host: "Guest Selectors",
    time: "Sundays 19:00",
    tags: ["Fashion", "Dance", "Culture"],
    description: "A radio magazine for movement, streetwear, and nightlife culture.",
  },
  {
    title: "After Hours",
    host: "Signal Network",
    time: "Late night",
    tags: ["Deep", "Percussion", "Archive"],
    description: "Slower pressure, warm bass, and recordings from previous gatherings.",
  },
];

const Radio = () => {
  const { radioState, currentTrack, tracks, isPlaying, togglePlay, playNext } = useRadioPlayer();
  usePageMeta(
    "BPM Control Radio - Live Signal and SoundCloud Shows",
    "Listen live, browse featured BPM Control shows, and play SoundCloud-powered transmissions."
  );
  const isLive = radioState.mode === "live";
  const title = isLive ? radioState.liveTitle || "BPM CTRL Live" : currentTrack?.title || "Transmission Standby";
  const description = isLive
    ? radioState.liveDescription || "Live from the BPM CTRL signal room."
    : currentTrack?.description || "Upload tracks in the CMS Transmission tab to start prerecorded radio.";
  const artist = isLive ? "Live Broadcast" : currentTrack?.artist || "BPM CTRL";
  const image = isLive ? radioState.liveImage : currentTrack?.cover_image_url;
  const canPlay = radioState.mode === "live" ? !!radioState.streamUrl : !!currentTrack?.audio_url;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="h-14 px-4 md:px-6 flex items-center gap-4">
          <a href="/" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Back to BPM CTRL">
            <ArrowLeft className="w-4 h-4" />
          </a>
          <img src={logo} alt="BPM CTRL" className="h-7 w-auto" />

          <div className="ml-auto flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={togglePlay}
              disabled={!canPlay}
              className="h-10 w-10 rounded-full border border-primary/40 bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed glow-box"
              aria-label={isPlaying ? "Pause radio" : "Play radio"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <div className="hidden sm:block min-w-0">
              <p className="font-display text-[10px] tracking-[0.28em] text-primary uppercase">
                {isLive ? "Live Now" : radioState.mode === "prerecorded" ? "Now Playing" : "Radio Off"}
              </p>
              <p className="text-sm font-body text-foreground truncate max-w-[260px]">{title}</p>
            </div>
            {!isLive && tracks.length > 1 && (
              <button
                type="button"
                onClick={playNext}
                className="h-10 w-10 rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors flex items-center justify-center"
                aria-label="Next track"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="pt-14">
        <section className="min-h-[calc(100vh-56px)] grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="relative min-h-[62vh] lg:min-h-0 overflow-hidden border-b lg:border-b-0 lg:border-r border-border">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(22_100%_55%/0.18),transparent_42%)]" />
            <div className="absolute inset-0 scanline" />
            <motion.div
              className="absolute inset-y-0 left-0 flex items-center whitespace-nowrap"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, duration: 24, ease: "linear" }}
            >
              {Array.from({ length: 8 }).map((_, index) => (
                <span
                  key={index}
                  className="font-display text-[18vw] md:text-[12vw] lg:text-[9vw] font-black text-primary/15 tracking-[0.08em] px-8"
                >
                  BPM CTRL RADIO
                </span>
              ))}
            </motion.div>
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="w-full max-w-3xl">
                <div className="flex items-center gap-2 mb-5">
                  <span className={`w-2 h-2 rounded-full ${radioState.mode === "off" ? "bg-muted-foreground" : "bg-primary animate-pulse"}`} />
                  <span className="font-display text-xs tracking-[0.32em] text-primary uppercase">Internet Radio</span>
                </div>
                <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black gradient-text-orange leading-none mb-6">
                  {title}
                </h1>
                <p className="text-lg md:text-xl text-orange-amber/70 font-body max-w-2xl">{description}</p>
              </div>
            </div>
          </div>

          <aside className="bg-card/70 p-5 md:p-7 flex flex-col">
            <div className="aspect-square rounded-xl overflow-hidden bg-muted border border-border mb-6">
              {image ? (
                <img src={image} alt={title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Signal className="w-16 h-16 text-primary animate-pulse-glow" />
                </div>
              )}
            </div>

            <p className="font-display text-xs tracking-[0.28em] text-primary uppercase mb-2">{artist}</p>
            <h2 className="font-display text-2xl font-black text-foreground mb-3">{title}</h2>
            <p className="text-sm text-muted-foreground font-body mb-6">{description}</p>

            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="rounded-lg border border-border bg-muted/40 p-3">
                <RadioIcon className="w-4 h-4 text-primary mb-2" />
                <p className="font-display text-[10px] tracking-wider uppercase text-muted-foreground">Mode</p>
                <p className="text-sm text-foreground capitalize">{radioState.mode}</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/40 p-3">
                <Volume2 className="w-4 h-4 text-primary mb-2" />
                <p className="font-display text-[10px] tracking-wider uppercase text-muted-foreground">Tracks</p>
                <p className="text-sm text-foreground">{tracks.length}</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/40 p-3">
                <CalendarDays className="w-4 h-4 text-primary mb-2" />
                <p className="font-display text-[10px] tracking-wider uppercase text-muted-foreground">Signal</p>
                <p className="text-sm text-foreground">{canPlay ? "Ready" : "Standby"}</p>
              </div>
            </div>

            <Button variant="neon" size="lg" onClick={togglePlay} disabled={!canPlay} className="w-full">
              {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isPlaying ? "Pause Broadcast" : "Play Broadcast"}
            </Button>
          </aside>
        </section>

        <section className="px-4 md:px-6 py-10 md:py-14">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <p className="font-display text-xs tracking-[0.28em] text-primary uppercase mb-2">Schedule</p>
              <h2 className="font-display text-3xl md:text-5xl font-black gradient-text-orange">FEATURED SHOWS</h2>
            </div>
            <a href="/admin" className="hidden md:inline-flex text-xs font-display tracking-wider text-muted-foreground hover:text-primary uppercase">
              Manage in CMS
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FEATURED_SHOWS.map((show) => (
              <article key={show.title} className="glow-border-orange rounded-xl bg-card p-5">
                <p className="font-display text-[10px] tracking-[0.24em] text-primary uppercase mb-2">{show.time}</p>
                <h3 className="font-display text-xl font-black text-foreground mb-1">{show.title}</h3>
                <p className="text-sm text-orange-amber/70 mb-4">{show.host}</p>
                <p className="text-sm text-muted-foreground font-body mb-5">{show.description}</p>
                <div className="flex flex-wrap gap-2">
                  {show.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 rounded border border-primary/25 text-[10px] font-display tracking-wider text-primary uppercase">
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <MusicGallery embedFeatured />
      </main>
    </div>
  );
};

export default Radio;
