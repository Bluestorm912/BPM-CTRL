import { ArrowRight, Orbit, Radio, ShoppingBag, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import RadioPlayerPanel from "@/components/RadioPlayerPanel";
import SignalStatusBadge from "@/components/SignalStatusBadge";
import { useLanguage } from "@/i18n/LanguageProvider";

const ControlRoomHero = () => {
  const { t } = useLanguage();
  const stats = [
    [t("hero.stats.radio"), t("hero.stats.radioValue")],
    [t("hero.stats.playlists"), t("hero.stats.playlistsValue")],
    [t("hero.stats.archive"), t("hero.stats.archiveValue")],
    [t("hero.stats.shop"), t("hero.stats.shopValue")],
  ];

  return (
    <section className="relative min-h-screen overflow-hidden px-4 md:px-6 pt-28 pb-16 flex items-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.16),transparent_34rem)]" />
      <div className="absolute inset-0 scanline" />
      <div className="absolute inset-x-0 top-24 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_460px] gap-6 items-center">
        <div>
          <SignalStatusBadge label={t("hero.badge")} />
        <h1 className="mt-6 font-display text-5xl md:text-7xl lg:text-8xl font-black leading-none gradient-text-orange">
          {t("hero.title")}
        </h1>
        <p className="mt-6 max-w-2xl text-lg md:text-xl text-foreground/72 font-body">
          {t("hero.body")}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <a href="/radio">
            <Button variant="neon" size="xl">
              <Radio className="h-5 w-5 mr-2" />
              {t("common.listenNow")}
            </Button>
          </a>
          <a href="/supporters">
            <Button variant="portal" size="xl">
              <Users className="h-5 w-5 mr-2" />
              {t("hero.join")}
            </Button>
          </a>
        </div>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl">
          {stats.map(([label, value]) => (
            <div key={label} className="liquid-glass rounded-2xl p-4">
              <div className="liquid-content">
              <p className="font-display text-[10px] tracking-wider text-primary uppercase">{label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <div className="liquid-glass rounded-3xl p-3">
          <div className="liquid-content aspect-square rounded-2xl border border-primary/15 bg-transparent relative overflow-hidden flex items-center justify-center">
            <div className="absolute h-3/4 w-3/4 rounded-full border border-primary/20 animate-signal-pulse" />
            <div className="absolute h-1/2 w-1/2 rounded-full border border-primary/20" />
            <Orbit className="h-24 w-24 text-primary animate-pulse-glow" />
          </div>
        </div>
        <RadioPlayerPanel compact />
        <div className="grid grid-cols-2 gap-3">
          <a href="/shop" className="liquid-glass rounded-2xl p-4 hover:border-primary/50 transition-colors">
            <span className="liquid-content block">
            <ShoppingBag className="h-5 w-5 text-primary mb-3" />
            <span className="font-display text-xs tracking-wider uppercase">{t("hero.shop")}</span>
            </span>
          </a>
          <a href="#transmissions" className="liquid-glass rounded-2xl p-4 hover:border-primary/50 transition-colors">
            <span className="liquid-content block">
            <ArrowRight className="h-5 w-5 text-primary mb-3" />
            <span className="font-display text-xs tracking-wider uppercase">{t("hero.browse")}</span>
            </span>
          </a>
        </div>
      </div>
    </div>
  </section>
  );
};

export default ControlRoomHero;
