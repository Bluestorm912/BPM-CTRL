import { ArrowLeft, Heart, RadioTower, Satellite, ShieldCheck, Users } from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import SignalStatusBadge from "@/components/SignalStatusBadge";
import SupportCTA from "@/components/SupportCTA";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useLanguage } from "@/i18n/LanguageProvider";

const fundingIcons = [RadioTower, Satellite, Users, ShieldCheck, Heart];

const Supporters = () => {
  const { t, getCopy } = useLanguage();
  const funding = getCopy("supporters.funding") as string[];
  const tiers = getCopy("supporters.tiers") as Array<{ name: string; price: string; benefit: string }>;
  const faqs = getCopy("supporters.faqs") as string[][];

  usePageMeta(
    t("meta.supportersTitle"),
    t("meta.supportersDescription")
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 left-0 right-0 z-50 px-3 pt-3">
        <div className="liquid-glass h-14 rounded-full px-4 md:px-6 flex items-center gap-4">
          <a href="/" className="liquid-content text-muted-foreground hover:text-primary transition-colors" aria-label={t("common.back")}>
            <ArrowLeft className="w-4 h-4" />
          </a>
          <img src={logo} alt="BPM CTRL" className="liquid-content h-7 w-auto" />
          <nav className="liquid-content ml-auto flex items-center gap-4 font-display text-xs tracking-wider uppercase text-muted-foreground">
            <a href="/radio" className="hover:text-primary">{t("nav.radio")}</a>
            <a href="/shop" className="hover:text-primary">{t("nav.shop")}</a>
          </nav>
        </div>
      </header>

      <main className="pt-14">
        <section className="relative min-h-[78vh] px-4 md:px-6 py-16 md:py-24 flex items-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,hsl(22_100%_55%/0.18),transparent_36%)]" />
          <div className="absolute inset-0 scanline" />
          <div className="relative z-10 mx-auto max-w-5xl text-center">
            <SignalStatusBadge label={t("supporters.badge")} />
            <h1 className="mt-6 font-display text-5xl md:text-7xl lg:text-8xl font-black gradient-text-orange leading-none">
              {t("supporters.title")}
            </h1>
            <p className="mt-6 mx-auto max-w-3xl text-lg md:text-xl text-orange-amber/75 font-body">
              {t("supporters.body")}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="neon" size="xl">
                <Heart className="w-5 h-5 mr-2" />
                {t("supporters.join")}
              </Button>
              <a href="/radio"><Button variant="portal" size="xl">{t("common.listenFirst")}</Button></a>
            </div>
          </div>
        </section>

        <section className="px-4 md:px-6 py-14 md:py-20">
          <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-6">
            <div>
              <p className="font-display text-xs tracking-[0.28em] text-primary uppercase">{t("supporters.fundEyebrow")}</p>
              <h2 className="mt-2 font-display text-3xl md:text-5xl font-black gradient-text-orange">{t("supporters.fundTitle")}</h2>
              <p className="mt-4 text-muted-foreground font-body">
                {t("supporters.fundBody")}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {funding.map((item, index) => (
                <div key={item} className="liquid-glass rounded-2xl p-5">
                  <div className="liquid-content">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const Icon = fundingIcons[index % fundingIcons.length];
                      return <Icon className="w-5 h-5 text-primary shrink-0" />;
                    })()}
                    <p className="text-sm text-foreground font-body">{item}</p>
                  </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 md:px-6 py-14 md:py-20 border-y border-primary/15 bg-transparent">
          <div className="mx-auto max-w-7xl">
            <p className="font-display text-xs tracking-[0.28em] text-primary uppercase">{t("supporters.tiersEyebrow")}</p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {tiers.map((tier) => (
                <article key={tier.name} className="liquid-glass rounded-3xl p-6">
                  <div className="liquid-content">
                  <h3 className="font-display text-2xl font-black text-foreground">{tier.name}</h3>
                  <p className="mt-2 font-display text-primary">{tier.price}</p>
                  <p className="mt-4 text-sm text-muted-foreground font-body">{tier.benefit}</p>
                  <Button variant="portal" className="mt-6 w-full">{t("supporters.select")}</Button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 md:px-6 py-14 md:py-20">
          <div className="mx-auto max-w-4xl space-y-4">
            <h2 className="font-display text-3xl md:text-5xl font-black gradient-text-orange">{t("supporters.faq")}</h2>
            {faqs.map(([q, a]) => (
              <div key={q} className="liquid-glass rounded-2xl p-5">
                <div className="liquid-content">
                <h3 className="font-display text-lg text-foreground">{q}</h3>
                <p className="mt-2 text-sm text-muted-foreground font-body">{a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <SupportCTA />
      </main>
    </div>
  );
};

export default Supporters;
