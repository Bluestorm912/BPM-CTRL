import { MonitorDown, Smartphone } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";

const InstallGuide = () => {
  const { t } = useLanguage();

  return (
    <section id="install-guide" className="px-4 md:px-6 py-14 md:py-20">
    <div className="mx-auto max-w-7xl">
      <div className="liquid-glass rounded-3xl p-6 md:p-9">
        <div className="liquid-content grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.3em] text-primary">{t("install.eyebrow")}</p>
            <h2 className="mt-2 font-display text-3xl md:text-5xl font-black gradient-text-orange">{t("install.title")}</h2>
            <p className="mt-4 max-w-xl text-sm md:text-base text-foreground/68">
              {t("install.body")}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-primary/15 bg-black/20 p-5">
              <Smartphone className="mb-4 h-6 w-6 text-primary" />
              <h3 className="font-display text-sm uppercase tracking-[0.16em] text-foreground">{t("install.iphone")}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t("install.iphoneText")}
              </p>
            </div>
            <div className="rounded-2xl border border-primary/15 bg-black/20 p-5">
              <MonitorDown className="mb-4 h-6 w-6 text-primary" />
              <h3 className="font-display text-sm uppercase tracking-[0.16em] text-foreground">{t("install.desktop")}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t("install.desktopText")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </section>
  );
};

export default InstallGuide;
