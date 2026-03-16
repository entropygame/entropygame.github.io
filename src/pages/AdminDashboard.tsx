import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { LogOut, Save, BarChart3, Target, Music, Share2 } from "lucide-react";

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

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin/login");
        return;
      }
      // Check admin role via has_role RPC
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

  const fetchConfig = async () => {
    const { data, error } = await supabase.from("tracking_config").select("*");
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      setRows((data as TrackingRow[]) || []);
    }
    setLoading(false);
  };

  const updateRow = (key: string, field: "value" | "enabled", val: string | boolean) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, [field]: val } : r)));
  };

  const handleSave = async () => {
    setSaving(true);
    for (const row of rows) {
      const { error } = await supabase
        .from("tracking_config")
        .update({ value: row.value, enabled: row.enabled, updated_at: new Date().toISOString() })
        .eq("key", row.key);
      if (error) {
        toast({ title: "Erreur", description: `${row.key}: ${error.message}`, variant: "destructive" });
        setSaving(false);
        return;
      }
    }
    toast({ title: "Sauvegardé", description: "Configuration mise à jour avec succès." });
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

        {/* Tracker cards */}
        {rows.map((row) => {
          const meta = TRACKER_META[row.key];
          if (!meta) return null;
          return (
            <Card key={row.key} className="border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {meta.icon}
                    <div>
                      <CardTitle className="text-lg font-display">{meta.label}</CardTitle>
                      <CardDescription className="text-xs">{meta.description}</CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={row.enabled}
                    onCheckedChange={(v) => updateRow(row.key, "enabled", v)}
                  />
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
                </div>
              </CardContent>
            </Card>
          );
        })}

        <Button onClick={handleSave} disabled={saving} className="w-full" size="lg">
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Sauvegarde…" : "Sauvegarder la configuration"}
        </Button>
      </div>
    </div>
  );
};

export default AdminDashboard;
