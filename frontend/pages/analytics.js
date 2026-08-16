import React, { useState, useEffect } from "react";
import { TrendingUp, ShoppingBag, MapPin, Star, Loader2 } from "lucide-react";
import { ResponsiveBar } from "@nivo/bar";

const StatCard = ({ icon: Icon, label, value, loading }) => (
  <div className="rounded-lg border border-border bg-card px-4 py-4">
    <div className="flex items-center justify-between mb-2">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
    </div>
    {loading ? (
      <div className="h-8 w-16 rounded bg-muted animate-pulse" />
    ) : (
      <p className="text-3xl font-bold tracking-tight">{value ?? "—"}</p>
    )}
  </div>
);

const ChartWrapper = ({ title, subtitle, children }) => (
  <div className="rounded-lg border border-border bg-card">
    <div className="px-4 py-3 border-b border-border">
      <p className="font-semibold">{title}</p>
      {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const nivoTheme = {
  axis: { ticks: { text: { fill: "hsl(0,0%,55%)", fontSize: 12 } }, legend: { text: { fill: "hsl(0,0%,55%)", fontSize: 12 } } },
  grid: { line: { stroke: "hsl(0,0%,14%)" } },
  tooltip: { container: { background: "hsl(0,0%,7%)", border: "1px solid hsl(0,0%,14%)", color: "hsl(0,0%,95%)", fontSize: 13 } },
};

export default function Analytics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/dashboard/metrics")
      .then((r) => r.json())
      .then(setMetrics)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  const salesByProduct = metrics?.sales_by_product
    ? Object.entries(metrics.sales_by_product).map(([product, count]) => ({ product, Sales: count }))
    : [];

  const satisfactionByRegion = metrics?.satisfaction_by_region
    ? Object.entries(metrics.satisfaction_by_region).map(([region, score]) => ({ region, Score: Number(score).toFixed(2) }))
    : [];

  const salesByRegion = metrics?.sales_by_region
    ? Object.entries(metrics.sales_by_region).map(([region, count]) => ({ region, Sales: count }))
    : [];

  const salesByGender = metrics?.sales_by_gender
    ? Object.entries(metrics.sales_by_gender).map(([gender, count]) => ({ gender, Sales: count }))
    : [];

  const salesTrend = metrics?.sales_trend
    ? [
        {
          id: "Sales",
          data: Object.entries(metrics.sales_trend)
            .sort(([a], [b]) => new Date(a) - new Date(b))
            .map(([date, count]) => ({ x: date, y: count })),
        },
      ]
    : [];

  const ageDistribution = metrics?.age_distribution
    ? Object.entries(metrics.age_distribution)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([age, count]) => ({ age, Count: count }))
    : [];

  return (
    <div className="flex flex-col gap-4 p-5 w-full">
      {/* Header */}
      <div className="mb-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Dashboard</p>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
      </div>

      {(error || metrics?.error) && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {metrics?.error || "Failed to load metrics. Check that the backend is running."}
        </div>
      )}

      {!loading && !metrics?.error && (
        <div className={`inline-flex items-center gap-1.5 self-start rounded-full border px-2.5 py-0.5 text-xs font-medium ${
          metrics?.data_source === "upload"
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
            : "border-border text-muted-foreground"
        }`}>
          <span className={`h-1.5 w-1.5 rounded-full ${metrics?.data_source === "upload" ? "bg-emerald-400" : "bg-muted-foreground"}`} />
          {metrics?.data_source === "upload" ? "Your uploaded data" : "Sample data — upload a CSV in Chat to use your own"}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard icon={TrendingUp}  label="Total Sales"      value={metrics?.total_sales}     loading={loading} />
        <StatCard icon={ShoppingBag} label="Products"         value={metrics?.total_products}  loading={loading} />
        <StatCard icon={Star}        label="Avg Satisfaction" value={metrics?.avg_satisfaction} loading={loading} />
        <StatCard icon={MapPin}      label="Regions"          value={metrics?.regions}          loading={loading} />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartWrapper title="Sales by Product" subtitle="Total units sold per product">
          {loading ? (
            <div className="h-[240px] flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : salesByProduct.length > 0 ? (
            <div className="h-[320px]">
              <ResponsiveBar
                data={salesByProduct}
                keys={["Sales"]}
                indexBy="product"
                margin={{ top: 10, right: 10, bottom: 50, left: 50 }}
                padding={0.35}
                colors={["hsl(0,0%,60%)"]}
                theme={nivoTheme}
                axisBottom={{ tickRotation: -30 }}
                axisLeft={{ tickSize: 0, tickPadding: 8 }}
                enableLabel={false}
                enableGridY
                borderRadius={2}
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">No data available</p>
          )}
        </ChartWrapper>

        <ChartWrapper title="Satisfaction by Region" subtitle="Average customer satisfaction score">
          {loading ? (
            <div className="h-[240px] flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : satisfactionByRegion.length > 0 ? (
            <div className="h-[320px]">
              <ResponsiveBar
                data={satisfactionByRegion}
                keys={["Score"]}
                indexBy="region"
                margin={{ top: 10, right: 10, bottom: 50, left: 50 }}
                padding={0.35}
                colors={["hsl(0,0%,75%)"]}
                theme={nivoTheme}
                axisBottom={{ tickRotation: -30 }}
                axisLeft={{ tickSize: 0, tickPadding: 8 }}
                enableLabel={false}
                enableGridY
                borderRadius={2}
                minValue={0}
                maxValue={5}
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">No data available</p>
          )}
        </ChartWrapper>
      </div>

      {/* Sales by Region + Sales by Gender */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartWrapper title="Sales by Region" subtitle="Total transactions per region">
          {loading ? (
            <div className="h-[240px] flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : salesByRegion.length > 0 ? (
            <div className="h-[280px]">
              <ResponsiveBar
                data={salesByRegion}
                keys={["Sales"]}
                indexBy="region"
                margin={{ top: 10, right: 10, bottom: 50, left: 50 }}
                padding={0.35}
                colors={["hsl(220,70%,60%)"]}
                theme={nivoTheme}
                axisBottom={{ tickRotation: -20 }}
                axisLeft={{ tickSize: 0, tickPadding: 8 }}
                enableLabel={false}
                enableGridY
                borderRadius={2}
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">No data available</p>
          )}
        </ChartWrapper>

        <ChartWrapper title="Sales by Gender" subtitle="Transaction count by customer gender">
          {loading ? (
            <div className="h-[240px] flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : salesByGender.length > 0 ? (
            <div className="h-[280px]">
              <ResponsiveBar
                data={salesByGender}
                keys={["Sales"]}
                indexBy="gender"
                margin={{ top: 10, right: 10, bottom: 50, left: 50 }}
                padding={0.45}
                colors={["hsl(280,60%,60%)"]}
                theme={nivoTheme}
                axisBottom={{ tickRotation: 0 }}
                axisLeft={{ tickSize: 0, tickPadding: 8 }}
                enableLabel={false}
                enableGridY
                borderRadius={2}
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">No data available</p>
          )}
        </ChartWrapper>
      </div>

      {/* Sales Trend Over Time + Age Distribution */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartWrapper title="Sales Trend Over Time" subtitle="Daily transaction volume">
          {loading ? (
            <div className="h-[240px] flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : salesTrend.length > 0 && salesTrend[0].data.length > 0 ? (
            <div className="h-[280px]">
              <ResponsiveBar
                data={salesTrend[0].data.map(d => ({ date: d.x, Sales: d.y }))}
                keys={["Sales"]}
                indexBy="date"
                margin={{ top: 10, right: 10, bottom: 60, left: 50 }}
                padding={0.2}
                colors={["hsl(160,60%,50%)"]}
                theme={nivoTheme}
                axisBottom={{
                  tickRotation: -40,
                  tickValues: salesTrend[0].data.length > 10
                    ? salesTrend[0].data.filter((_, i) => i % Math.ceil(salesTrend[0].data.length / 8) === 0).map(d => d.x)
                    : undefined,
                }}
                axisLeft={{ tickSize: 0, tickPadding: 8 }}
                enableLabel={false}
                enableGridY
                borderRadius={2}
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">No data available</p>
          )}
        </ChartWrapper>

        <ChartWrapper title="Customer Age Distribution" subtitle="Transaction count by customer age">
          {loading ? (
            <div className="h-[240px] flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : ageDistribution.length > 0 ? (
            <div className="h-[280px]">
              <ResponsiveBar
                data={ageDistribution}
                keys={["Count"]}
                indexBy="age"
                margin={{ top: 10, right: 10, bottom: 50, left: 50 }}
                padding={0.15}
                colors={["hsl(30,80%,55%)"]}
                theme={nivoTheme}
                axisBottom={{
                  tickRotation: -30,
                  tickValues: ageDistribution.length > 12
                    ? ageDistribution.filter((_, i) => i % Math.ceil(ageDistribution.length / 10) === 0).map(d => d.age)
                    : undefined,
                }}
                axisLeft={{ tickSize: 0, tickPadding: 8 }}
                enableLabel={false}
                enableGridY
                borderRadius={2}
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">No data available</p>
          )}
        </ChartWrapper>
      </div>

      {/* Recent queries */}
      {!loading && metrics?.recent_queries?.length > 0 && (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="font-semibold">Recent Queries</p>
          </div>
          <div className="divide-y divide-border">
            {metrics.recent_queries.map((q, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <span className="text-xs text-muted-foreground font-mono w-6">#{q.id}</span>
                <span className="flex-1 text-sm truncate">{q.query}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {new Date(q.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
