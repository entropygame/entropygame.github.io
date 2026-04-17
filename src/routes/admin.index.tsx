import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LinksTab } from "@/components/admin/LinksTab";
import { TrackingTab } from "@/components/admin/TrackingTab";
import { AnalyticsTab } from "@/components/admin/AnalyticsTab";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <Tabs defaultValue="texts" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="texts">1 · Textes</TabsTrigger>
        <TabsTrigger value="links">2 · Liens CTA</TabsTrigger>
        <TabsTrigger value="tracking">3 · Tracking</TabsTrigger>
        <TabsTrigger value="analytics">4 · Analytics</TabsTrigger>
      </TabsList>

      <TabsContent value="texts" className="mt-6">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-2">Modifier les textes</h2>
            <p className="text-sm text-muted-foreground">
              Cet onglet est réservé pour l'édition future des textes du site. Pour l'instant,
              seuls les liens des boutons CTA sont modifiables (onglet 2). Si vous voulez activer
              l'édition des textes, demandez-le.
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="links" className="mt-6">
        <LinksTab />
      </TabsContent>

      <TabsContent value="tracking" className="mt-6">
        <TrackingTab />
      </TabsContent>

      <TabsContent value="analytics" className="mt-6">
        <AnalyticsTab />
      </TabsContent>
    </Tabs>
  );
}
