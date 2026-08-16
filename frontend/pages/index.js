import React from "react";
import Link from "next/link";
import { ArrowRight, MessageCircle, BarChart2, Clock, TrendingUp, Brain, PieChart } from "lucide-react";

const features = [
  {
    href: "/chat",
    icon: MessageCircle,
    label: "Chat",
    description: "Upload a file and ask questions about your business data in natural language.",
    color: "from-blue-500/20 to-blue-600/5",
    iconColor: "text-blue-400",
    borderColor: "hover:border-blue-500/50",
  },
  {
    href: "/analytics",
    icon: BarChart2,
    label: "Analytics",
    description: "Explore metrics, charts, and AI-generated insights from your data.",
    color: "from-violet-500/20 to-violet-600/5",
    iconColor: "text-violet-400",
    borderColor: "hover:border-violet-500/50",
  },
  {
    href: "/history",
    icon: Clock,
    label: "History",
    description: "Review past sessions, revisit answers, and submit feedback.",
    color: "from-emerald-500/20 to-emerald-600/5",
    iconColor: "text-emerald-400",
    borderColor: "hover:border-emerald-500/50",
  },
];

const objectives = [
  {
    icon: TrendingUp,
    title: "Analyze Business Data",
    description: "Perform comprehensive analysis to identify key trends and patterns across your datasets.",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  {
    icon: Brain,
    title: "Generate Insights & Recommendations",
    description: "Utilize natural language processing to deliver actionable business insights from your data.",
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
  },
  {
    icon: PieChart,
    title: "Visualize Data Insights",
    description: "Present insights through rich visualizations and charts for easier interpretation.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
];

export default function Home() {
  return (
    <div className="relative min-h-full overflow-x-hidden">

      {/* ── Background ── */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        {/* deep base */}
        <div className="absolute inset-0 bg-[hsl(0,0%,4%)]" />

        {/* dot-grid */}
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "radial-gradient(circle, hsl(0,0%,60%) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* glow orbs */}
        <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-[480px] h-[480px] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-emerald-600/10 blur-[100px]" />

        {/* subtle top gradient fade */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/40 to-transparent" />
      </div>

      {/* ── Content ── */}
      <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-14">

        {/* ── Hero ── */}
        <section className="flex flex-col items-start gap-4 pt-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold tracking-widest uppercase text-blue-400">
            Business Intelligence Assistant
          </span>

          <h1 className="text-5xl font-bold tracking-tight text-white leading-[1.1]">
            Route<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400">RAG</span>
          </h1>

          <p className="text-base text-muted-foreground leading-relaxed max-w-xl">
            An AI-powered Business Intelligence Assistant built on{" "}
            <span className="text-white font-medium">LangChain</span>,{" "}
            <span className="text-white font-medium">RAG</span>, and{" "}
            <span className="text-white font-medium">LLMs</span> — turning raw business data into instant, actionable insights.
          </p>

          <div className="flex items-center gap-3 mt-1">
            <Link href="/chat">
              <button className="inline-flex items-center gap-2 rounded-lg bg-white text-black font-semibold text-sm px-4 py-2.5 hover:bg-white/90 transition-colors">
                Get Started <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
            <Link href="/analytics">
              <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card text-sm font-medium px-4 py-2.5 hover:border-foreground transition-colors">
                View Analytics
              </button>
            </Link>
          </div>
        </section>

        {/* ── Project Objective ── */}
        <section>
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Project Objective</p>
            <h2 className="text-2xl font-bold tracking-tight text-white">What RouteRAG Does</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl leading-relaxed">
              RouteRAG is an innovative Business Intelligence Assistant that addresses modern data challenges
              by automating analysis through advanced AI technologies — delivering insights faster than traditional BI tools.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {objectives.map(({ icon: Icon, title, description, color, bg }) => (
              <div
                key={title}
                className={`rounded-xl border p-5 flex flex-col gap-3 ${bg} backdrop-blur-sm`}
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${bg}`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <div>
                  <p className={`font-semibold text-sm ${color}`}>{title}</p>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Tech stack pills ── */}
        <section className="rounded-xl border border-border bg-card/60 backdrop-blur-sm px-6 py-5 flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Powered By</p>
          <div className="flex flex-wrap gap-2">
            {["LangChain", "RAG", "LLMs", "DuckDB", "FastAPI", "Next.js", "Nivo Charts", "OpenAI"].map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* ── Feature cards ── */}
        <section>
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Explore</p>
            <h2 className="text-2xl font-bold tracking-tight text-white">Start Exploring</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {features.map(({ href, icon: Icon, label, description, color, iconColor, borderColor }) => (
              <Link key={href} href={href}>
                <div
                  className={`group relative overflow-hidden rounded-xl border border-border bg-gradient-to-br ${color} p-5 cursor-pointer transition-all duration-200 ${borderColor} hover:-translate-y-0.5`}
                >
                  <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background/60`}>
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                  </div>
                  <p className="font-semibold text-sm text-white mb-1">{label}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                  <ArrowRight className={`absolute top-5 right-5 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-150 ${iconColor}`} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="text-center text-xs text-muted-foreground pb-4">
          RouteRAG © 2026 — AI-powered Business Intelligence
        </footer>

      </div>
    </div>
  );
}
