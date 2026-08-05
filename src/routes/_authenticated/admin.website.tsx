import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchHomepage, fetchWebsite, HomepageSettingsData as HomepageData, WebsiteSettingsData, DEFAULT_HOMEPAGE_DATA, DEFAULT_WEBSITE_DATA } from "@/lib/settings";
type WebsiteData = WebsiteSettingsData & Record<string, any>;
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Save, Globe, Home, Plus, Trash2, HelpCircle, Sparkles, Layers, ShieldCheck, HeartHandshake, ListOrdered, Megaphone } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { saveWebsiteSettingsFn, saveHomepageSettingsFn } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/website")({
  component: WebsiteAdmin,
});

const POPULAR_ICONS = [
  "BrainCircuit", "Sparkles", "ShieldCheck", "CheckCircle", "Heart",
  "Target", "Clock", "Star", "Lightbulb", "UserCheck", "Award",
  "BookOpen", "Smile", "Zap", "Compass"
];

function WebsiteAdmin() {
  const qc = useQueryClient();
  const saveWebFn = useServerFn(saveWebsiteSettingsFn);
  const saveHomeFn = useServerFn(saveHomepageSettingsFn);

  const [savingWeb, setSavingWeb] = useState(false);
  const [savingHome, setSavingHome] = useState(false);

  const websiteQuery = useQuery({ queryKey: ["admin-website-edit"], queryFn: fetchWebsite });
  const homepageQuery = useQuery({ queryKey: ["admin-homepage-edit"], queryFn: fetchHomepage });

  const [web, setWeb] = useState<WebsiteData>(DEFAULT_WEBSITE_DATA);
  const [home, setHome] = useState<HomepageData>(DEFAULT_HOMEPAGE_DATA);

  useEffect(() => {
    if (websiteQuery.data) setWeb(websiteQuery.data);
  }, [websiteQuery.data]);

  useEffect(() => {
    if (homepageQuery.data) setHome(homepageQuery.data);
  }, [homepageQuery.data]);

  const saveWebsite = async () => {
    if (!web) return;
    setSavingWeb(true);
    try {
      console.info("[AdminWebsite] Submitting website settings...", web);
      const res = await saveWebFn({ data: web });
      if (!res || (res as any).ok !== true) {
        throw new Error((res as any)?.error || "Gagal menyimpan website settings ke database");
      }
      toast.success("Pengaturan website umum berhasil disimpan!");
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["website"] }),
        qc.invalidateQueries({ queryKey: ["admin-website-edit"] }),
        qc.refetchQueries({ queryKey: ["website"] }),
        qc.refetchQueries({ queryKey: ["admin-website-edit"] }),
      ]);
    } catch (e: any) {
      console.error("[AdminWebsite] Error saving website settings:", e);
      toast.error("Gagal menyimpan website settings: " + (e?.message ?? "Error tidak diketahui"));
    } finally {
      setSavingWeb(false);
    }
  };

  const saveHomepage = async () => {
    if (!home) return;
    setSavingHome(true);
    try {
      console.info("[AdminWebsite] Submitting homepage data to database...", home);
      const res = await saveHomeFn({ data: home });
      if (!res || (res as any).ok !== true) {
        throw new Error((res as any)?.error || "Gagal menyimpan data homepage ke database");
      }
      toast.success("Konten Homepage berhasil disimpan!");
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["homepage"] }),
        qc.invalidateQueries({ queryKey: ["admin-homepage-edit"] }),
        qc.refetchQueries({ queryKey: ["homepage"] }),
        qc.refetchQueries({ queryKey: ["admin-homepage-edit"] }),
      ]);
    } catch (e: any) {
      console.error("[AdminWebsite] Error saving homepage settings:", e);
      toast.error("Gagal menyimpan homepage settings: " + (e?.message ?? "Error tidak diketahui"));
    } finally {
      setSavingHome(false);
    }
  };

  if (websiteQuery.isLoading || homepageQuery.isLoading) {
    return <div className="py-12 text-center text-muted-foreground font-medium">Memuat pengaturan website…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pengaturan Website & Homepage</h1>
        <p className="text-sm text-muted-foreground">
          Kelola seluruh konten, teks, kontak, SEO, dan seksi homepage secara fleksibel.
        </p>
      </div>

      <datalist id="popular-icon-list">
        {POPULAR_ICONS.map((icon) => (
          <option key={icon} value={icon} />
        ))}
      </datalist>

      <Tabs defaultValue="homepage" className="w-full">
        <TabsList className="rounded-full bg-muted/60 p-1">
          <TabsTrigger value="homepage" className="rounded-full px-5 py-2 text-xs font-semibold">
            <Home className="mr-1.5 h-3.5 w-3.5" /> Konten Homepage
          </TabsTrigger>
          <TabsTrigger value="website" className="rounded-full px-5 py-2 text-xs font-semibold">
            <Globe className="mr-1.5 h-3.5 w-3.5" /> Identitas & SEO Website
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: HOMEPAGE CONTENT */}
        <TabsContent value="homepage" className="mt-6 space-y-6">
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft space-y-8">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Home className="h-5 w-5 text-primary" /> Konten Hero & Seksi Homepage
              </h2>
              <Button onClick={saveHomepage} disabled={savingHome} className="rounded-full bg-gradient-hero shadow-soft">
                <Save className="mr-1.5 h-4 w-4" /> {savingHome ? "Menyimpan…" : "Simpan Homepage"}
              </Button>
            </div>

            {/* HERO BANNER */}
            <div className="space-y-4">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" /> Hero Banner
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="font-semibold">Badge Teks Atas Judul</Label>
                  <Input
                    placeholder="Contoh: Terpercaya & Komprehensif"
                    value={home.hero_badge ?? ""}
                    onChange={(e) => setHome({ ...home, hero_badge: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="font-semibold">Teks Tombol Utama Hero (CTA)</Label>
                  <Input
                    placeholder="Contoh: Mulai Asesmen Sekarang"
                    value={home.hero_cta ?? ""}
                    onChange={(e) => setHome({ ...home, hero_cta: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="font-semibold">Judul Utama Hero (Hero Title)</Label>
                  <Input
                    placeholder="Judul utama banner homepage"
                    value={home.hero_title ?? ""}
                    onChange={(e) => setHome({ ...home, hero_title: e.target.value })}
                    className="mt-1 font-bold text-base"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="font-semibold">Deskripsi / Subtitle Hero</Label>
                  <Textarea
                    placeholder="Deskripsi singkat di bawah judul utama"
                    value={home.hero_subtitle ?? ""}
                    onChange={(e) => setHome({ ...home, hero_subtitle: e.target.value })}
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* WHY US SECTION */}
            <div className="border-t border-border/40 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Seksi Keunggulan (Why PAA) ({home.why_items?.length ?? 0})
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() =>
                    setHome({
                      ...home,
                      why_items: [
                        ...(home.why_items ?? []),
                        { icon: "Sparkles", title: "Keunggulan Baru", desc: "Penjelasan detail keunggulan." },
                      ],
                    })
                  }
                  className="rounded-full"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Tambah Item Keunggulan
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="font-semibold">Judul Seksi Keunggulan</Label>
                  <Input
                    value={home.why_title ?? ""}
                    onChange={(e) => setHome({ ...home, why_title: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="font-semibold">Subtitle Seksi Keunggulan</Label>
                  <Input
                    value={home.why_subtitle ?? ""}
                    onChange={(e) => setHome({ ...home, why_subtitle: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {home.why_items?.map((item, idx) => (
                  <div key={idx} className="rounded-2xl border border-border/60 bg-muted/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary">Item Keunggulan #{idx + 1}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setHome({
                            ...home,
                            why_items: home.why_items.filter((_, i) => i !== idx),
                          })
                        }
                        className="h-7 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Hapus
                      </Button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <Label className="text-xs">Icon (Lucide Name)</Label>
                        <Input
                          list="popular-icon-list"
                          value={item.icon}
                          onChange={(e) => {
                            const next = [...(home.why_items ?? [])];
                            next[idx] = { ...next[idx], icon: e.target.value };
                            setHome({ ...home, why_items: next });
                          }}
                          className="mt-1 text-xs"
                          placeholder="e.g. BrainCircuit"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label className="text-xs">Judul Item</Label>
                        <Input
                          value={item.title}
                          onChange={(e) => {
                            const next = [...(home.why_items ?? [])];
                            next[idx] = { ...next[idx], title: e.target.value };
                            setHome({ ...home, why_items: next });
                          }}
                          className="mt-1 font-medium text-sm"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <Label className="text-xs">Deskripsi Item</Label>
                        <Textarea
                          value={item.desc}
                          onChange={(e) => {
                            const next = [...(home.why_items ?? [])];
                            next[idx] = { ...next[idx], desc: e.target.value };
                            setHome({ ...home, why_items: next });
                          }}
                          rows={2}
                          className="mt-1 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* BENEFITS SECTION */}
            <div className="border-t border-border/40 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <HeartHandshake className="h-4 w-4 text-primary" /> Seksi Manfaat ({home.benefits_items?.length ?? 0})
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() =>
                    setHome({
                      ...home,
                      benefits_items: [
                        ...(home.benefits_items ?? []),
                        { icon: "CheckCircle", title: "Manfaat Baru", desc: "Penjelasan detail manfaat." },
                      ],
                    })
                  }
                  className="rounded-full"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Tambah Item Manfaat
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="font-semibold">Judul Seksi Manfaat</Label>
                  <Input
                    value={home.benefits_title ?? ""}
                    onChange={(e) => setHome({ ...home, benefits_title: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="font-semibold">Subtitle Seksi Manfaat</Label>
                  <Input
                    value={home.benefits_subtitle ?? ""}
                    onChange={(e) => setHome({ ...home, benefits_subtitle: e.target.value })}
                    className="mt-1"
                    placeholder="Penjelasan singkat seksi manfaat"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {home.benefits_items?.map((item, idx) => (
                  <div key={idx} className="rounded-2xl border border-border/60 bg-muted/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary">Item Manfaat #{idx + 1}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setHome({
                            ...home,
                            benefits_items: home.benefits_items.filter((_, i) => i !== idx),
                          })
                        }
                        className="h-7 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Hapus
                      </Button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <Label className="text-xs">Icon (Lucide Name)</Label>
                        <Input
                          list="popular-icon-list"
                          value={item.icon}
                          onChange={(e) => {
                            const next = [...(home.benefits_items ?? [])];
                            next[idx] = { ...next[idx], icon: e.target.value };
                            setHome({ ...home, benefits_items: next });
                          }}
                          className="mt-1 text-xs"
                          placeholder="e.g. CheckCircle"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label className="text-xs">Judul Item</Label>
                        <Input
                          value={item.title}
                          onChange={(e) => {
                            const next = [...(home.benefits_items ?? [])];
                            next[idx] = { ...next[idx], title: e.target.value };
                            setHome({ ...home, benefits_items: next });
                          }}
                          className="mt-1 font-medium text-sm"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <Label className="text-xs">Deskripsi Item</Label>
                        <Textarea
                          value={item.desc}
                          onChange={(e) => {
                            const next = [...(home.benefits_items ?? [])];
                            next[idx] = { ...next[idx], desc: e.target.value };
                            setHome({ ...home, benefits_items: next });
                          }}
                          rows={2}
                          className="mt-1 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* HOW IT WORKS SECTION */}
            <div className="border-t border-border/40 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <ListOrdered className="h-4 w-4 text-primary" /> Seksi Cara Kerja ({home.how_items?.length ?? 0})
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => {
                    const nextStepNum = String((home.how_items?.length ?? 0) + 1);
                    setHome({
                      ...home,
                      how_items: [
                        ...(home.how_items ?? []),
                        { step: nextStepNum, title: "Langkah Baru", desc: "Penjelasan langkah." },
                      ],
                    });
                  }}
                  className="rounded-full"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Tambah Langkah
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="font-semibold">Judul Seksi Cara Kerja</Label>
                  <Input
                    value={home.how_title ?? ""}
                    onChange={(e) => setHome({ ...home, how_title: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="font-semibold">Subtitle Seksi Cara Kerja</Label>
                  <Input
                    value={home.how_subtitle ?? ""}
                    onChange={(e) => setHome({ ...home, how_subtitle: e.target.value })}
                    className="mt-1"
                    placeholder="Subtitle singkat seksi cara kerja"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {home.how_items?.map((item, idx) => (
                  <div key={idx} className="rounded-2xl border border-border/60 bg-muted/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary">Langkah #{idx + 1}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setHome({
                            ...home,
                            how_items: home.how_items.filter((_, i) => i !== idx),
                          })
                        }
                        className="h-7 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Hapus
                      </Button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <Label className="text-xs">Nomor / Label Step</Label>
                        <Input
                          value={item.step}
                          onChange={(e) => {
                            const next = [...(home.how_items ?? [])];
                            next[idx] = { ...next[idx], step: e.target.value };
                            setHome({ ...home, how_items: next });
                          }}
                          className="mt-1 text-xs"
                          placeholder="e.g. 1"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label className="text-xs">Judul Langkah</Label>
                        <Input
                          value={item.title}
                          onChange={(e) => {
                            const next = [...(home.how_items ?? [])];
                            next[idx] = { ...next[idx], title: e.target.value };
                            setHome({ ...home, how_items: next });
                          }}
                          className="mt-1 font-medium text-sm"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <Label className="text-xs">Deskripsi Langkah</Label>
                        <Textarea
                          value={item.desc}
                          onChange={(e) => {
                            const next = [...(home.how_items ?? [])];
                            next[idx] = { ...next[idx], desc: e.target.value };
                            setHome({ ...home, how_items: next });
                          }}
                          rows={2}
                          className="mt-1 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ ITEMS EDITOR */}
            <div className="border-t border-border/40 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-primary" /> Seksi FAQ ({home.faq_items?.length ?? 0})
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() =>
                    setHome({
                      ...home,
                      faq_items: [...(home.faq_items ?? []), { q: "Pertanyaan baru?", a: "Jawaban singkat di sini." }],
                    })
                  }
                  className="rounded-full"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Tambah FAQ
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="font-semibold">Judul Seksi FAQ</Label>
                  <Input
                    value={home.faq_title ?? ""}
                    onChange={(e) => setHome({ ...home, faq_title: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="font-semibold">Subtitle Seksi FAQ</Label>
                  <Input
                    value={home.faq_subtitle ?? ""}
                    onChange={(e) => setHome({ ...home, faq_subtitle: e.target.value })}
                    className="mt-1"
                    placeholder="Subtitle seksi FAQ"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {home.faq_items?.map((item, idx) => (
                  <div key={idx} className="rounded-2xl border border-border/60 bg-muted/20 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary">FAQ #{idx + 1}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setHome({
                            ...home,
                            faq_items: home.faq_items.filter((_, i) => i !== idx),
                          })
                        }
                        className="h-7 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Hapus
                      </Button>
                    </div>
                    <Input
                      placeholder="Pertanyaan"
                      value={item.q}
                      onChange={(e) => {
                        const next = [...(home.faq_items ?? [])];
                        next[idx] = { ...next[idx], q: e.target.value };
                        setHome({ ...home, faq_items: next });
                      }}
                      className="font-medium text-sm"
                    />
                    <Textarea
                      placeholder="Jawaban"
                      value={item.a}
                      onChange={(e) => {
                        const next = [...(home.faq_items ?? [])];
                        next[idx] = { ...next[idx], a: e.target.value };
                        setHome({ ...home, faq_items: next });
                      }}
                      rows={2}
                      className="text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* BOTTOM CTA BANNER */}
            <div className="border-t border-border/40 pt-6 space-y-4">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-primary" /> Seksi Banner CTA Bawah Homepage
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="font-semibold">Judul Banner CTA</Label>
                  <Input
                    placeholder="Contoh: Siap memahami perkembangan anak Anda?"
                    value={home.cta_title ?? ""}
                    onChange={(e) => setHome({ ...home, cta_title: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="font-semibold">Teks Tombol Banner CTA</Label>
                  <Input
                    placeholder="Contoh: Mulai Asesmen Sekarang"
                    value={home.cta_btn_text ?? ""}
                    onChange={(e) => setHome({ ...home, cta_btn_text: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="font-semibold">Deskripsi Banner CTA</Label>
                  <Textarea
                    placeholder="Contoh: Selesaikan asesmen dalam 5-10 menit dan dapatkan laporan personal."
                    value={home.cta_subtitle ?? ""}
                    onChange={(e) => setHome({ ...home, cta_subtitle: e.target.value })}
                    rows={2}
                    className="mt-1 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* FOOTER TAGLINE */}
            <div className="border-t border-border/40 pt-6 space-y-4">
              <Label className="font-semibold">Tagline Sub-Footer Homepage</Label>
              <Input
                value={home.footer_tagline ?? ""}
                onChange={(e) => setHome({ ...home, footer_tagline: e.target.value })}
                className="mt-1"
                placeholder="Mendampingi tumbuh kembang anak Indonesia..."
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-border/40">
              <Button onClick={saveHomepage} disabled={savingHome} className="rounded-full bg-gradient-hero shadow-soft">
                <Save className="mr-1.5 h-4 w-4" /> {savingHome ? "Menyimpan…" : "Simpan Seluruh Homepage"}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: WEBSITE GENERAL */}
        <TabsContent value="website" className="mt-6 space-y-6">
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft space-y-6">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" /> Identitas & Kontak Website
              </h2>
              <Button onClick={saveWebsite} disabled={savingWeb} className="rounded-full bg-gradient-hero shadow-soft">
                <Save className="mr-1.5 h-4 w-4" /> {savingWeb ? "Menyimpan…" : "Simpan Identitas"}
              </Button>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label className="font-semibold">Nama Website / Aplikasi</Label>
                <Input
                  value={web.site_name ?? ""}
                  onChange={(e) => setWeb({ ...web, site_name: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label className="font-semibold">Teks Logo Singkat</Label>
                <Input
                  value={web.logo_text ?? ""}
                  onChange={(e) => setWeb({ ...web, logo_text: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label className="font-semibold">Email Kontak</Label>
                <Input
                  value={web.contact_email ?? ""}
                  onChange={(e) => setWeb({ ...web, contact_email: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label className="font-semibold">WhatsApp Kontak Admin</Label>
                <Input
                  value={web.contact_whatsapp ?? ""}
                  onChange={(e) => setWeb({ ...web, contact_whatsapp: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              <div className="sm:col-span-2">
                <Label className="font-semibold">Teks Copyright Footer</Label>
                <Input
                  value={web.copyright ?? ""}
                  onChange={(e) => setWeb({ ...web, copyright: e.target.value })}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="border-t border-border/40 pt-6 space-y-5">
              <h3 className="text-md font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> Optimasi SEO & Analytics
              </h3>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label className="font-semibold">Meta Title Default</Label>
                  <Input
                    value={web.meta_title ?? ""}
                    onChange={(e) => setWeb({ ...web, meta_title: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label className="font-semibold">Google Analytics (GA ID)</Label>
                  <Input
                    placeholder="G-XXXXXXXXXX"
                    value={web.ga_id ?? ""}
                    onChange={(e) => setWeb({ ...web, ga_id: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="font-semibold">Meta Description Default</Label>
                  <Textarea
                    value={web.meta_description ?? ""}
                    onChange={(e) => setWeb({ ...web, meta_description: e.target.value })}
                    rows={3}
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border/40">
              <Button onClick={saveWebsite} disabled={savingWeb} className="rounded-full bg-gradient-hero shadow-soft">
                <Save className="mr-1.5 h-4 w-4" /> {savingWeb ? "Menyimpan…" : "Simpan Pengaturan Website"}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}