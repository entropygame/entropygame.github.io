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
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setGa(settings.ga_measurement_id ?? "");
      setPixel(settings.meta_pixel_id ?? "");
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
        <div className="rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground space-y-2">
          <p>
            🔒 <strong>Token API Meta Conversions</strong> : stocké de façon sécurisée comme secret serveur
            (<code>META_CONVERSIONS_TOKEN</code>) et utilisé uniquement par l'Edge Function
            <code> meta-conversion</code>. Il n'est jamais exposé au navigateur.
          </p>
          <p>
            Le <strong>Pixel ID</strong> côté serveur est aussi stocké comme secret (<code>META_PIXEL_ID</code>)
            pour l'API Conversions. Le champ ci-dessus reste utilisé pour le pixel côté navigateur.
          </p>
          <p>
            Pour mettre à jour ces valeurs, utilisez la gestion des secrets de Lovable Cloud.
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
