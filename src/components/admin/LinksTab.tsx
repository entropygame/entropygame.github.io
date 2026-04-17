import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LinksTab() {
  const { data: settings, isLoading } = useSiteSettings();
  const qc = useQueryClient();
  const [hero, setHero] = useState("");
  const [floating, setFloating] = useState("");
  const [go, setGo] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setHero(settings.hero_cta_url);
      setFloating(settings.floating_cta_url);
      setGo(settings.go_cta_url);
    }
  }, [settings]);

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    setMsg(null);
    const { error } = await supabase
      .from("site_settings")
      .update({
        hero_cta_url: hero,
        floating_cta_url: floating,
        go_cta_url: go,
      })
      .eq("id", settings.id);
    setSaving(false);
    if (error) {
      setMsg("Erreur : " + error.message);
    } else {
      setMsg("✓ Liens enregistrés");
      qc.invalidateQueries({ queryKey: ["site_settings"] });
    }
  };

  if (isLoading) return <p className="text-muted-foreground">Chargement…</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Liens des boutons CTA</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="hero-url">Bouton CTA — Section Hero</Label>
          <Input
            id="hero-url"
            type="url"
            value={hero}
            onChange={(e) => setHero(e.target.value)}
            placeholder="https://…"
          />
        </div>
        <div>
          <Label htmlFor="floating-url">Bouton CTA — Flottant (bas droite)</Label>
          <Input
            id="floating-url"
            type="url"
            value={floating}
            onChange={(e) => setFloating(e.target.value)}
            placeholder="https://…"
          />
        </div>
        <div>
          <Label htmlFor="go-url">Bouton GO — Dernière section</Label>
          <Input
            id="go-url"
            type="url"
            value={go}
            onChange={(e) => setGo(e.target.value)}
            placeholder="https://…"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={save} disabled={saving}>
            {saving ? "Enregistrement…" : "Enregistrer"}
          </Button>
          {msg && <span className="text-sm text-muted-foreground">{msg}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
