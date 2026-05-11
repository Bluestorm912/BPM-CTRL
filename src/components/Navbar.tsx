import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Menu, X, Instagram, Twitter, Music } from "lucide-react";
import logo from "@/assets/logo.png";
import { useSiteLinks } from "@/hooks/useSiteLinks";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/radio", label: "Radio" },
  { href: "/shop", label: "Shop" },
  { href: "/supporters", label: "Members" },
  { href: "/#transmissions", label: "Archive" },
  { href: "/#mission", label: "Mission" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = useSiteLinks();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed top-0 left-0 right-0 z-50 px-3 pt-3"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="liquid-glass mx-auto flex max-w-6xl items-center justify-between rounded-full px-4 py-2.5">
        <a href="/" className="flex items-center gap-2">
          <img src={logo} alt="BPM CTRL" className="h-8 w-auto" />
        </a>

        <div className="liquid-content hidden md:flex items-center gap-6 text-xs font-display tracking-[0.15em] text-muted-foreground uppercase">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-primary transition-colors">
              {link.label}
            </a>
          ))}
        </div>

        <div className="liquid-content flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <a href={links.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors p-1.5" aria-label="Instagram">
              <Instagram className="w-4 h-4" />
            </a>
            <a href={links.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors p-1.5" aria-label="Twitter">
              <Twitter className="w-4 h-4" />
            </a>
            <a href={links.tiktok} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors p-1.5" aria-label="TikTok">
              <Music className="w-4 h-4" />
            </a>
          </div>

          <a href="/radio" className="liquid-button flex items-center gap-1.5 rounded-full px-3 py-1.5 text-primary text-xs font-display tracking-wider hover:bg-primary/10 transition-colors">
            <Radio className="w-3 h-3" />
            Play
          </a>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-1.5 text-muted-foreground hover:text-primary transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-primary/15 bg-background/90 backdrop-blur-2xl overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-display tracking-[0.15em] text-muted-foreground uppercase hover:text-primary transition-colors py-2 border-b border-primary/10"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
