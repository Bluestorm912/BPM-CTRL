import { Pause, Play, Radio, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRadioPlayer } from "@/hooks/useRadio";
import SignalStatusBadge from "@/components/SignalStatusBadge";

const RadioPlayerPanel = ({ compact = false }: { compact?: boolean }) => {
  const { radioState, currentTrack, tracks, isPlaying, togglePlay, playNext } = useRadioPlayer();
  const isLive = radioState.mode === "live";
  const title = isLive ? radioState.liveTitle || "BPM CTRL Live" : currentTrack?.title || "Signal Standby";
  const detail = isLive ? radioState.liveDescription || "Live from the control room." : currentTrack?.artist || "Curated audio will appear here.";
  const canPlay = isLive ? !!radioState.streamUrl : !!currentTrack?.audio_url;

  return (
    <div className={`liquid-glass rounded-3xl relative overflow-hidden ${compact ? "p-4" : "p-5 md:p-7"}`}>
      <div className="scanline absolute inset-0 opacity-10" />
      <div className="liquid-content">
        <div className="flex items-start justify-between gap-4 mb-6">
          <SignalStatusBadge label={isLive ? "Live Now" : radioState.mode === "off" ? "Standby" : "Now Playing"} active={radioState.mode !== "off"} />
          <Radio className="h-5 w-5 text-primary" />
        </div>
        <h2 className={`font-display font-black text-foreground ${compact ? "text-xl" : "text-3xl md:text-4xl"}`}>{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground font-body">{detail}</p>
        <div className="mt-6 flex items-center gap-3">
          <Button variant="neon" size={compact ? "sm" : "lg"} onClick={togglePlay} disabled={!canPlay}>
            {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isPlaying ? "Pause" : "Play"}
          </Button>
          {!isLive && tracks.length > 1 && (
            <Button variant="portal" size={compact ? "sm" : "lg"} onClick={playNext}>
              <SkipForward className="h-4 w-4 mr-2" />
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RadioPlayerPanel;
