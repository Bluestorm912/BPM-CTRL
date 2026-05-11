import SoundCloudCard from "@/components/SoundCloudCard";
import { soundCloudTransmissions } from "@/data/soundcloud";

const MusicGallery = ({ embedFeatured = false }: { embedFeatured?: boolean }) => (
  <section className="px-4 md:px-6 py-14 md:py-20">
    <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="font-display text-xs tracking-[0.3em] text-primary uppercase">Discovery Grid</p>
        <h2 className="mt-2 font-display text-3xl md:text-5xl font-black gradient-text-orange">SOUNDCLOUD TRANSMISSIONS</h2>
      </div>
      <p className="max-w-xl text-sm text-muted-foreground font-body">
        Add BPM CTRL mixes, shows, and uploads by changing one data file now, then move the same structure into the CMS later.
      </p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {soundCloudTransmissions.map((item) => (
        <SoundCloudCard key={item.id} item={item} embed={embedFeatured && item.featured} />
      ))}
    </div>
  </section>
);

export default MusicGallery;
