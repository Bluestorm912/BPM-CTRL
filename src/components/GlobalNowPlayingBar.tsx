import { Pause, Play, Radio, SkipForward } from "lucide-react";
import { useRadioPlayer } from "@/hooks/useRadio";

const GlobalNowPlayingBar = () => {
  const { radioState, tracks, isPlaying, togglePlay, playNext, canPlay, isLive, title, detail, image } = useRadioPlayer();

  if (radioState.mode === "off" || !canPlay) return null;

  return (
    <div className="fixed inset-x-3 bottom-24 z-50 md:bottom-6 md:left-auto md:right-6 md:w-[380px]">
      <div className="liquid-glass rounded-3xl p-2.5 shadow-2xl shadow-black/40">
        <div className="liquid-content flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-primary/20 bg-black/40">
            {image ? (
              <img src={image} alt="" className="h-full w-full object-cover" />
            ) : (
              <Radio className="h-5 w-5 text-primary" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {isLive && <span className="h-2 w-2 shrink-0 rounded-full bg-primary animate-pulse" />}
              <p className="truncate font-display text-[10px] uppercase tracking-[0.22em] text-primary">
                {isLive ? "Live" : "Now Playing"}
              </p>
            </div>
            <p className="truncate font-display text-sm font-black text-foreground">{title}</p>
            <p className="truncate text-xs text-muted-foreground">{detail}</p>
          </div>

          {!isLive && tracks.length > 1 && (
            <button
              type="button"
              onClick={playNext}
              className="liquid-button flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-primary"
              aria-label="Next track"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          )}

          <button
            type="button"
            onClick={togglePlay}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-105"
            aria-label={isPlaying ? "Pause BPM CTRL" : "Play BPM CTRL"}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalNowPlayingBar;
