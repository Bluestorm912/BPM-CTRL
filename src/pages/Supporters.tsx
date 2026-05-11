import { ArrowLeft, Heart, RadioTower, Satellite, ShieldCheck, Users } from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import SignalStatusBadge from "@/components/SignalStatusBadge";
import SupportCTA from "@/components/SupportCTA";
import { usePageMeta } from "@/hooks/usePageMeta";

const funding = [
  "Radio operations and streaming infrastructure",
  "Music programming, resident shows, and guest mixes",
  "Creators, DJs, editors, photographers, and writers",
  "Events, pop-ups, community sessions, and field recordings",
  "Platform growth, CMS tools, analytics, and shop operations",
];

const tiers = [
  { name: "Listener", price: "Free", benefit: "Join the community signal and get updates." },
  { name: "Supporter", price: "Monthly", benefit: "Help fund programming and early community drops." },
  { name: "Patron", price: "Custom", benefit: "Support specific shows, events, or creator projects." },
];

const fundingIcons = [RadioTower, Satellite, Users, ShieldCheck, Heart];

const Supporters = () => {
  usePageMeta(
    "Support BPM Control - Join the Mission",
    "Support BPM Control radio operations, music programming, creators, events, and platform growth."
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="h-14 px-4 md:px-6 flex items-center gap-4">
          <a href="/" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Back to BPM CTRL">
            <ArrowLeft className="w-4 h-4" />
          </a>
          <img src={logo} alt="BPM CTRL" className="h-7 w-auto" />
          <nav className="ml-auto flex items-center gap-4 font-display text-xs tracking-wider uppercase text-muted-foreground">
            <a href="/radio" className="hover:text-primary">Radio</a>
            <a href="/shop" className="hover:text-primary">Shop</a>
          </nav>
        </div>
      </header>

      <main className="pt-14">
        <section className="relative min-h-[78vh] px-4 md:px-6 py-16 md:py-24 flex items-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,hsl(22_100%_55%/0.18),transparent_36%)]" />
          <div className="absolute inset-0 scanline" />
          <div className="relative z-10 mx-auto max-w-5xl text-center">
            <SignalStatusBadge label="Mission Support Channel" />
            <h1 className="mt-6 font-display text-5xl md:text-7xl lg:text-8xl font-black gradient-text-orange leading-none">
              SUPPORT BPM CONTROL
            </h1>
            <p className="mt-6 mx-auto max-w-3xl text-lg md:text-xl text-orange-amber/75 font-body">
              Join the mission behind the live signal. Supporters help keep music programming, creator work, events, and the platform moving.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="neon" size="xl">
                <Heart className="w-5 h-5 mr-2" />
                Join Supporters
              </Button>
              <a href="/radio"><Button variant="portal" size="xl">Listen First</Button></a>
            </div>
          </div>
        </section>

        <section className="px-4 md:px-6 py-14 md:py-20">
          <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-6">
            <div>
              <p className="font-display text-xs tracking-[0.28em] text-primary uppercase">What You Fund</p>
              <h2 className="mt-2 font-display text-3xl md:text-5xl font-black gradient-text-orange">THE SIGNAL NEEDS CREW</h2>
              <p className="mt-4 text-muted-foreground font-body">
                BPM Control is built as a music and culture station. Support keeps the platform independent, active, and able to document the community properly.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {funding.map((item, index) => (
                <div key={item} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const Icon = fundingIcons[index % fundingIcons.length];
                      return <Icon className="w-5 h-5 text-primary shrink-0" />;
                    })()}
                    <p className="text-sm text-foreground font-body">{item}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 md:px-6 py-14 md:py-20 border-y border-border bg-card/30">
          <div className="mx-auto max-w-7xl">
            <p className="font-display text-xs tracking-[0.28em] text-primary uppercase">Support Tiers</p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {tiers.map((tier) => (
                <article key={tier.name} className="glow-border-orange rounded-2xl bg-card p-6">
                  <h3 className="font-display text-2xl font-black text-foreground">{tier.name}</h3>
                  <p className="mt-2 font-display text-primary">{tier.price}</p>
                  <p className="mt-4 text-sm text-muted-foreground font-body">{tier.benefit}</p>
                  <Button variant="portal" className="mt-6 w-full">Select</Button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 md:px-6 py-14 md:py-20">
          <div className="mx-auto max-w-4xl space-y-4">
            <h2 className="font-display text-3xl md:text-5xl font-black gradient-text-orange">FAQ</h2>
            {[
              ["Where does support go?", "Radio operations, creator programming, events, editorial work, and platform growth."],
              ["Can brands support shows?", "Yes. Patron support can be shaped around specific shows, events, or community projects."],
              ["Is there a supporter wall?", "A community wall is planned. The CMS already has room to expand into supporter profiles."],
            ].map(([q, a]) => (
              <div key={q} className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-display text-lg text-foreground">{q}</h3>
                <p className="mt-2 text-sm text-muted-foreground font-body">{a}</p>
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
