import { Headphones, Home, ShoppingBag, Users } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";

const actions = [
  { href: "/", key: "nav.home", icon: Home },
  { href: "/radio", key: "nav.play", icon: Headphones },
  { href: "/shop", key: "nav.shop", icon: ShoppingBag },
  { href: "/supporters", key: "nav.members", icon: Users },
];

const LiquidActionBar = () => {
  const { t } = useLanguage();

  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 md:left-1/2 md:right-auto md:w-[520px] md:-translate-x-1/2" aria-label="Primary actions">
    <div className="liquid-glass rounded-full px-2 py-2">
      <div className="liquid-content grid grid-cols-4 items-center gap-1">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <a
              key={action.href}
              href={action.href}
              className="flex min-h-12 flex-col items-center justify-center rounded-full px-2 text-[10px] font-display uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <Icon className="mb-1 h-4 w-4" />
              {t(action.key)}
            </a>
          );
        })}
      </div>
    </div>
    </nav>
  );
};

export default LiquidActionBar;
