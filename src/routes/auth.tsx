import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Waves } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Login Admin" }, { name: "robots", content: "noindex" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin" as any });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "up") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Akun dibuat! Cek email jika konfirmasi diperlukan.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/admin" as any });
    } catch (e: any) {
      toast.error(e?.message ?? "Gagal");
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) toast.error(r.error.message ?? "Gagal login dengan Google");
  };

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-soft px-4">
      <div className="w-full max-w-md rounded-3xl border border-border/60 bg-card p-8 shadow-elevated">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-hero text-primary-foreground shadow-soft">
            <Waves className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-2xl font-bold">Admin Panel</h1>
          <p className="mt-1 text-sm text-muted-foreground">{mode === "in" ? "Masuk ke dashboard" : "Daftarkan akun admin pertama"}</p>
        </div>
        <form onSubmit={submit} className="grid gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5" required minLength={6} />
          </div>
          <Button type="submit" disabled={loading} className="rounded-full bg-gradient-hero shadow-soft">
            {loading ? "Memproses…" : mode === "in" ? "Login" : "Buat Akun"}
          </Button>
        </form>
        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> atau <div className="h-px flex-1 bg-border" />
        </div>
        <Button type="button" variant="outline" onClick={google} className="w-full rounded-full">Lanjut dengan Google</Button>
        <div className="mt-6 text-center text-sm">
          {mode === "in" ? (
            <button onClick={() => setMode("up")} className="text-primary hover:underline">Belum punya akun? Daftar</button>
          ) : (
            <button onClick={() => setMode("in")} className="text-primary hover:underline">Sudah punya akun? Login</button>
          )}
        </div>
        <div className="mt-4 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">← Kembali ke situs</Link>
        </div>
      </div>
    </div>
  );
}