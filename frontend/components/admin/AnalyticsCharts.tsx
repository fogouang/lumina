"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAnalyticsData } from "@/hooks/queries/useStatsQueries";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function AnalyticsCharts() {
  const { data: analytics, isLoading } = useAnalyticsData();

  if (isLoading || !analytics) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardContent className="h-75 flex items-center justify-center">
            <LoadingSpinner text="Chargement des graphiques..." />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardContent className="h-75 flex items-center justify-center">
            <LoadingSpinner />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      {/* Revenue Chart */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Revenus mensuels</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.monthly_revenue.length === 0 ? (
            <div className="h-75 flex items-center justify-center text-muted-foreground">
              Aucune donnée de revenus disponible
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.monthly_revenue}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                  formatter={(value: number) => [
                    `${value.toLocaleString()} F`,
                    "Revenus",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8b5cf6"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Users & Subscriptions Tabs */}
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Croissance</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="users">Utilisateurs</TabsTrigger>
              <TabsTrigger value="subscriptions">Abonnements</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="mt-4">
              {analytics.monthly_users.length === 0 ? (
                <div className="h-62.5 flex items-center justify-center text-muted-foreground">
                  Aucune donnée utilisateurs disponible
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={analytics.monthly_users}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="month"
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="nouveaux"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Nouveaux"
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Total"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </TabsContent>

            <TabsContent value="subscriptions" className="mt-4">
              {analytics.monthly_subscriptions.length === 0 ? (
                <div className="h-62.5 flex items-center justify-center text-muted-foreground">
                  Aucune donnée abonnements disponible
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics.monthly_subscriptions}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="month"
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="actifs" fill="#8b5cf6" name="Actifs" />
                    <Bar dataKey="nouveaux" fill="#10b981" name="Nouveaux" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}