import SoundCloudCard from "@/components/SoundCloudCard";
import { soundCloudTransmissions } from "@/data/soundcloud";
import SpotifyPlaylistEmbed from "@/components/SpotifyPlaylistEmbed";
import { getContentValue, useSectionContent } from "@/hooks/useSiteContent";

const MusicGallery = ({ embedFeatured = false }: { embedFeatured?: boolean }) => {
  const { data: radioContent } = useSectionContent("radio");
  const spotifyPlaylistUrl = getContentValue(radioContent, "radio_spotify_playlist_url", "");

  return (
    <>
      <section className="px-4 md:px-6 py-14 md:py-20">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-display text-xs tracking-[0.3em] text-primary uppercase">Discovery Grid</p>
            <h2 className="mt-2 font-display text-3xl md:text-5xl font-black gradient-text-orange">MUSIC TRANSMISSIONS</h2>
          </div>
          <p className="max-w-xl text-sm text-muted-foreground font-body">
            Stream BPM CTRL mixes, SoundCloud uploads, and the live Spotify playlist from one discovery layer.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {soundCloudTransmissions.map((item) => (
            <SoundCloudCard key={item.id} item={item} embed={embedFeatured && item.featured} />
          ))}
        </div>
      </section>
      <SpotifyPlaylistEmbed playlistUrl={spotifyPlaylistUrl} />
    </>
  );
};

export default MusicGallery;
