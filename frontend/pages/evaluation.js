import React, { useState, useEffect } from "react";
import { ResponsiveBar } from "@nivo/bar";
import { FlaskConical, Loader2, CheckCircle2, AlertCircle, TrendingUp, ShoppingBag, MapPin, Users } from "lucide-react";

// ─── shared Nivo dark theme ───────────────────────────────────────────────────
const nivoTheme = {
  axis: {
    ticks: { text: { fill: "hsl(0,0%,55%)", fontSize: 11 } },
    legend: { text: { fill: "hsl(0,0%,55%)", fontSize: 12 } },
  },
  grid: { line: { stroke: "hsl(0,0%,14%)" } },
  tooltip: {
    container: {
      background: "hsl(0,0%,7%)",
      border: "1px solid hsl(0,0%,14%)",
      color: "hsl(0,0%,95%)",
      fontSize: 13,
    },
  },
};

// ─── small reusable wrappers ─────────────────────────────────────────────────
const Section = ({ title, icon: Icon, color, children }) => (
  <div className="rounded-xl border border-border bg-card overflow-hidden">
    <div className={`flex items-center gap-2 px-5 py-3 border-b border-border`}>
      <Icon className={`h-4 w-4 ${color}`} />
      <p className="font-semibold">{title}</p>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const ScoreGauge = ({ label, score, max = 5 }) => {
  const pct = Math.round((score / max) * 100);
  const color =
    pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold tabular-nums">
          {score > 0 ? score.toFixed(1) : "—"} / {max}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// ─── preset Q&A examples to make evaluation easy to demo ────────────────────
const PRESETS = [
  {
    label: "Sales trend question",
    question: "What is the sales trend over time?",
    answer:
      "Sales have shown a generally stable trend across the dataset period, with some fluctuations. Daily sales volumes hover around 5-8 transactions per day with occasional peaks.",
    ground_truth:
      "The dataset covers sales from January 2022. Sales volumes are distributed across 4 products (Widget A-D) and 4 regions (North, South, East, West) with roughly even distribution.",
  },
  {
    label: "Product performance question",
    question: "Which product has the best performance?",
    answer:
      "Widget B has the highest total sales count, closely followed by Widget C. Widget A and Widget D perform similarly.",
    ground_truth:
      "All four widgets (A, B, C, D) have approximately equal sales counts (~620-640 each) based on the 2,501 record dataset.",
  },
  {
    label: "Customer satisfaction question",
    question: "What is the average customer satisfaction?",
    answer:
      "The average customer satisfaction across all products and regions is approximately 3.0 out of 5.",
    ground_truth:
      "The average Customer_Satisfaction in the dataset is approximately 3.0 (scores range from 1.0 to 5.0).",
  },
];

// ─── main page ───────────────────────────────────────────────────────────────
export default function Evaluation() {
  // ── QAEval state ──
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [groundTruth, setGroundTruth] = useState("");
  const [evalResult, setEvalResult] = useState(null);
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalError, setEvalError] = useState(null);

  // ── visualisation data state ──
  const [metrics, setMetrics] = useState(null);
  const [vizLoading, setVizLoading] = useState(true);

  // Load dashboard metrics on mount for the visualisation section
  useEffect(() => {
    fetch("/api/dashboard/metrics")
      .then((r) => r.json())
      .then(setMetrics)
      .finally(() => setVizLoading(false));
  }, []);

  // ── apply preset ──
  const applyPreset = (p) => {
    setQuestion(p.question);
    setAnswer(p.answer);
    setGroundTruth(p.ground_truth);
    setEvalResult(null);
    setEvalError(null);
  };

  // ── run evaluation ──
  const runEval = async (e) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim() || !groundTruth.trim()) return;
    setEvalLoading(true);
    setEvalResult(null);
    setEvalError(null);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          answer,
          ground_truth: groundTruth,
        }),
      });

      // Always parse as JSON — never try to read raw HTML error pages
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error(`Backend returned an unexpected response (HTTP ${res.status}). Check that the backend server is running.`);
      }

      const data = await res.json();
      if (!res.ok) {
        // FastAPI error shape: { detail: "..." }
        throw new Error(data?.detail || `Request failed with status ${res.status}`);
      }
      setEvalResult(data);
    } catch (err) {
      setEvalError(err.message || "Evaluation failed");
    } finally {
      setEvalLoading(false);
    }
  };

  // ── transform metrics for charts ──
  const salesTrendData = metrics?.sales_trend
    ? Object.entries(metrics.sales_trend)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .map(([date, count]) => ({ date, Transactions: count }))
    : [];

  const productData = metrics?.sales_by_product
    ? Object.entries(metrics.sales_by_product)
        .map(([product, count]) => ({ product, Sales: count }))
        .sort((a, b) => b.Sales - a.Sales)
    : [];

  const regionData = metrics?.sales_by_region && metrics?.satisfaction_by_region
    ? Object.entries(metrics.sales_by_region).map(([region, sales]) => ({
        region,
        Sales: sales,
        Satisfaction: Number(metrics.satisfaction_by_region[region] || 0) * 100,
      }))
    : [];

  const genderData = metrics?.sales_by_gender
    ? Object.entries(metrics.sales_by_gender).map(([gender, count]) => ({
        gender,
        Sales: count,
      }))
    : [];

  const ageData = metrics?.age_distribution
    ? Object.entries(metrics.age_distribution)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([age, count]) => ({ age, Count: count }))
    : [];

  // Tick reduction helper
  const thinTicks = (arr, key, max = 8) =>
    arr.length > max
      ? arr.filter((_, i) => i % Math.ceil(arr.length / max) === 0).map((d) => d[key])
      : undefined;

  return (
    <div className="flex flex-col gap-6 p-5 w-full">
      {/* ── Page header ── */}
      <div className="mb-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
          LLMOps
        </p>
        <h1 className="text-2xl font-bold tracking-tight">Model Evaluation & Visualizations</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Run QAEvalChain to assess model accuracy, then explore all data visualizations.
        </p>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 1 — QAEvalChain Evaluation
      ════════════════════════════════════════════════════════════════════ */}
      <Section title="QAEvalChain — Model Evaluation" icon={FlaskConical} color="text-violet-400">
        {/* Presets */}
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Quick presets
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p)}
                className="rounded-full border border-border bg-background px-3 py-1 text-xs hover:border-foreground hover:bg-accent transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={runEval} className="grid gap-3 md:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Question</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. What is the average customer satisfaction?"
              rows={4}
              required
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">AI Answer (to evaluate)</label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Paste the AI-generated answer here…"
              rows={4}
              required
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Ground Truth</label>
            <textarea
              value={groundTruth}
              onChange={(e) => setGroundTruth(e.target.value)}
              placeholder="The correct / expected answer…"
              rows={4}
              required
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>

          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={evalLoading}
              className="flex items-center gap-2 rounded-lg bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {evalLoading ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Evaluating…</>
              ) : (
                <><FlaskConical className="h-3.5 w-3.5" /> Run QAEvalChain</>
              )}
            </button>
          </div>
        </form>

        {/* Error */}
        {evalError && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {evalError}
          </div>
        )}

        {/* Results */}
        {evalResult && (
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {/* Scores */}
            <div className="rounded-lg border border-border bg-background p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <p className="font-semibold text-sm">Evaluation Scores</p>
              </div>
              <ScoreGauge label="Accuracy"       score={evalResult.metrics?.accuracy       ?? 0} />
              <ScoreGauge label="Completeness"   score={evalResult.metrics?.completeness   ?? 0} />
              <ScoreGauge label="Relevance"      score={evalResult.metrics?.relevance      ?? 0} />
              <ScoreGauge label="Business Value" score={evalResult.metrics?.business_value ?? 0} />
            </div>

            {/* Score bar chart */}
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="font-semibold text-sm mb-3">Score Comparison</p>
              <div className="h-[180px]">
                <ResponsiveBar
                  data={[
                    { metric: "Accuracy",       Score: evalResult.metrics?.accuracy       ?? 0 },
                    { metric: "Completeness",   Score: evalResult.metrics?.completeness   ?? 0 },
                    { metric: "Relevance",      Score: evalResult.metrics?.relevance      ?? 0 },
                    { metric: "Business Value", Score: evalResult.metrics?.business_value ?? 0 },
                  ]}
                  keys={["Score"]}
                  indexBy="metric"
                  margin={{ top: 10, right: 10, bottom: 40, left: 40 }}
                  padding={0.35}
                  maxValue={5}
                  colors={["hsl(270,70%,60%)"]}
                  theme={nivoTheme}
                  axisBottom={{ tickRotation: -15 }}
                  axisLeft={{ tickSize: 0, tickPadding: 8 }}
                  enableLabel={false}
                  enableGridY
                  borderRadius={3}
                />
              </div>
            </div>

            {/* Feedback */}
            <div className="md:col-span-2 rounded-lg border border-border bg-background p-4 flex flex-col gap-2">
              <p className="font-semibold text-sm">Feedback & Improvement Areas</p>
              {evalResult.metrics?.overall_feedback && (
                <p className="text-sm text-muted-foreground italic">"{evalResult.metrics.overall_feedback}"</p>
              )}
              <p className="text-sm text-muted-foreground">{evalResult.feedback}</p>
              {evalResult.improvement_areas?.length > 0 && (
                <ul className="mt-1 flex flex-col gap-1">
                  {evalResult.improvement_areas.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Section>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 2 — Sales Trends Over Time
      ════════════════════════════════════════════════════════════════════ */}
      <Section title="Sales Trends Over Time" icon={TrendingUp} color="text-emerald-400">
        <p className="text-sm text-muted-foreground mb-4">
          Daily transaction volume across the entire dataset period.
        </p>
        {vizLoading ? (
          <div className="h-[280px] flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : salesTrendData.length > 0 ? (
          <div className="h-[280px]">
            <ResponsiveBar
              data={salesTrendData}
              keys={["Transactions"]}
              indexBy="date"
              margin={{ top: 10, right: 10, bottom: 60, left: 50 }}
              padding={0.15}
              colors={["hsl(160,60%,50%)"]}
              theme={nivoTheme}
              axisBottom={{
                tickRotation: -40,
                tickValues: thinTicks(salesTrendData, "date"),
              }}
              axisLeft={{ tickSize: 0, tickPadding: 8 }}
              enableLabel={false}
              enableGridY
              borderRadius={2}
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-10">No data available</p>
        )}
      </Section>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 3 — Product Performance Comparisons
      ════════════════════════════════════════════════════════════════════ */}
      <Section title="Product Performance Comparisons" icon={ShoppingBag} color="text-blue-400">
        <p className="text-sm text-muted-foreground mb-4">
          Total sales transactions per product — sorted highest to lowest.
        </p>
        {vizLoading ? (
          <div className="h-[280px] flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : productData.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2">
            {/* Bar chart */}
            <div className="h-[280px]">
              <ResponsiveBar
                data={productData}
                keys={["Sales"]}
                indexBy="product"
                margin={{ top: 10, right: 10, bottom: 50, left: 55 }}
                padding={0.35}
                colors={["hsl(220,70%,60%)"]}
                theme={nivoTheme}
                axisBottom={{ tickRotation: -15 }}
                axisLeft={{ tickSize: 0, tickPadding: 8 }}
                enableLabel={false}
                enableGridY
                borderRadius={3}
              />
            </div>

            {/* Satisfaction alongside sales */}
            {metrics?.satisfaction_by_region && (
              <div className="h-[280px]">
                <ResponsiveBar
                  data={
                    metrics?.sales_by_product && metrics?.satisfaction_by_region
                      ? Object.entries(metrics.sales_by_product).map(([product, sales]) => ({
                          product,
                          "Avg Satisfaction ×100": Math.round(
                            (metrics.satisfaction_by_region[product] ?? 0) * 100
                          ),
                        }))
                      : []
                  }
                  keys={["Avg Satisfaction ×100"]}
                  indexBy="product"
                  margin={{ top: 10, right: 10, bottom: 50, left: 55 }}
                  padding={0.35}
                  colors={["hsl(30,80%,55%)"]}
                  theme={nivoTheme}
                  axisBottom={{ tickRotation: -15 }}
                  axisLeft={{
                    tickSize: 0, tickPadding: 8,
                    format: (v) => `${(v / 100).toFixed(1)}`,
                  }}
                  enableLabel={false}
                  enableGridY
                  borderRadius={3}
                />
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-10">No data available</p>
        )}
      </Section>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 4 — Regional Analysis
      ════════════════════════════════════════════════════════════════════ */}
      <Section title="Regional Analysis" icon={MapPin} color="text-rose-400">
        <p className="text-sm text-muted-foreground mb-4">
          Sales volume and average customer satisfaction broken down by region.
        </p>
        {vizLoading ? (
          <div className="h-[280px] flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : regionData.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2">
            {/* Sales by region */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Transactions by Region
              </p>
              <div className="h-[260px]">
                <ResponsiveBar
                  data={regionData}
                  keys={["Sales"]}
                  indexBy="region"
                  margin={{ top: 10, right: 10, bottom: 50, left: 55 }}
                  padding={0.35}
                  colors={["hsl(350,70%,60%)"]}
                  theme={nivoTheme}
                  axisBottom={{ tickRotation: 0 }}
                  axisLeft={{ tickSize: 0, tickPadding: 8 }}
                  enableLabel={false}
                  enableGridY
                  borderRadius={3}
                />
              </div>
            </div>

            {/* Satisfaction by region */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Avg Satisfaction by Region
              </p>
              <div className="h-[260px]">
                <ResponsiveBar
                  data={
                    metrics?.satisfaction_by_region
                      ? Object.entries(metrics.satisfaction_by_region).map(([region, score]) => ({
                          region,
                          Score: Number(score),
                        }))
                      : []
                  }
                  keys={["Score"]}
                  indexBy="region"
                  margin={{ top: 10, right: 10, bottom: 50, left: 55 }}
                  padding={0.35}
                  maxValue={5}
                  colors={["hsl(350,60%,70%)"]}
                  theme={nivoTheme}
                  axisBottom={{ tickRotation: 0 }}
                  axisLeft={{ tickSize: 0, tickPadding: 8 }}
                  enableLabel={false}
                  enableGridY
                  borderRadius={3}
                />
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-10">No data available</p>
        )}
      </Section>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 5 — Customer Demographics & Segmentation
      ════════════════════════════════════════════════════════════════════ */}
      <Section title="Customer Demographics & Segmentation" icon={Users} color="text-amber-400">
        <p className="text-sm text-muted-foreground mb-4">
          Customer age distribution and gender breakdown — key demographic segments.
        </p>
        {vizLoading ? (
          <div className="h-[280px] flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {/* Age distribution */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Age Distribution
              </p>
              <div className="h-[260px]">
                <ResponsiveBar
                  data={ageData}
                  keys={["Count"]}
                  indexBy="age"
                  margin={{ top: 10, right: 10, bottom: 50, left: 55 }}
                  padding={0.1}
                  colors={["hsl(38,80%,55%)"]}
                  theme={nivoTheme}
                  axisBottom={{
                    tickRotation: -30,
                    tickValues: thinTicks(ageData, "age", 10),
                  }}
                  axisLeft={{ tickSize: 0, tickPadding: 8 }}
                  enableLabel={false}
                  enableGridY
                  borderRadius={2}
                />
              </div>
            </div>

            {/* Gender breakdown */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Sales by Gender
              </p>
              <div className="h-[260px]">
                <ResponsiveBar
                  data={genderData}
                  keys={["Sales"]}
                  indexBy="gender"
                  margin={{ top: 10, right: 10, bottom: 50, left: 55 }}
                  padding={0.45}
                  colors={["hsl(38,60%,65%)"]}
                  theme={nivoTheme}
                  axisBottom={{ tickRotation: 0 }}
                  axisLeft={{ tickSize: 0, tickPadding: 8 }}
                  enableLabel
                  labelTextColor="hsl(0,0%,10%)"
                  enableGridY
                  borderRadius={3}
                />
              </div>
            </div>

            {/* Segmentation summary cards */}
            {metrics && (
              <div className="md:col-span-2 grid grid-cols-3 gap-3">
                {[
                  {
                    label: "Young (<30)",
                    desc: "Emerging customers",
                    color: "border-amber-500/30 bg-amber-500/10 text-amber-400",
                  },
                  {
                    label: "Middle (30–50)",
                    desc: "Core customer segment",
                    color: "border-blue-500/30 bg-blue-500/10 text-blue-400",
                  },
                  {
                    label: "Senior (>50)",
                    desc: "Established customers",
                    color: "border-violet-500/30 bg-violet-500/10 text-violet-400",
                  },
                ].map(({ label, desc, color }) => (
                  <div key={label} className={`rounded-lg border p-3 ${color}`}>
                    <p className="font-semibold text-sm">{label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Section>
    </div>
  );
}
