import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAssessmentCardSettings, DEFAULT_CARD_SETTINGS_DATA, AssessmentCardSettingsData, LevelCardSetting } from "@/lib/settings";
import { fetchAssessmentLocks } from "@/lib/locks";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Save, Layers, Plus, Trash2, CheckCircle2, Lock, Sparkles,
  Baby, BookOpen, GraduationCap, School, Brain, User, Star, ClipboardList, ShieldCheck, Award, Smile, Zap, Target, Lightbulb
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { saveCardSettingsFn } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/cards")({
  component: AssessmentCardsAdmin,
});

const ICON_OPTIONS = [
  { name: "Baby", icon: Baby, label: "Baby (TK)" },
  { name: "BookOpen", icon: BookOpen, label: "Book (SD)" },
  { name: "School", icon: School, label: "School (SMP)" },
  { name: "GraduationCap", icon: GraduationCap, label: "Graduation (SMA)" },
  { name: "Brain", icon: Brain, label: "Brain" },
  { name: "User", icon: User, label: "User" },
  { name: "Star", icon: Star, label: "Star" },
  { name: "ClipboardList", icon: ClipboardList, label: "Clipboard" },
  { name: "Sparkles", icon: Sparkles, label: "Sparkles" },
  { name: "ShieldCheck", icon: ShieldCheck, label: "Shield" },
  { name: "Award", icon: Award, label: "Award" },
  { name: "Smile", icon: Smile, label: "Smile" },
  { name: "Zap", icon: Zap, label: "Zap" },
  { name: "Target", icon: Target, label: "Target" },
  { name: "Lightbulb", icon: Lightbulb, label: "Lightbulb" },
];

const COLOR_OPTIONS = [
  { value: "cyan", label: "Cyan (TK)" },
  { value: "blue", label: "Blue (SD)" },
  { value: "indigo", label: "Indigo (SMP)" },
  { value: "sky", label: "Sky (SMA)" },
  { value: "emerald", label: "Emerald (Hijau)" },
  { value: "amber", label: "Amber (Oranye)" },
  { value: "purple", label: "Purple (Ungu)" },
];

const LEVELS = ["TK", "SD", "SMP", "SMA"] as const;

