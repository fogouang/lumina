"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AnalyticsCharts() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      {/* Revenue Chart */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Revenus mensuels</CardTitle>
        </CardHeader>
        <CardContent className="h-75 flex items-center justify-center">
          <p className="text-muted-foreground">
            Graphique des revenus (à implémenter avec Recharts)
          </p>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Nouvelle inscription
                </p>
                <p className="text-sm text-muted-foreground">
                  Il y a 2 minutes
                </p>
              </div>
              <div className="ml-auto font-medium">+1 utilisateur</div>
            </div>
            <div className="flex items-center">
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Examen terminé
                </p>
                <p className="text-sm text-muted-foreground">
                  Il y a 5 minutes
                </p>
              </div>
              <div className="ml-auto font-medium">Série #149</div>
            </div>
            <div className="flex items-center">
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Paiement reçu
                </p>
                <p className="text-sm text-muted-foreground">
                  Il y a 10 minutes
                </p>
              </div>
              <div className="ml-auto font-medium">+5,000 FCFA</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Stats */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Statistiques utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="roles" className="space-y-4">
            <TabsList>
              <TabsTrigger value="roles">Par rôle</TabsTrigger>
              <TabsTrigger value="activity">Par activité</TabsTrigger>
            </TabsList>
            <TabsContent value="roles" className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Étudiants</span>
                  <span className="text-sm font-medium">85%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "85%" }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Enseignants</span>
                  <span className="text-sm font-medium">10%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "10%" }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Organisations</span>
                  <span className="text-sm font-medium">5%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "5%" }} />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="activity" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Graphique d'activité (à implémenter)
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Top Series */}
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Séries populaires</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Série #149</p>
                <p className="text-xs text-muted-foreground">1,234 tentatives</p>
              </div>
              <div className="text-sm font-medium">45%</div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Série #150</p>
                <p className="text-xs text-muted-foreground">987 tentatives</p>
              </div>
              <div className="text-sm font-medium">30%</div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Série #151</p>
                <p className="text-xs text-muted-foreground">543 tentatives</p>
              </div>
              <div className="text-sm font-medium">25%</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}