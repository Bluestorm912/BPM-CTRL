import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, History, MapPin, ShoppingBag, Sparkles, UserRound } from "lucide-react";
import logo from "@/assets/logo.png";
import mascotDj from "@/assets/mascot-dj.png";
import mascotWelcome from "@/assets/mascot-welcome.png";
import heroBg from "@/assets/hero-bg.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useEnsureShopCustomer, useSaveShopAddress, useShopAddresses, useShopCustomer, useShopOrders } from "@/hooks/useShop";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useLanguage } from "@/i18n/LanguageProvider";

const PRODUCTS = [
  { id: "tee-black", name: "BPM CTRL Signal Tee", category: "Apparel", price: "NGN 38,000", image: heroBg, status: "Pre-order", gated: false },
  { id: "cap", name: "Frequency Cap", category: "Accessories", price: "NGN 24,000", image: mascotDj, status: "New", gated: false },
  { id: "poster", name: "Transmission Poster 001", category: "Prints", price: "NGN 18,000", image: mascotWelcome, status: "Members", gated: true },
  { id: "hoodie", name: "After Hours Hoodie", category: "Apparel", price: "NGN 62,000", image: heroBg, status: "Coming Soon", gated: true },
  { id: "tote", name: "Signal Tote", category: "Accessories", price: "NGN 20,000", image: mascotWelcome, status: "New", gated: false },
  { id: "zine", name: "Dance Is The Language Zine", category: "Prints", price: "NGN 15,000", image: mascotDj, status: "Archive", gated: true },
];

const CATEGORIES = ["All", "Apparel", "Accessories", "Prints"];

