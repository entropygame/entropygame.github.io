import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { LogOut, Save, BarChart3, Target, Music, Share2, CheckCircle2 } from "lucide-react";

type TrackingRow = {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
};

const TRACKER_META: Record<string, { label: string; placeholder: string; icon: React.ReactNode; description: string }> = {
  google_analytics: {
    label: "Google Analytics",
    placeholder: "G-XXXXXXXXXX",
    icon: <BarChart3 className="h-5 w-5 text-primary" />,
    description: "Measurement ID Google Analytics 4",
  },
  meta_pixel: {
    label: "Meta Pixel (Facebook)",
    placeholder: "123456789012345",
    icon: <Target className="h-5 w-5 text-accent" />,
    description: "ID du pixel Meta / Facebook",
  },
  tiktok_pixel: {
    label: "TikTok Pixel",
    placeholder: "CXXXXXXXXXXXXXXXXX",
    icon: <Music className="h-5 w-5 text-accent" />,
    description: "ID du pixel TikTok",
  },
  meta_conversion_api: {
    label: "Meta Conversion API",
    placeholder: "Token d'accès",
    icon: <Share2 className="h-5 w-5 text-primary" />,
    description: "Token API de conversion Meta (server-side)",
  },
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<TrackingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [savedRows, setSavedRows] = useState<TrackingRow[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin/login");
        return;
      }
      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: session.user.id,
        _role: "admin",
      });
      if (!isAdmin) {
        toast({ title: "Accès refusé", description: "Vous n'avez pas le rôle admin.", variant: "destructive" });
        await supabase.auth.signOut();
        navigate("/admin/login");
        return;
      }
      fetchConfig();
    };
    checkAuth();
  }, [navigate]);

  const fetchConfig = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const { data, error } = await supabase.from("tracking_config").select("*");

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      const fetched = (data as TrackingRow[]) || [];
      setRows(fetched);
      setSavedRows(JSON.parse(JSON.stringify(fetched)));
      setHasChanges(false);
    }

    if (!silent) setLoading(false);
  }, []);

  const updateRow = (key: string, field: "value" | "enabled", val: string | boolean) => {
    setRows((prev) => {
      const updated = prev.map((r) => (r.key === key ? { ...r, [field]: val } : r));
      // Check if there are changes compared to saved state
      const changed = updated.some((r) => {
        const saved = savedRows.find((s) => s.key === r.key);
        return saved && (saved.value !== r.value || saved.enabled !== r.enabled);
      });
      setHasChanges(changed);
      return updated;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    let hasError = false;

    for (const row of rows) {
      const { error } = await supabase
        .from("tracking_config")
        .update({ value: row.value, enabled: row.enabled, updated_at: new Date().toISOString() })
        .eq("id", row.id);

      if (error) {
        toast({ title: "Erreur", description: `${row.key}: ${error.message}`, variant: "destructive" });
        hasError = true;
        break;
      }
    }

    if (!hasError) {
      // Re-fetch to confirm persistence
      const { data } = await supabase.from("tracking_config").select("*");
      if (data) {
        const fetched = data as TrackingRow[];
        setRows(fetched);
        setSavedRows(JSON.parse(JSON.stringify(fetched)));
        setHasChanges(false);
      }
      toast({
        title: "✅ Sauvegardé",
        description: "Configuration tracking mise à jour. Les changements sont actifs immédiatement.",
      });
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Chargement…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl md:text-3xl tracking-wide text-foreground">
            Admin — Tracking & Analytics
          </h1>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" /> Déconnexion
          </Button>
        </div>

        {rows.length === 0 && (
          <Card className="border-destructive/50">
            <CardContent className="pt-6">
              <p className="text-destructive">Aucune configuration tracking trouvée. Vérifiez la table tracking_config dans Supabase.</p>
            </CardContent>
          </Card>
        )}

        {/* Tracker cards */}
        {rows.map((row) => {
          const meta = TRACKER_META[row.key];
          if (!meta) return null;
          const savedRow = savedRows.find((s) => s.key === row.key);
          const isChanged = savedRow && (savedRow.value !== row.value || savedRow.enabled !== row.enabled);

          return (
            <Card key={row.key} className={`border-border/50 transition-colors ${isChanged ? 'ring-2 ring-primary/30' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {meta.icon}
                    <div>
                      <CardTitle className="text-lg font-display">{meta.label}</CardTitle>
                      <CardDescription className="text-xs">{meta.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {row.enabled && row.value && !isChanged && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                    <Switch
                      checked={row.enabled}
                      onCheckedChange={(v) => updateRow(row.key, "enabled", v)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor={row.key}>ID / Token</Label>
                  <Input
                    id={row.key}
                    placeholder={meta.placeholder}
                    value={row.value}
                    onChange={(e) => updateRow(row.key, "value", e.target.value)}
                  />
                  {row.enabled && !row.value && (
                    <p className="text-xs text-destructive">⚠️ Activé mais aucun ID renseigné — le script ne sera pas injecté.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Save button — always visible and prominent */}
        <Button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="w-full"
          size="lg"
          variant={hasChanges ? "default" : "secondary"}
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Sauvegarde en cours…" : hasChanges ? "💾 Sauvegarder les modifications" : "Aucune modification"}
        </Button>

        {hasChanges && (
          <p className="text-center text-xs text-muted-foreground">
            Vous avez des modifications non sauvegardées. Cliquez sur le bouton ci-dessus pour les enregistrer.
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
