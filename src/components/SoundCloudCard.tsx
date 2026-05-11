import { Play } from "lucide-react";
import type { SoundCloudTransmission } from "@/data/soundcloud";
import { getSoundCloudEmbedUrl } from "@/data/soundcloud";

const SoundCloudCard = ({ item, embed = true }: { item: SoundCloudTransmission; embed?: boolean }) => (
  <article className="group liquid-glass rounded-3xl overflow-hidden transition-transform duration-300 hover:-translate-y-1">
    <div className="liquid-content">
    <div className="aspect-[4/3] overflow-hidden bg-transparent relative">
      <img src={item.coverImage} alt={`${item.title} cover`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
      <span className="absolute left-3 top-3 rounded border border-primary/30 bg-background/80 px-2 py-1 font-display text-[10px] tracking-wider text-primary uppercase">
        {item.category}
      </span>
      <span className="absolute bottom-3 left-3 inline-flex items-center gap-2 font-display text-xs tracking-wider text-foreground uppercase">
        <Play className="h-3.5 w-3.5 text-primary" />
        In-App Player
      </span>
    </div>
    <div className="p-5">
      <p className="font-display text-[10px] tracking-[0.22em] text-primary uppercase">{item.artist}</p>
      <h3 className="mt-2 font-display text-xl font-black text-foreground">{item.title}</h3>
      <p className="mt-3 text-sm text-foreground/64 font-body">{item.description}</p>
      {embed && (
        <iframe
          title={`${item.title} player`}
          className="mt-5 h-[166px] w-full rounded-lg border border-border"
          src={getSoundCloudEmbedUrl(item.soundcloudUrl)}
          loading="lazy"
          allow="autoplay"
        />
      )}
    </div>
    </div>
  </article>
);

export default SoundCloudCard;
