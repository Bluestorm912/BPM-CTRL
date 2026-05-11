import heroBg from "@/assets/hero-bg.jpg";
import mascotDj from "@/assets/mascot-dj.png";
import mascotWelcome from "@/assets/mascot-welcome.png";

export interface SoundCloudTransmission {
  id: string;
  title: string;
  artist: string;
  soundcloudUrl: string;
  coverImage: string;
  category: string;
  description: string;
  date: string;
  featured: boolean;
}

export const soundCloudTransmissions: SoundCloudTransmission[] = [
  {
    id: "controlled-bpm-set",
    title: "Techno Flow: Controlled BPM Set",
    artist: "ZenOne",
    soundcloudUrl: "https://soundcloud.com/zenone_music/zenone-techno-flow-controlled-bpm-set-123-127-bpm-oct-2024",
    coverImage: heroBg,
    category: "Techno",
    description: "A clean reference stream for the radio discovery layer while BPM CTRL uploads are prepared.",
    date: "2024-10-13",
    featured: true,
  },
  {
    id: "pulse-ctrl-club",
    title: "Club Pressure Signal",
    artist: "Pulse Ctrl",
    soundcloudUrl: "https://soundcloud.com/pulsectrl",
    coverImage: mascotDj,
    category: "House",
    description: "A channel-style SoundCloud embed that demonstrates how BPM CTRL residencies can be surfaced.",
    date: "2026-03-31",
    featured: true,
  },
  {
    id: "bpm-archive-placeholder",
    title: "BPM CTRL Archive Slot",
    artist: "BPM CTRL",
    soundcloudUrl: "https://soundcloud.com/zenone_music/zenone-techno-flow-controlled-bpm-set-123-127-bpm-oct-2024",
    coverImage: mascotWelcome,
    category: "Archive",
    description: "Swap this URL for any BPM CTRL SoundCloud track, playlist, or show URL.",
    date: "2026-05-05",
    featured: false,
  },
];

export const getSoundCloudEmbedUrl = (url: string) =>
  `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff6b1a&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`;
