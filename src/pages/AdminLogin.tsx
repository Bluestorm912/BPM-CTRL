import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [mode, setMode] = useState<"login" | "signup" | "reset" | "update">("login");
  const { signIn, signUp, resetPassword, updatePassword } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("update");
        setPassword("");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const getNetworkHint = (message: string) => {
    if (!message.toLowerCase().includes("fetch")) return message;
    return "Network/auth configuration issue: verify backend URL + key pair, and ensure your production domain is in Auth Site URL and Redirect URLs.";
  };

  const getLoginHint = (message: string) => {
    if (!message.toLowerCase().includes("invalid login credentials")) return getNetworkHint(message);
    return "That email/password is not accepted. Use Reset password below, or create the CMS user first and confirm the email.";
  };

  const withTimeout = async <T,>(promise: Promise<T>, label: string): Promise<T> => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const timeout = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error(`${label} timed out. Check your connection and try again.`)), 15000);
    });

    try {
      return await Promise.race([promise, timeout]);
    } finally {
      clearTimeout(timeoutId!);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusText("");

    try {
      if (mode === "update") {
        const { error } = await withTimeout(updatePassword(password), "Password update");
        if (error) {
          toast({ title: "Update failed", description: getNetworkHint(error.message), variant: "destructive" });
        } else {
          toast({ title: "Password updated", description: "Use your new password to open the CMS." });
          setMode("login");
          setPassword("");
        }
      } else if (mode === "reset") {
        const { error } = await withTimeout(resetPassword(email.trim()), "Password reset");
        if (error) {
          toast({ title: "Reset failed", description: getNetworkHint(error.message), variant: "destructive" });
        } else {
          toast({
            title: "Reset email sent",
            description: "Check the inbox for a secure password reset link, then return to the CMS.",
          });
          setMode("login");
        }
      } else if (mode === "signup") {
        const { error } = await withTimeout(signUp(email.trim(), password), "Signup");
        if (error) {
          toast({ title: "Signup failed", description: getNetworkHint(error.message), variant: "destructive" });
        } else {
          toast({
            title: "Account created",
            description: "Check your email to verify your account, then log in.",
          });
          setMode("login");
        }
      } else {
        const { error } = await withTimeout(signIn(email.trim().toLowerCase(), password), "Login");
        if (error) {
          setStatusText(getLoginHint(error.message));
          toast({ title: "Login failed", description: getLoginHint(error.message), variant: "destructive" });
        } else {
          setStatusText("Login successful. Opening CMS...");
          toast({ title: "Login successful", description: "Opening the CMS dashboard." });
          window.setTimeout(() => {
            window.location.assign("/admin");
          }, 150);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setStatusText(message);
      toast({ title: mode === "signup" ? "Signup failed" : mode === "reset" ? "Reset failed" : mode === "update" ? "Update failed" : "Login failed", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm glow-border-orange rounded-2xl bg-card p-8 relative">
        <div className="scanline absolute inset-0 pointer-events-none opacity-10 rounded-2xl" />
        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow mx-auto mb-4" />
            <h1 className="font-display text-2xl font-black gradient-text-orange">
              {mode === "login" ? "CMS SIGN IN" : mode === "reset" ? "RESET PASSWORD" : mode === "update" ? "NEW PASSWORD" : "CREATE CMS USER"}
            </h1>
            <p className="text-muted-foreground text-xs font-display tracking-wider mt-2">
              {mode === "login" ? "BPM CTRL publishing access" : mode === "reset" ? "Send a secure reset link" : mode === "update" ? "Set your CMS password" : "New accounts require admin approval"}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode !== "update" && (
              <div>
                <Label htmlFor="email" className="font-display text-xs tracking-wider text-muted-foreground uppercase">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 bg-muted border-border" autoComplete="email" required />
              </div>
            )}
            {mode !== "reset" && (
              <div>
                <Label htmlFor="password" className="font-display text-xs tracking-wider text-muted-foreground uppercase">{mode === "update" ? "New Password" : "Password"}</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 bg-muted border-border" autoComplete={mode === "update" ? "new-password" : "current-password"} required minLength={6} />
              </div>
            )}
            <Button variant="neon" className="w-full" type="submit" disabled={loading}>
              {loading ? "Working..." : mode === "login" ? "Open CMS" : mode === "reset" ? "Send Reset Link" : mode === "update" ? "Update Password" : "Create Account"}
            </Button>
          </form>
          {statusText && (
            <p className="mt-4 rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-center text-xs text-muted-foreground">
              {statusText}
            </p>
          )}
          <div className="mt-4 flex flex-col gap-2 text-center">
            {mode === "login" && (
              <>
                <button onClick={() => setMode("reset")} className="text-xs text-primary hover:text-primary/80 transition-colors font-display tracking-wider">
                  Forgot password? Reset it
                </button>
                <button onClick={() => setMode("signup")} className="text-xs text-primary hover:text-primary/80 transition-colors font-display tracking-wider">
                  Need an account? Sign up
                </button>
              </>
            )}
            {mode !== "login" && mode !== "update" && (
              <button onClick={() => setMode("login")} className="text-xs text-primary hover:text-primary/80 transition-colors font-display tracking-wider">
                Back to CMS login
              </button>
            )}
          </div>
          <a href="/" className="block text-center mt-3 text-xs text-muted-foreground hover:text-primary transition-colors font-display tracking-wider">
            Back to Site
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