function AssessmentCardsAdmin() {
  const qc = useQueryClient();
  const saveCardFn = useServerFn(saveCardSettingsFn);

  const [saving, setSaving] = useState(false);
  const cardQuery = useQuery({ queryKey: ["admin-cards-edit"], queryFn: fetchAssessmentCardSettings });
  const locksQuery = useQuery({ queryKey: ["admin-locks-edit"], queryFn: fetchAssessmentLocks });

  const [cards, setCards] = useState<AssessmentCardSettingsData>(DEFAULT_CARD_SETTINGS_DATA);

  useEffect(() => {
    if (cardQuery.data) {
      const merged: AssessmentCardSettingsData = { ...DEFAULT_CARD_SETTINGS_DATA };
      for (const lvl of LEVELS) {
        merged[lvl] = {
          ...DEFAULT_CARD_SETTINGS_DATA[lvl],
          ...(cardQuery.data[lvl] || {}),
          is_locked: locksQuery.data?.[lvl] ?? cardQuery.data[lvl]?.is_locked ?? false,
        };
      }
      setCards(merged);
    }
  }, [cardQuery.data, locksQuery.data]);

  const handleUpdateLevel = (lvl: string, field: keyof LevelCardSetting, value: any) => {
    setCards((prev) => ({
      ...prev,
      [lvl]: {
        ...prev[lvl],
        [field]: value,
      },
    }));
  };

  const handleFeatureChange = (lvl: string, index: number, value: string) => {
    const currentFeatures = [...(cards[lvl]?.features || [])];
    currentFeatures[index] = value;
    handleUpdateLevel(lvl, "features", currentFeatures);
  };

  const handleAddFeature = (lvl: string) => {
    const currentFeatures = [...(cards[lvl]?.features || [])];
    if (currentFeatures.length >= 6) {
      toast.error("Maksimal 6 poin fokus asesmen.");
      return;
    }
    currentFeatures.push("Fokus Asesmen Baru");
    handleUpdateLevel(lvl, "features", currentFeatures);
  };

  const handleRemoveFeature = (lvl: string, index: number) => {
    const currentFeatures = [...(cards[lvl]?.features || [])];
    if (currentFeatures.length <= 3) {
      toast.error("Minimal 3 poin fokus asesmen.");
      return;
    }
    currentFeatures.splice(index, 1);
    handleUpdateLevel(lvl, "features", currentFeatures);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      console.info("[AdminCards] Submitting card settings to database...", cards);
      const res = await saveCardFn({ data: cards });
      if (!res || (res as any).ok !== true) {
        throw new Error((res as any)?.error || "Gagal menyimpan pengaturan card assessment ke database");
      }

      toast.success("✅ Pengaturan Card Assessment berhasil disimpan ke database!");
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["assessment-card-settings"] }),
        qc.invalidateQueries({ queryKey: ["admin-cards-edit"] }),
        qc.invalidateQueries({ queryKey: ["assessment-locks"] }),
        qc.invalidateQueries({ queryKey: ["admin-locks-edit"] }),
        qc.invalidateQueries({ queryKey: ["website"] }),
        cardQuery.refetch(),
        locksQuery.refetch(),
      ]);
    } catch (e: any) {
      console.error("[AdminCards] Error saving card settings:", e);
      toast.error("Gagal menyimpan: " + (e?.message ?? "Error tidak diketahui"));
    } finally {
      setSaving(false);
    }
  };

  if (cardQuery.isLoading) {
    return <div className="py-12 text-center text-muted-foreground font-medium">Memuat pengaturan Card Assessment…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-2">
            <Layers className="h-3.5 w-3.5" /> Modul Kelola Tampilan Card
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Pengaturan Card Assessment
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola judul, deskripsi, ikon, badge, daftar fokus, dan status terkunci setiap jenjang secara mandiri.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleSaveAll}
          disabled={saving}
          className="rounded-full bg-gradient-hero text-primary-foreground gap-2 px-6 shadow-soft"
        >
          <Save className="h-4 w-4" />
          {saving ? "Menyimpan…" : "Simpan Seluruh Pengaturan"}
        </Button>
      </div>

      <Tabs defaultValue="SMA" className="w-full">
        <TabsList className="grid w-full grid-cols-4 rounded-2xl bg-muted/60 p-1">
          {LEVELS.map((lvl) => (
            <TabsTrigger key={lvl} value={lvl} className="rounded-xl font-bold text-xs sm:text-sm">
              Jenjang {lvl}
            </TabsTrigger>
          ))}
        </TabsList>

        {LEVELS.map((lvl) => {
          const item = cards[lvl] || DEFAULT_CARD_SETTINGS_DATA[lvl];

          return (
            <TabsContent key={lvl} value={lvl} className="mt-6 space-y-6">
              <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft space-y-6">
                <div className="flex items-center justify-between border-b border-border/40 pb-4">
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    🎓 Pengaturan Card Jenjang {lvl}
                  </h2>
                  <div className="flex items-center gap-3">
                    <Label htmlFor={`lock-${lvl}`} className="text-xs font-semibold cursor-pointer">
                      {item.is_locked ? "🔒 Terkunci (Pengembangan)" : "🔓 Aktif"}
                    </Label>
                    <Switch
                      id={`lock-${lvl}`}
                      checked={!!item.is_locked}
                      onCheckedChange={(val) => handleUpdateLevel(lvl, "is_locked", val)}
                    />
                  </div>
                </div>

                {/* 1. Nama Jenjang */}
                <div className="space-y-2">
                  <Label className="font-semibold text-sm">1. Nama Jenjang (Judul Utama Card)</Label>
                  <Input
                    value={item.title}
                    onChange={(e) => handleUpdateLevel(lvl, "title", e.target.value)}
                    placeholder="e.g. Sekolah Menengah Atas (SMA)"
                    className="rounded-xl"
                  />
                </div>

                {/* 2. Deskripsi Singkat */}
                <div className="space-y-2">
                  <Label className="font-semibold text-sm">2. Deskripsi Singkat</Label>
                  <Textarea
                    value={item.desc}
                    onChange={(e) => handleUpdateLevel(lvl, "desc", e.target.value)}
                    rows={2}
                    placeholder="Deskripsi singkat mengenai asesmen jenjang ini..."
                    className="rounded-xl"
                  />
                </div>

                {/* 3. Badge Kanan Atas */}
                <div className="grid gap-4 sm:grid-cols-3 rounded-2xl border border-border/40 bg-muted/20 p-4">
                  <div className="space-y-2">
                    <Label className="font-semibold text-xs">Teks Badge Kanan Atas</Label>
                    <Input
                      value={item.badge_text}
                      onChange={(e) => handleUpdateLevel(lvl, "badge_text", e.target.value)}
                      placeholder="e.g. Usia 16–18 Tahun / Rekomendasi"
                      className="rounded-xl bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold text-xs">Warna Badge / Aksen</Label>
                    <select
                      value={item.badge_color || "blue"}
                      onChange={(e) => handleUpdateLevel(lvl, "badge_color", e.target.value)}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-medium"
                    >
                      {COLOR_OPTIONS.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col justify-end space-y-2">
                    <div className="flex items-center gap-2 pt-2">
                      <Switch
                        id={`badge-show-${lvl}`}
                        checked={item.badge_show !== false}
                        onCheckedChange={(val) => handleUpdateLevel(lvl, "badge_show", val)}
                      />
                      <Label htmlFor={`badge-show-${lvl}`} className="text-xs font-semibold cursor-pointer">
                        {item.badge_show !== false ? "Badge Tampil" : "Badge Sembunyi"}
                      </Label>
                    </div>
                  </div>
                </div>

                {/* 4. Ikon Card Selector */}
                <div className="space-y-2">
                  <Label className="font-semibold text-sm">4. Pilih Ikon Card</Label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {ICON_OPTIONS.map((ico) => {
                      const IconComp = ico.icon;
                      const selected = item.icon === ico.name;

                      return (
                        <button
                          key={ico.name}
                          type="button"
                          onClick={() => handleUpdateLevel(lvl, "icon", ico.name)}
                          className={
                            "flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition " +
                            (selected
                              ? "border-primary bg-primary/10 text-primary shadow-xs"
                              : "border-border/60 bg-background text-muted-foreground hover:border-primary/40")
                          }
                        >
                          <IconComp className="h-4 w-4" />
                          <span>{ico.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Daftar Fokus Assessment */}
                <div className="space-y-3 rounded-2xl border border-border/40 bg-muted/20 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-semibold text-sm">5. Daftar Fokus Assessment (Bullet Points)</Label>
                      <p className="text-xs text-muted-foreground">Minimal 3 poin, maksimal 6 poin.</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddFeature(lvl)}
                      className="rounded-full gap-1 text-xs"
                    >
                      <Plus className="h-3.5 w-3.5" /> Tambah Poin
                    </Button>
                  </div>

                  <div className="space-y-2.5">
                    {(item.features || []).map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        <Input
                          value={feat}
                          onChange={(e) => handleFeatureChange(lvl, fIdx, e.target.value)}
                          placeholder={`Poin fokus ${fIdx + 1}`}
                          className="rounded-xl bg-background text-xs sm:text-sm"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveFeature(lvl, fIdx)}
                          className="text-muted-foreground hover:text-destructive shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 6. Pesan Informasi */}
                <div className="space-y-2">
                  <Label className="font-semibold text-sm">6. Pesan Informasi (Banner Catatan Card)</Label>
                  <Input
                    value={item.info_message || ""}
                    onChange={(e) => handleUpdateLevel(lvl, "info_message", e.target.value)}
                    placeholder="e.g. Asesmen ini dirancang untuk membantu orang tua memahami..."
                    className="rounded-xl"
                  />
                </div>

                {/* 7. Tombol Teks */}
                <div className="space-y-2">
                  <Label className="font-semibold text-sm">7. Teks Tombol Aksi</Label>
                  <Input
                    value={item.button_text}
                    onChange={(e) => handleUpdateLevel(lvl, "button_text", e.target.value)}
                    placeholder="e.g. Pilih Jenjang SMA / Mulai Assessment"
                    className="rounded-xl"
                  />
                </div>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