const Shop = () => {
  const { user, signIn, signUp, signOut } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [category, setCategory] = useState("All");
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [authForm, setAuthForm] = useState({ email: "", password: "", fullName: "", phone: "" });
  const [addressForm, setAddressForm] = useState({
    label: "Home",
    recipientName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "Nigeria",
    isDefault: true,
  });

  const ensureCustomer = useEnsureShopCustomer();
  const saveAddress = useSaveShopAddress();
  const { data: customer } = useShopCustomer();
  const { data: addresses = [] } = useShopAddresses();
  const { data: orders = [] } = useShopOrders();

  usePageMeta(t("meta.shopTitle"), t("meta.shopDescription"));

  useEffect(() => {
    if (user && !customer && !ensureCustomer.isPending) {
      ensureCustomer.mutate({});
    }
  }, [user, customer, ensureCustomer]);

  useEffect(() => {
    if (!user) return;
    setAddressForm((current) => ({
      ...current,
      recipientName: customer?.full_name || user.user_metadata?.full_name || "",
      phone: customer?.phone || "",
    }));
  }, [user, customer]);

  const products = useMemo(
    () => PRODUCTS.filter((product) => category === "All" || product.category === category),
    [category]
  );

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (authMode === "login") {
        const { error } = await signIn(authForm.email.trim(), authForm.password);
        if (error) throw error;
        toast({ title: t("shop.welcomeBack"), description: t("shop.accountActive") });
      } else {
        const { error } = await signUp(authForm.email.trim(), authForm.password);
        if (error) throw error;
        toast({ title: t("shop.accountCreated"), description: t("shop.confirmEmail") });
        setAuthMode("login");
      }
    } catch (err: any) {
      toast({ title: t("shop.actionFailed"), description: err.message, variant: "destructive" });
    }
  };

  const handleSaveAddress = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await ensureCustomer.mutateAsync({ fullName: addressForm.recipientName, phone: addressForm.phone });
      await saveAddress.mutateAsync(addressForm);
      toast({ title: t("shop.addressSaved"), description: t("shop.addressReady") });
      setAddressForm((current) => ({ ...current, addressLine1: "", addressLine2: "", city: "", state: "" }));
    } catch (err: any) {
      toast({ title: t("shop.addressFailed"), description: err.message, variant: "destructive" });
    }
  };

  const requireLogin = (productName: string) => {
    toast({
      title: t("shop.required"),
      description: t("shop.requiredText", { product: productName }),
      variant: "destructive",
    });
    document.getElementById("shop-account")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed top-0 left-0 right-0 z-50 px-3 pt-3">
        <div className="liquid-glass overflow-hidden rounded-t-3xl border-b border-primary/15 bg-primary/90 text-primary-foreground">
          <div className="flex h-full items-center whitespace-nowrap animate-[wave_18s_linear_infinite]">
            {Array.from({ length: 8 }).map((_, index) => (
              <span key={index} className="font-display text-xs tracking-[0.18em] uppercase px-5">
                {t("shop.marquee")}
              </span>
            ))}
          </div>
        </div>
        <div className="liquid-glass h-14 rounded-b-3xl px-4 md:px-6 flex items-center gap-4">
          <a href="/" className="liquid-content text-muted-foreground hover:text-primary transition-colors" aria-label={t("common.back")}>
            <ArrowLeft className="w-4 h-4" />
          </a>
          <img src={logo} alt="BPM CTRL" className="liquid-content h-7 w-auto" />
          <nav className="liquid-content ml-auto hidden md:flex items-center gap-6 font-display text-xs tracking-[0.18em] uppercase text-muted-foreground">
            {CATEGORIES.map((item) => (
              <button key={item} onClick={() => setCategory(item)} className={category === item ? "text-primary" : "hover:text-primary"}>
                {item}
              </button>
            ))}
          </nav>
          <a href="#shop-account" className="hidden sm:inline-flex font-display text-xs tracking-wider text-muted-foreground hover:text-primary uppercase">
            {user ? t("shop.account") : t("shop.signIn")}
          </a>
          <Button variant="portal" size="sm">
            <ShoppingBag className="w-4 h-4 mr-2" />
            {t("shop.cart")}
          </Button>
        </div>
      </div>

      <main className="pt-28">
        <section className="min-h-[58vh] flex items-end relative overflow-hidden">
          <img src={heroBg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/65 to-background/20" />
          <div className="relative z-10 px-4 md:px-6 pb-10 md:pb-14 max-w-5xl">
            <p className="font-display text-xs tracking-[0.32em] text-primary uppercase mb-3">{t("shop.eyebrow")}</p>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black gradient-text-orange leading-none mb-5">
              {t("shop.title")}
            </h1>
            <p className="text-lg text-orange-amber/75 font-body max-w-2xl">
              {t("shop.body")}
            </p>
          </div>
        </section>

        <section className="px-4 md:px-6 py-8">
          <div className="md:hidden flex gap-2 overflow-x-auto pb-4">
            {CATEGORIES.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`px-3 py-2 rounded border font-display text-xs tracking-wider uppercase shrink-0 ${
                  category === item ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <article key={product.id} className="group liquid-glass min-h-[520px] flex flex-col overflow-hidden rounded-3xl">
                <div className="aspect-[4/5] bg-muted overflow-hidden relative">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-3 left-3 px-2 py-1 bg-background/90 border border-primary/30 text-primary font-display text-[10px] tracking-wider uppercase">
                    {product.status}
                  </span>
                </div>
                <div className="liquid-content p-5 flex-1 flex flex-col">
                  <p className="font-display text-[10px] tracking-[0.24em] text-primary uppercase mb-2">{product.category}</p>
                  <h2 className="font-display text-xl font-black text-foreground mb-2">{product.name}</h2>
                  <p className="text-sm text-muted-foreground font-body mb-5">
                    {t("shop.productBody")}
                  </p>
                  <div className="mt-auto flex items-center justify-between gap-3">
                    <span className="font-display text-lg text-foreground">{product.price}</span>
                    <Button
                      variant="neon"
                      size="sm"
                      onClick={() => (product.gated && !user ? requireLogin(product.name) : toast({ title: t("shop.selected"), description: t("shop.nextStep") }))}
                    >
                      {product.gated && !user ? t("shop.login") : t("shop.view")}
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="shop-account" className="px-4 md:px-6 py-10 md:py-14 border-t border-border">
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
            <aside className="liquid-glass rounded-3xl p-5 md:p-6 h-fit">
              <div className="liquid-content">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg border border-primary/25 bg-primary/10 flex items-center justify-center">
                  <UserRound className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-display text-xs tracking-[0.24em] text-primary uppercase">{t("shop.shopAccount")}</p>
                  <h2 className="font-display text-xl font-black text-foreground">{user ? t("shop.dashboard") : t("shop.createAccess")}</h2>
                </div>
              </div>

              {!user ? (
                <form onSubmit={handleAuth} className="space-y-4">
                  <div className="flex rounded-lg border border-border bg-muted/40 p-1">
                    {(["register", "login"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setAuthMode(mode)}
                        className={`flex-1 rounded-md px-3 py-2 font-display text-xs tracking-wider uppercase ${
                          authMode === mode ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                  {authMode === "register" && (
                    <>
                      <div>
                        <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">{t("shop.fullName")}</Label>
                        <Input value={authForm.fullName} onChange={(e) => setAuthForm({ ...authForm, fullName: e.target.value })} className="mt-1 bg-muted border-border" />
                      </div>
                      <div>
                        <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">{t("shop.phone")}</Label>
                        <Input value={authForm.phone} onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })} className="mt-1 bg-muted border-border" />
                      </div>
                    </>
                  )}
                  <div>
                    <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">{t("shop.email")}</Label>
                    <Input type="email" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} className="mt-1 bg-muted border-border" required />
                  </div>
                  <div>
                    <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">{t("shop.password")}</Label>
                    <Input type="password" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} className="mt-1 bg-muted border-border" required minLength={6} />
                  </div>
                  <Button variant="neon" type="submit" className="w-full">
                    {authMode === "register" ? t("shop.createAccount") : t("shop.signIn")}
                  </Button>
                </form>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground font-body mb-5">{user.email}</p>
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <Sparkles className="w-4 h-4 text-primary mb-2" />
                      <p className="font-display text-2xl text-foreground">{customer?.loyalty_points || 0}</p>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{t("shop.points")}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <UserRound className="w-4 h-4 text-primary mb-2" />
                      <p className="font-display text-sm text-foreground">{customer?.tier || "Signal Member"}</p>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{t("shop.tier")}</p>
                    </div>
                  </div>
                  <Button variant="portal" className="w-full" onClick={() => signOut()}>
                    {t("shop.signOut")}
                  </Button>
                </div>
              )}
              </div>
            </aside>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="liquid-glass rounded-3xl p-5 md:p-6">
                <div className="liquid-content">
                <div className="flex items-center gap-3 mb-5">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h3 className="font-display text-xl font-black text-foreground">{t("shop.addresses")}</h3>
                </div>

                {user ? (
                  <>
                    <form onSubmit={handleSaveAddress} className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                      <Input placeholder="Label" value={addressForm.label} onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })} className="bg-muted border-border" />
                      <Input placeholder="Recipient name" value={addressForm.recipientName} onChange={(e) => setAddressForm({ ...addressForm, recipientName: e.target.value })} className="bg-muted border-border" />
                      <Input placeholder="Phone" value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} className="bg-muted border-border" />
                      <Input placeholder="City" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} className="bg-muted border-border" />
                      <Input placeholder="State" value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} className="bg-muted border-border" />
                      <Input placeholder="Country" value={addressForm.country} onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })} className="bg-muted border-border" />
                      <Input placeholder="Address line 1" value={addressForm.addressLine1} onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })} className="bg-muted border-border md:col-span-2" required />
                      <Input placeholder="Address line 2" value={addressForm.addressLine2} onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })} className="bg-muted border-border md:col-span-2" />
                      <Button variant="neon" type="submit" disabled={saveAddress.isPending} className="md:col-span-2">
                        {saveAddress.isPending ? t("shop.saving") : t("shop.saveAddress")}
                      </Button>
                    </form>
                    <div className="space-y-3">
                      {addresses.map((address) => (
                        <div key={address.id} className="rounded-lg border border-border bg-muted/30 p-3">
                          <p className="font-display text-sm text-foreground">{address.label}</p>
                          <p className="text-sm text-muted-foreground font-body">{address.address_line_1}, {address.city}, {address.state}</p>
                        </div>
                      ))}
                      {addresses.length === 0 && <p className="text-sm text-muted-foreground font-body">{t("shop.noAddresses")}</p>}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground font-body">{t("shop.signInForAddress")}</p>
                )}
                </div>
              </div>

              <div className="liquid-glass rounded-3xl p-5 md:p-6">
                <div className="liquid-content">
                <div className="flex items-center gap-3 mb-5">
                  <History className="w-5 h-5 text-primary" />
                  <h3 className="font-display text-xl font-black text-foreground">{t("shop.orders")}</h3>
                </div>
                {user ? (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div key={order.id} className="rounded-lg border border-border bg-muted/30 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-display text-sm text-foreground">{order.order_number}</p>
                          <p className="text-sm text-primary">{order.currency} {order.total.toLocaleString()}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{order.status} / {order.payment_status}</p>
                      </div>
                    ))}
                    {orders.length === 0 && <p className="text-sm text-muted-foreground font-body">{t("shop.futureOrders")}</p>}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground font-body">{t("shop.signInForOrders")}</p>
                )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Shop;
