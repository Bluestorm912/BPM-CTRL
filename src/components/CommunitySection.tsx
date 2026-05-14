import { motion } from "framer-motion";
import { Disc3, Newspaper, Radio, Users } from "lucide-react";
import { useSectionContent, getContentValue } from "@/hooks/useSiteContent";

const getFreshContentValue = (content: Parameters<typeof getContentValue>[0], key: string, fallback: string, stale: string[] = []) => {
  const value = getContentValue(content, key, fallback);
  return stale.includes(value) ? fallback : value;
};

const CommunitySection = () => {
  const { data: content } = useSectionContent("community");
  const pathways = [
    { href: "/radio", label: "Radio", detail: "Listen live", icon: Radio },
    { href: "/submit-set", label: "DJ Sets", detail: "Send a mix", icon: Disc3 },
    { href: "/#articles", label: "Stories", detail: "Read culture", icon: Newspaper },
    { href: "/careers", label: "Community", detail: "Join the build", icon: Users },
  ];

  const title1 = getFreshContentValue(content, "community_title_1", "A platform for the culture.", ["We don't just throw raves.", "Designed for the room."]);
  const title2 = getFreshContentValue(content, "community_title_2", "Built by the community.", ["We build culture.", "Built for the culture."]);
  const body1 = getFreshContentValue(content, "community_body_1", "BPM CTRL is a community-led media and radio project documenting music, nightlife, fashion, movement, and the people shaping the scene.", [
    "BPM CTRL is a Nigerian-born movement rooted in Afro house, underground dance energy, and fashion expression. We transmit a signal that connects those who move to the same frequency.",
    "BPM CTRL is a Nigerian-born signal for Afro house, underground movement, and fashion-led nightlife.",
  ]);
  const body2 = getFreshContentValue(content, "community_body_2", "Writers, DJs, photographers, designers, volunteers, interns, supporters, and organizers can contribute from anywhere in the world.", [
    "Dance is spiritual release. Fashion is personal expression. Together they form the language of our community - a space where every body belongs and the bass hits different.",
    "The app keeps the circle close: radio, playlists, drops, support, and archive in one black-glass space.",
  ]);
  const body3 = getFreshContentValue(content, "community_body_3", "Submit your story, send your set, join the team, or fund the cause. The signal grows when the community builds it.", [
    "No hierarchy. No ego. Just pulse.",
    "No noise. No clutter. Just signal.",
  ]);

  return (
    <section id="mission" className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.08),transparent_30rem)]" />

      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 mb-8 bg-transparent backdrop-blur-xl">
            <Radio className="w-3.5 h-3.5 text-primary animate-pulse-glow" />
            <span className="text-xs font-display tracking-[0.3em] text-primary uppercase">Community Signal</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="liquid-glass rounded-3xl p-8 md:p-14 relative"
        >
          <div className="liquid-content">
            <h2 className="font-display text-2xl md:text-4xl font-black text-foreground mb-8 text-glow-orange leading-tight">
              {title1}
              <br />
              <span className="gradient-text-orange">{title2}</span>
            </h2>

            <div className="space-y-6 text-foreground/68 font-body text-base md:text-lg leading-relaxed">
              <p>{body1}</p>
              <p>{body2}</p>
              <p>{body3}</p>
            </div>

            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
              {pathways.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className="group liquid-button rounded-2xl px-3 py-4 text-center transition-transform hover:-translate-y-1"
                    aria-label={`${item.label}: ${item.detail}`}
                  >
                    <span className="relative mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-black/45 shadow-[inset_0_1px_0_hsl(var(--primary)/0.28),0_0_26px_hsl(var(--primary)/0.14)]">
                      <span className="absolute inset-1 rounded-full border border-primary/10" />
                      <Icon className="h-5 w-5 text-primary transition-transform group-hover:scale-110" />
                    </span>
                    <span className="block font-display text-xs uppercase tracking-[0.14em] text-foreground">{item.label}</span>
                    <span className="mt-1 block text-[11px] text-muted-foreground">{item.detail}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CommunitySection;
