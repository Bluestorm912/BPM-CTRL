import { useEffect, useState } from "react";
import { Download, Headphones, ShoppingBag, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageProvider";

const STORAGE_KEY = "bpmctrl_first_time_guide_seen";

const FirstTimeGuide = () => {
  const [visible, setVisible] = useState(false);
  const { t } = useLanguage();
  const steps = [
    { icon: Headphones, title: t("firstVisit.playTitle"), text: t("firstVisit.playText") },
    { icon: Download, title: t("firstVisit.installTitle"), text: t("firstVisit.installText") },
    { icon: ShoppingBag, title: t("firstVisit.dropsTitle"), text: t("firstVisit.dropsText") },
    { icon: Users, title: t("firstVisit.membersTitle"), text: t("firstVisit.membersText") },
  ];

  useEffect(() => {
    setVisible(localStorage.getItem(STORAGE_KEY) !== "true");
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-3 bottom-40 z-50 md:bottom-28 md:left-auto md:right-6 md:w-[420px]">
      <div className="liquid-glass rounded-3xl p-4">
        <div className="liquid-content">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="font-display text-[10px] uppercase tracking-[0.28em] text-primary">{t("firstVisit.eyebrow")}</p>
              <h2 className="mt-1 font-display text-xl font-black text-foreground">{t("firstVisit.title")}</h2>
              <p className="mt-2 text-sm text-foreground/66">{t("firstVisit.body")}</p>
            </div>
            <button
              type="button"
              onClick={dismiss}
              className="liquid-button flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-primary"
              aria-label="Close first visit guide"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="rounded-2xl border border-primary/15 bg-black/20 p-3">
                  <Icon className="mb-2 h-4 w-4 text-primary" />
                  <p className="font-display text-xs uppercase tracking-[0.16em] text-foreground">{step.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.text}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex gap-2">
            <a href="/radio" className="flex-1">
              <Button variant="neon" className="w-full">{t("firstVisit.playNow")}</Button>
            </a>
            <button type="button" onClick={dismiss} className="liquid-button rounded-md px-4 font-display text-xs uppercase tracking-wider text-primary">
              {t("firstVisit.gotIt")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstTimeGuide;
