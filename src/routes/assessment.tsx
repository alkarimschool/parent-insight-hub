import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchWebsite } from "@/lib/settings";
import { PublicNav } from "@/components/site/PublicNav";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/assessment")({
  head: () => ({
    meta: [
      { title: "Mulai Assessment — Parent Awareness Assessment" },
      { name: "description", content: "Isi data orang tua dan anak untuk memulai asesmen perkembangan." },
    ],
  }),
  component: AssessmentPage,
});

function calcAge(iso: string) {
  if (!iso) return "";
  const b = new Date(iso);
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age + " tahun";
}

function AssessmentPage() {
  const website = useQuery({ queryKey: ["website"], queryFn: fetchWebsite });
  const navigate = useNavigate();
  const [form, setForm] = useState({
    parent_name: "",
    whatsapp: "",
    child_name: "",
    gender: "L" as "L" | "P",
    birth_date: "",
    school: "",
    class_name: "",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.parent_name || !form.whatsapp || !form.child_name || !form.birth_date) {
      toast.error("Mohon lengkapi data wajib.");
      return;
    }
    try {
      sessionStorage.setItem("paa_form", JSON.stringify(form));
    } catch {}
    navigate({ to: "/assessment/questions" });
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <PublicNav siteName={website.data?.site_name ?? "Parent Awareness Assessment"} logoText={website.data?.logo_text ?? "PAA"} />
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Data Orang Tua & Anak</h1>
          <p className="mt-2 text-muted-foreground">Isi data berikut untuk memulai asesmen.</p>
        </div>
        <form onSubmit={submit} className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft sm:p-8">
          <div className="grid gap-5">
            <div>
              <Label htmlFor="parent_name">Nama Orang Tua *</Label>
              <Input id="parent_name" value={form.parent_name} onChange={(e) => setForm({ ...form, parent_name: e.target.value })} className="mt-1.5" maxLength={120} />
            </div>
            <div>
              <Label htmlFor="whatsapp">Nomor WhatsApp *</Label>
              <Input id="whatsapp" placeholder="08xxxxxxxxxx" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="mt-1.5" maxLength={30} />
            </div>
            <hr className="border-border/60" />
            <div>
              <Label htmlFor="child_name">Nama Anak *</Label>
              <Input id="child_name" value={form.child_name} onChange={(e) => setForm({ ...form, child_name: e.target.value })} className="mt-1.5" maxLength={120} />
            </div>
            <div>
              <Label>Jenis Kelamin *</Label>
              <RadioGroup value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v as "L" | "P" })} className="mt-2 flex gap-6">
                <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="L" /> Laki-laki</label>
                <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="P" /> Perempuan</label>
              </RadioGroup>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="birth_date">Tanggal Lahir *</Label>
                <Input id="birth_date" type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} className="mt-1.5" />
              </div>
              <div>
                <Label>Umur</Label>
                <Input value={calcAge(form.birth_date)} readOnly className="mt-1.5 bg-muted" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="school">Nama Sekolah</Label>
                <Input id="school" value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} className="mt-1.5" maxLength={200} />
              </div>
              <div>
                <Label htmlFor="class_name">Kelas</Label>
                <Input id="class_name" value={form.class_name} onChange={(e) => setForm({ ...form, class_name: e.target.value })} className="mt-1.5" maxLength={120} />
              </div>
            </div>
          </div>
          <div className="mt-8 flex items-center justify-between gap-3">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Kembali</Link>
            <Button type="submit" size="lg" className="rounded-full bg-gradient-hero shadow-soft">
              Lanjut Assessment <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}