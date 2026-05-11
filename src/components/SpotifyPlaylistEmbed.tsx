import { Music2 } from "lucide-react";

const getSpotifyEmbedUrl = (url: string) => {
  const trimmed = url.trim();
  if (!trimmed) return "";

  const uriMatch = trimmed.match(/^spotify:playlist:([A-Za-z0-9]+)$/);
  if (uriMatch) return `https://open.spotify.com/embed/playlist/${uriMatch[1]}?utm_source=generator&theme=0`;

  try {
    const parsed = new URL(trimmed);
    const [, type, id] = parsed.pathname.split("/");
    if (parsed.hostname.includes("spotify.com") && type === "playlist" && id) {
      return `https://open.spotify.com/embed/playlist/${id}?utm_source=generator&theme=0`;
    }
  } catch {
    return "";
  }

  return "";
};

const SpotifyPlaylistEmbed = ({ playlistUrl }: { playlistUrl: string }) => {
  const embedUrl = getSpotifyEmbedUrl(playlistUrl);
  if (!embedUrl) return null;

  return (
    <section className="px-4 md:px-6 pb-14 md:pb-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/25 bg-primary/10">
            <Music2 className="h-5 w-5 text-primary" />
          </span>
          <div>
            <p className="font-display text-xs tracking-[0.3em] text-primary uppercase">Spotify Signal</p>
            <h2 className="font-display text-2xl md:text-3xl font-black text-foreground">BPM CTRL PLAYLIST</h2>
          </div>
        </div>
        <iframe
          title="BPM CTRL Spotify playlist"
          className="h-[380px] w-full rounded-xl border border-border bg-card"
          src={embedUrl}
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        />
      </div>
    </section>
  );
};

export default SpotifyPlaylistEmbed;
