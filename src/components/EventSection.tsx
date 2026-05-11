import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSectionContent, getContentValue } from "@/hooks/useSiteContent";

const getFreshContentValue = (content: Parameters<typeof getContentValue>[0], key: string, fallback: string, stale: string[] = []) => {
  const value = getContentValue(content, key, fallback);
  return stale.includes(value) ? fallback : value;
};

const EventSection = () => {
  const { data: content } = useSectionContent("event");

  const eventName = getFreshContentValue(content, "event_name", "FREQUENCY 001");
  const tagline = getFreshContentValue(content, "event_tagline", "Incoming Drop", ["Incoming Transmission"]);
  const description = getFreshContentValue(content, "event_description", "An intimate frequency for sound, movement, and people who know the room matters as much as the music.", [
    "The first transmission. An underground convergence of sound, movement, and collective energy. This is not just an event — it's a signal activation.",
    "The first transmission. An underground convergence of sound, movement, and collective energy. This is not just an event - it's a signal activation.",
  ]);
  const date = getContentValue(content, "event_date", "TBA 2026");
  const location = getContentValue(content, "event_location", "Classified");
  const capacity = getContentValue(content, "event_capacity", "Limited");
  const lineup = getFreshContentValue(content, "event_lineup", "TBA", ["Incoming..."]);
  const ctaPrimary = getFreshContentValue(content, "event_cta_primary", "Request Access", ["Enter the Frequency"]);
  const ctaSecondary = getFreshContentValue(content, "event_cta_secondary", "Get Notified");

  return (
    <section id="event" className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,hsl(var(--primary)/0.08),transparent_28rem)]" />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-4"
        >
          <span className="text-xs font-display tracking-[0.4em] text-primary uppercase">{tagline}</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-center font-display text-4xl md:text-6xl font-black gradient-text-orange mb-16"
        >
          NEXT DROP
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="relative glow-border-orange rounded-2xl overflow-hidden"
        >
          <div className="absolute inset-0 scanline pointer-events-none opacity-50" />
          <div className="bg-transparent p-8 md:p-12 relative">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
              <span className="text-xs font-display tracking-[0.3em] text-primary uppercase">Event Signal</span>
            </div>

            <h3 className="font-display text-3xl md:text-5xl font-black text-foreground mb-4 text-glow-orange">
              {eventName}
            </h3>

            <p className="text-foreground/68 font-body text-base md:text-lg max-w-2xl mb-8">
              {description}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                { icon: Calendar, label: "Date", value: date },
                { icon: MapPin, label: "Location", value: location },
                { icon: Users, label: "Capacity", value: capacity },
                { icon: Music, label: "Lineup", value: lineup },
              ].map((item) => (
                <div key={item.label} className="glass-panel rounded-lg p-4">
                  <item.icon className="w-4 h-4 text-primary mb-2" />
                  <p className="text-xs font-display tracking-wider text-muted-foreground uppercase">{item.label}</p>
                  <p className="text-sm font-body text-foreground mt-1">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="neon" size="lg">
                {ctaPrimary}
              </Button>
              <Button variant="portal" size="lg">
                {ctaSecondary}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default EventSection;
