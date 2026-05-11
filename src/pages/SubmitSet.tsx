import { useState } from "react";
import { ArrowLeft, Headphones, Upload } from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { uploadCommunityFile, usePublishedDjSets, useSubmitDjSet } from "@/hooks/useCommunitySubmissions";
import { usePageMeta } from "@/hooks/usePageMeta";

const SubmitSet = () => {
  const { toast } = useToast();
  const submitDjSet = useSubmitDjSet();
  const { data: publishedSets = [] } = usePublishedDjSets();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    dj_name: "",
    email: "",
    city: "",
    country: "",
    title: "",
    genre: "",
    set_url: "",
    cover_image_url: "",
    notes: "",
  });

  usePageMeta("Submit a DJ Set - BPM CTRL", "DJs can submit mixes and sets for BPM CTRL editorial review.");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      let audio_url = "";
      if (audioFile) {
        audio_url = await uploadCommunityFile(audioFile, `dj-submissions/${Date.now()}-${audioFile.name}`);
      }
      if (!audio_url && !form.set_url.trim()) {
        toast({ title: "Add a set", description: "Upload an audio file or paste a link.", variant: "destructive" });
        return;
      }
      await submitDjSet.mutateAsync({ ...form, audio_url });
      toast({ title: "Set submitted", description: "Our editors will listen and publish it if it fits the signal." });
      setForm({ dj_name: "", email: "", city: "", country: "", title: "", genre: "", set_url: "", cover_image_url: "", notes: "" });
      setAudioFile(null);
    } catch (err: any) {
      toast({ title: "Submission failed", description: err.message, variant: "destructive" });
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
          <a href="/careers" className="liquid-content ml-auto font-display text-xs uppercase tracking-wider text-muted-foreground hover:text-primary">
            Join
          </a>
        </div>
      </header>

      <main className="pt-24 px-4 md:px-6 pb-20">
        <section className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-6 items-start">
          <div className="pt-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 px-4 py-2 text-primary">
              <Headphones className="h-4 w-4" />
              <span className="font-display text-xs uppercase tracking-[0.24em]">DJ Submissions</span>
            </div>
            <h1 className="mt-6 font-display text-5xl md:text-7xl font-black gradient-text-orange leading-none">
              SEND YOUR SET
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-foreground/70">
              BPM CTRL is community-led. DJs anywhere in the world can submit sets for review. If it fits the culture, we publish it inside the platform.
            </p>
          </div>

          <form onSubmit={submit} className="liquid-glass rounded-3xl p-5 md:p-7">
            <div className="liquid-content space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-display text-xs uppercase tracking-wider text-muted-foreground">DJ Name</Label>
                  <Input value={form.dj_name} onChange={(event) => setForm({ ...form, dj_name: event.target.value })} className="mt-1 bg-muted border-border" required />
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
                <div>
                  <Label className="font-display text-xs uppercase tracking-wider text-muted-foreground">Set Title</Label>
                  <Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="mt-1 bg-muted border-border" required />
                </div>
                <div>
                  <Label className="font-display text-xs uppercase tracking-wider text-muted-foreground">Genre / Energy</Label>
                  <Input value={form.genre} onChange={(event) => setForm({ ...form, genre: event.target.value })} className="mt-1 bg-muted border-border" placeholder="Afro house, amapiano, techno..." />
                </div>
              </div>
              <div>
                <Label className="font-display text-xs uppercase tracking-wider text-muted-foreground">Set Link</Label>
                <Input value={form.set_url} onChange={(event) => setForm({ ...form, set_url: event.target.value })} className="mt-1 bg-muted border-border" placeholder="SoundCloud, Mixcloud, Drive, Dropbox..." />
              </div>
              <label className="flex items-center gap-3 rounded-2xl border border-border bg-muted/50 px-4 py-4 cursor-pointer">
                <Upload className="h-5 w-5 text-primary" />
                <span className="text-sm text-foreground">{audioFile ? audioFile.name : "Or upload an audio file"}</span>
                <input type="file" accept="audio/*" className="hidden" onChange={(event) => setAudioFile(event.target.files?.[0] || null)} />
              </label>
              <div>
                <Label className="font-display text-xs uppercase tracking-wider text-muted-foreground">Notes</Label>
                <Textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="mt-1 bg-muted border-border" rows={4} placeholder="Tell us about the set, where it was recorded, and why it matters." />
              </div>
              <Button variant="neon" type="submit" disabled={submitDjSet.isPending}>
                {submitDjSet.isPending ? "Submitting..." : "Submit for Review"}
              </Button>
            </div>
          </form>
        </section>

        {publishedSets.length > 0 && (
          <section className="mx-auto max-w-6xl pt-14">
            <h2 className="font-display text-3xl md:text-5xl font-black gradient-text-orange">COMMUNITY SETS</h2>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {publishedSets.map((set) => (
                <article key={set.id} className="liquid-glass rounded-3xl p-5">
                  <div className="liquid-content">
                    <p className="font-display text-xs uppercase tracking-wider text-primary">{set.genre || "DJ Set"}</p>
                    <h3 className="mt-2 font-display text-xl text-foreground">{set.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{set.dj_name} / {set.city}</p>
                    {set.audio_url && <audio controls className="mt-4 w-full" src={set.audio_url} />}
                    {!set.audio_url && set.set_url && <a href={set.set_url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex text-sm text-primary">Open set</a>}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default SubmitSet;
