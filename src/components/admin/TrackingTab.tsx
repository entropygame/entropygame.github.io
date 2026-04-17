import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TrackingTab() {
  const { data: settings, isLoading } = useSiteSettings();
  const qc = useQueryClient();
  const [ga, setGa] = useState("");
  const [pixel, setPixel] = useState("");
  const [token, setToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setGa(settings.ga_measurement_id ?? "");
      setPixel(settings.meta_pixel_id ?? "");
      setToken(settings.meta_conversions_token ?? "");
    }
  }, [settings]);

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    setMsg(null);
    const { error } = await supabase
      .from("site_settings")
      .update({
        ga_measurement_id: ga.trim() || null,
        meta_pixel_id: pixel.trim() || null,
        meta_conversions_token: token.trim() || null,
      })
      .eq("id", settings.id);
    setSaving(false);
    if (error) setMsg("Erreur : " + error.message);
    else {
      setMsg("✓ Identifiants enregistrés (rechargez le site public pour activer)");
      qc.invalidateQueries({ queryKey: ["site_settings"] });
    }
  };

  if (isLoading) return <p className="text-muted-foreground">Chargement…</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tracking & Pixels</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="ga">ID de mesure Google Analytics 4</Label>
          <Input
            id="ga"
            value={ga}
            onChange={(e) => setGa(e.target.value)}
            placeholder="G-XXXXXXXXXX"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Récupérez-le dans Google Analytics → Admin → Flux de données.
          </p>
        </div>
        <div>
          <Label htmlFor="pixel">Meta Pixel ID</Label>
          <Input
            id="pixel"
            value={pixel}
            onChange={(e) => setPixel(e.target.value)}
            placeholder="1234567890123456"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Disponible dans Meta Events Manager.
          </p>
        </div>
        <div>
          <Label htmlFor="token">Token API de conversion Meta</Label>
          <Input
            id="token"
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="EAAxxxx…"
          />
          <p className="text-xs text-muted-foreground mt-1">
            ⚠ Stocké uniquement pour usage côté serveur (n'est pas exposé dans les scripts du
            site). À utiliser via une fonction serveur dédiée pour envoyer les événements à
            l'API de conversion Meta.
          </p>
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
