import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";

interface ButtonClick {
  id: string;
  button_id: string;
  created_at: string;
  utm_source: string | null;
  session_id: string | null;
}
interface VisitSession {
  id: string;
  session_id: string;
  started_at: string;
  ended_at: string | null;
  duration_ms: number | null;
  utm_source: string | null;
  referrer: string | null;
}

const COLORS = [
  "oklch(0.72 0.2 245)",
  "oklch(0.75 0.18 145)",
  "oklch(0.72 0.18 30)",
  "oklch(0.65 0.22 320)",
  "oklch(0.75 0.16 80)",
  "oklch(0.6 0.2 200)",
];

async function fetchClicks(): Promise<ButtonClick[]> {
  const { data, error } = await supabase
    .from("button_clicks")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) throw error;
  return (data ?? []) as ButtonClick[];
}
async function fetchSessions(): Promise<VisitSession[]> {
  const { data, error } = await supabase
    .from("visit_sessions")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(1000);
  if (error) throw error;
  return (data ?? []) as VisitSession[];
}

function categorizeSource(s: VisitSession): string {
  if (s.utm_source) return s.utm_source;
  if (!s.referrer) return "Direct";
  try {
    const host = new URL(s.referrer).hostname.replace(/^www\./, "");
    if (host.includes("google")) return "Google";
    if (host.includes("facebook") || host.includes("fb.")) return "Facebook";
    if (host.includes("instagram")) return "Instagram";
    if (host.includes("twitter") || host.includes("x.com")) return "Twitter/X";
    if (host.includes("tiktok")) return "TikTok";
    if (host.includes("youtube")) return "YouTube";
    return host;
  } catch {
    return "Direct";
  }
}

function formatDuration(ms: number) {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}m ${r}s`;
}

export function AnalyticsTab() {
  const { data: clicks = [], isLoading: clicksLoading } = useQuery({
    queryKey: ["admin_clicks"],
    queryFn: fetchClicks,
    refetchInterval: 30_000,
  });
  const { data: sessions = [], isLoading: sessLoading } = useQuery({
    queryKey: ["admin_sessions"],
    queryFn: fetchSessions,
    refetchInterval: 30_000,
  });

  if (clicksLoading || sessLoading) {
    return <p className="text-muted-foreground">Chargement des analytics…</p>;
  }

  // ---- Clicks per button ----
  const clicksByButton = Object.entries(
    clicks.reduce<Record<string, number>>((acc, c) => {
      acc[c.button_id] = (acc[c.button_id] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([button, count]) => ({ button, count }));

  // ---- Avg / total visit duration ----
  const finished = sessions.filter((s) => s.duration_ms != null);
  const avgDuration =
    finished.length > 0
      ? finished.reduce((sum, s) => sum + (s.duration_ms ?? 0), 0) / finished.length
      : 0;
  const totalVisits = sessions.length;
  const totalClicks = clicks.length;
  const conversionRate =
    totalVisits > 0 ? ((totalClicks / totalVisits) * 100).toFixed(1) : "0";

  // ---- Traffic sources ----
  const sourceCounts = sessions.reduce<Record<string, number>>((acc, s) => {
    const src = categorizeSource(s);
    acc[src] = (acc[src] ?? 0) + 1;
    return acc;
  }, {});
  const sourceData = Object.entries(sourceCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // ---- Daily timeline (last 14 days) ----
  const days = 14;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const timeline: { date: string; visits: number; clicks: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const label = `${d.getDate()}/${d.getMonth() + 1}`;
    const visits = sessions.filter((s) => {
      const t = new Date(s.started_at);
      return t >= d && t < next;
    }).length;
    const clk = clicks.filter((c) => {
      const t = new Date(c.created_at);
      return t >= d && t < next;
    }).length;
    timeline.push({ date: label, visits, clicks: clk });
  }

  // ---- Avg duration by source ----
  const durBySource: Record<string, { sum: number; count: number }> = {};
  for (const s of finished) {
    const src = categorizeSource(s);
    if (!durBySource[src]) durBySource[src] = { sum: 0, count: 0 };
    durBySource[src].sum += s.duration_ms ?? 0;
    durBySource[src].count += 1;
  }
  const durBySourceData = Object.entries(durBySource)
    .map(([name, v]) => ({
      name,
      avgSec: Math.round(v.sum / v.count / 1000),
    }))
    .sort((a, b) => b.avgSec - a.avgSec)
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Visites totales" value={totalVisits.toString()} />
        <KpiCard label="Clics CTA totaux" value={totalClicks.toString()} />
        <KpiCard
          label="Taux de clic"
          value={`${conversionRate}%`}
          hint="clics / visites"
        />
        <KpiCard label="Durée moyenne" value={formatDuration(avgDuration)} />
      </div>

      {/* Global timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Vue globale — 14 derniers jours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 265)" />
                <XAxis dataKey="date" stroke="oklch(0.7 0.02 265)" fontSize={12} />
                <YAxis stroke="oklch(0.7 0.02 265)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.15 0.03 265)",
                    border: "1px solid oklch(0.3 0.05 265)",
                    borderRadius: 8,
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="visits"
                  stroke="oklch(0.72 0.2 245)"
                  strokeWidth={2}
                  name="Visites"
                />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  stroke="oklch(0.75 0.18 145)"
                  strokeWidth={2}
                  name="Clics CTA"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clicks per button */}
        <Card>
          <CardHeader>
            <CardTitle>Clics par bouton</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {clicksByButton.length === 0 ? (
                <EmptyState text="Aucun clic enregistré pour le moment." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={clicksByButton}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 265)" />
                    <XAxis dataKey="button" stroke="oklch(0.7 0.02 265)" fontSize={12} />
                    <YAxis stroke="oklch(0.7 0.02 265)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: "oklch(0.15 0.03 265)",
                        border: "1px solid oklch(0.3 0.05 265)",
                        borderRadius: 8,
                      }}
                    />
                    <Bar dataKey="count" fill="oklch(0.72 0.2 245)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Traffic sources */}
        <Card>
          <CardHeader>
            <CardTitle>Sources de trafic</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {sourceData.length === 0 ? (
                <EmptyState text="Aucune visite enregistrée." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sourceData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={80}
                      label
                    >
                      {sourceData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "oklch(0.15 0.03 265)",
                        border: "1px solid oklch(0.3 0.05 265)",
                        borderRadius: 8,
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Avg duration by source */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Durée moyenne de visite par source (secondes)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {durBySourceData.length === 0 ? (
                <EmptyState text="Pas encore de visites terminées." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={durBySourceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 265)" />
                    <XAxis dataKey="name" stroke="oklch(0.7 0.02 265)" fontSize={12} />
                    <YAxis stroke="oklch(0.7 0.02 265)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: "oklch(0.15 0.03 265)",
                        border: "1px solid oklch(0.3 0.05 265)",
                        borderRadius: 8,
                      }}
                    />
                    <Bar dataKey="avgSec" fill="oklch(0.75 0.18 145)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
        {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
