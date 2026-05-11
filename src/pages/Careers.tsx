import { useState } from "react";
import { ArrowLeft, HandHeart, RadioTower, Users } from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useSubmitCommunityApplication } from "@/hooks/useCommunitySubmissions";
import { usePageMeta } from "@/hooks/usePageMeta";
import CommunitySection from "@/components/CommunitySection";

const paths = [
  { value: "volunteer", title: "Volunteer", text: "Help with events, community ops, documentation, and on-ground support." },
  { value: "intern", title: "Intern", text: "Learn through editorial, media, design, production, radio, or operations." },
  { value: "fund", title: "Fund", text: "Support the cause through sponsorship, patronage, partnerships, or resources." },
];

const Careers = () => {
  const { toast } = useToast();
  const submitApplication = useSubmitCommunityApplication();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    city: "",
    country: "",
    interest: "volunteer" as "volunteer" | "intern" | "fund",
    skills: "",
    message: "",
  });

  usePageMeta("Join BPM CTRL - Volunteer, Intern, Fund", "Join BPM CTRL as a volunteer, intern, creator, or supporter funding the culture.");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await submitApplication.mutateAsync(form);
      toast({ title: "Application received", description: "Thank you for wanting to build with BPM CTRL." });
      setForm({ full_name: "", email: "", city: "", country: "", interest: "volunteer", skills: "", message: "" });
    } catch (err: any) {
      toast({ title: "Could not submit", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 left-0 right-0 z-50 px-3 pt-3">
        <div className="liquid-glass h-14 rounded-full px-4 md:px-6 flex items-center gap-4">
          <a href="/" className="liquid-content text-muted-foreground hover:text-primary" aria-label="Back to BPM CTRL">
            <ArrowLeft className="h-4 w-4" />
          </a>
          <img src={logo} alt="BPM CTRL" className="liquid-content h-7 w-auto" />
          <a href="/submit-set" className="liquid-content ml-auto font-display text-xs uppercase tracking-wider text-muted-foreground hover:text-primary">
            Submit Set
          </a>
        </div>
      </header>

      <main className="pt-24 px-4 md:px-6 pb-20">
        <section id="join" className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6 items-start">
          <div className="pt-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 px-4 py-2 text-primary">
              <RadioTower className="h-4 w-4" />
              <span className="font-display text-xs uppercase tracking-[0.24em]">Community Led</span>
            </div>
            <h1 className="mt-6 font-display text-5xl md:text-7xl font-black gradient-text-orange leading-none">
              BUILD THE CULTURE WITH US
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-foreground/70">
              BPM CTRL is a media, radio, and culture project powered by people. We welcome volunteers, interns, writers, DJs, designers, organizers, and funders who want to document and move the culture forward.
            </p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {paths.map((path) => (
                <button
                  key={path.value}
                  type="button"
                  onClick={() => setForm({ ...form, interest: path.value as typeof form.interest })}
                  className={`rounded-2xl border p-4 text-left transition-colors ${
                    form.interest === path.value ? "border-primary bg-primary/10" : "border-border bg-black/20"
                  }`}
                >
                  <Users className="mb-3 h-5 w-5 text-primary" />
                  <p className="font-display text-sm uppercase tracking-wider text-foreground">{path.title}</p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{path.text}</p>
                </button>
              ))}
            </div>
            <div id="support" className="mt-8 liquid-glass rounded-3xl p-5">
              <div className="liquid-content">
                <p className="font-display text-xs uppercase tracking-[0.24em] text-primary">Members & Funders</p>
                <h2 className="mt-2 font-display text-2xl text-foreground">Support the cause.</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  If you cannot volunteer time, you can still help fund radio operations, creator work, community events, internships, and the platform tools that keep BPM CTRL independent.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="liquid-glass rounded-3xl p-5 md:p-7">
            <div className="liquid-content space-y-4">
              <div className="flex items-center gap-3">
                <HandHeart className="h-5 w-5 text-primary" />
                <h2 className="font-display text-xl text-foreground">Join the Signal</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-display text-xs uppercase tracking-wider text-muted-foreground">Full Name</Label>
                  <Input value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} className="mt-1 bg-muted border-border" required />
                </div>
                <div>
                  <Label className="font-display text-xs uppercase tracking-wider text-muted-foreground">Email</Label>
                  <Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-1 bg-muted border-border" required />
                </div>
                <div>
                  <Label className="font-display text-xs uppercase tracking-wider text-muted-foreground">City</Label>
                  <Input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} className="mt-1 bg-muted border-border" />
                </div>
                <div>
                  <Label className="font-display text-xs uppercase tracking-wider text-muted-foreground">Country</Label>
                  <Input value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value })} className="mt-1 bg-muted border-border" />
                </div>
              </div>
              <div>
                <Label className="font-display text-xs uppercase tracking-wider text-muted-foreground">Skills / Support</Label>
                <Input value={form.skills} onChange={(event) => setForm({ ...form, skills: event.target.value })} className="mt-1 bg-muted border-border" placeholder="Writing, DJing, design, funding, venue, production..." />
              </div>
              <div>
                <Label className="font-display text-xs uppercase tracking-wider text-muted-foreground">Why do you want to join?</Label>
                <Textarea value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} className="mt-1 bg-muted border-border" rows={5} required />
              </div>
              <Button variant="neon" type="submit" disabled={submitApplication.isPending}>
                {submitApplication.isPending ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </section>
        <CommunitySection />
      </main>
    </div>
  );
};

export default Careers;
