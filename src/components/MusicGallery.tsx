import SoundCloudCard from "@/components/SoundCloudCard";
import { soundCloudTransmissions } from "@/data/soundcloud";
import SpotifyPlaylistEmbed from "@/components/SpotifyPlaylistEmbed";
import { getContentValue, useSectionContent } from "@/hooks/useSiteContent";

const MusicGallery = ({ embedFeatured = true }: { embedFeatured?: boolean }) => {
  const { data: radioContent } = useSectionContent("radio");
  const spotifyPlaylistUrl = getContentValue(radioContent, "radio_spotify_playlist_url", "");

  return (
    <>
      <section className="px-4 md:px-6 py-14 md:py-20">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-display text-xs tracking-[0.3em] text-primary uppercase">Music Rooms</p>
            <h2 className="mt-2 font-display text-3xl md:text-5xl font-black gradient-text-orange">IN-APP TRANSMISSIONS</h2>
          </div>
          <p className="max-w-xl text-sm text-foreground/68 font-body">
            Stream playlists and archived sets in one polished surface, without sending listeners away from BPM CTRL.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {soundCloudTransmissions.map((item) => (
            <SoundCloudCard key={item.id} item={item} embed={embedFeatured} />
          ))}
        </div>
      </section>
      <SpotifyPlaylistEmbed playlistUrl={spotifyPlaylistUrl} />
    </>
  );
};

export default MusicGallery;
