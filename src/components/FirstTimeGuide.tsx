import { useEffect, useState } from "react";
import { Download, Headphones, ShoppingBag, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "bpmctrl_first_time_guide_seen";

const steps = [
  { icon: Headphones, title: "Play", text: "Start with the live player or archive." },
  { icon: Download, title: "Install", text: "Add BPM CTRL to your home screen." },
  { icon: ShoppingBag, title: "Drops", text: "Browse shop releases and member access." },
  { icon: Users, title: "Members", text: "Support the signal and stay close." },
];

const FirstTimeGuide = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(localStorage.getItem(STORAGE_KEY) !== "true");
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-3 bottom-24 z-50 md:bottom-6 md:left-auto md:right-6 md:w-[420px]">
      <div className="liquid-glass rounded-3xl p-4">
        <div className="liquid-content">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="font-display text-[10px] uppercase tracking-[0.28em] text-primary">First Visit</p>
              <h2 className="mt-1 font-display text-xl font-black text-foreground">Start inside the signal.</h2>
              <p className="mt-2 text-sm text-foreground/66">Four quick paths. No account needed to begin.</p>
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
              <Button variant="neon" className="w-full">Play Now</Button>
            </a>
            <button type="button" onClick={dismiss} className="liquid-button rounded-md px-4 font-display text-xs uppercase tracking-wider text-primary">
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstTimeGuide;
