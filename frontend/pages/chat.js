import React, { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Loader2, UploadCloud, FileText, X } from "lucide-react";
import { useToast } from "../components/ui/toast";

// ── Rich message renderer ─────────────────────────────────────────────────────
// Parses the plain-text responses from the backend and renders them as
// structured UI: score bars for satisfaction, ranked lists for sales, etc.

function ScoreBar({ label, score, max = 5 }) {
  const pct = Math.round((score / max) * 100);
  const color = pct >= 70 ? "bg-emerald-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 text-xs text-muted-foreground shrink-0 truncate">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold tabular-nums w-10 text-right">{score} / {max}</span>
    </div>
  );
}

function AssistantMessage({ content }) {
  const lines = content.split("\n").filter(Boolean);

  // Detect blocks
  const headerLine = lines.find(l => !l.startsWith("•") && !l.startsWith("-") && l.trim() !== "");
  const bulletLines = lines.filter(l => l.startsWith("•") || l.startsWith("-"));
  const insightStart = lines.findIndex(l => l.toLowerCase().includes("key insight"));
  const insightLines = insightStart >= 0
    ? lines.slice(insightStart + 1).filter(l => l.startsWith("•") || l.startsWith("-"))
    : [];
  const mainBullets = insightLines.length > 0
    ? bulletLines.filter(l => !insightLines.includes(l))
    : bulletLines;

  // Detect satisfaction scores: "• Widget D: 3.07 out of 5"
  const isSatisfaction = mainBullets.some(l => /out of 5/i.test(l));
  // Detect sales numbers: "• Widget B: 623 sales"
  const isSales = mainBullets.some(l => /\d+ sales/i.test(l));
  // Detect trend summary: "• Total transactions:"
  const isTrend = mainBullets.some(l => /total transactions/i.test(l));

  return (
    <div className="flex flex-col gap-2.5 text-sm">
      {/* Header line */}
      {headerLine && (
        <p className="font-medium text-foreground">{headerLine}</p>
      )}

      {/* Satisfaction score bars */}
      {isSatisfaction && mainBullets.length > 0 && (
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-background p-3">
          {mainBullets.map((line, i) => {
            const match = line.match(/•\s*(.+?):\s*([\d.]+)\s*out of\s*([\d.]+)/i);
            if (!match) return <p key={i} className="text-muted-foreground">{line.replace(/^[•\-]\s*/, "")}</p>;
            const [, label, score, max] = match;
            return <ScoreBar key={i} label={label.trim()} score={parseFloat(score)} max={parseFloat(max)} />;
          })}
        </div>
      )}

      {/* Sales ranked list */}
      {isSales && !isSatisfaction && mainBullets.length > 0 && (
        <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-background p-3">
          {mainBullets.map((line, i) => {
            const clean = line.replace(/^[•\-]\s*/, "");
            const match = clean.match(/^(.+?):\s*([\d,]+)\s*sales?/i);
            if (!match) return <p key={i} className="text-muted-foreground">{clean}</p>;
            const [, label, num] = match;
            return (
              <div key={i} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-mono w-4">{i + 1}.</span>
                  <span>{label.trim()}</span>
                </span>
                <span className="text-xs font-semibold tabular-nums text-muted-foreground">{num} sales</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Trend summary stats */}
      {isTrend && mainBullets.length > 0 && (
        <div className="grid grid-cols-1 gap-1.5 rounded-lg border border-border bg-background p-3">
          {mainBullets.map((line, i) => {
            const clean = line.replace(/^[•\-]\s*/, "");
            const [label, ...rest] = clean.split(":");
            return (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{label.trim()}</span>
                <span className="font-semibold">{rest.join(":").trim()}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Generic bullets (RAG / fallback) */}
      {!isSatisfaction && !isSales && !isTrend && mainBullets.length > 0 && (
        <ul className="flex flex-col gap-1">
          {mainBullets.map((line, i) => (
            <li key={i} className="flex gap-2 text-muted-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
              <span>{line.replace(/^[•\-]\s*/, "")}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Key insights block */}
      {insightLines.length > 0 && (
        <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 flex flex-col gap-1.5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Key Insights</p>
          {insightLines.map((line, i) => (
            <div key={i} className="flex gap-2 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-foreground shrink-0" />
              <span>{line.replace(/^[•\-]\s*/, "")}</span>
            </div>
          ))}
        </div>
      )}

      {/* Plain paragraphs (no bullets at all — pure RAG text) */}
      {bulletLines.length === 0 && (
        <p className="text-muted-foreground leading-relaxed">{content}</p>
      )}
    </div>
  );
}

export default function Chat() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const { addToast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const onDragOver = useCallback((e) => { e.preventDefault(); setIsDragging(true); }, []);
  const onDragLeave = useCallback((e) => { e.preventDefault(); setIsDragging(false); }, []);
  const onDrop = useCallback((e) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0]; if (f) setFile(f);
  }, []);

  const handleFileSelect = (e) => { const f = e.target.files[0]; if (f) setFile(f); };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      addToast({ type: "success", title: "Uploaded", message: `${file.name} ready to query` });
    } catch (err) {
      addToast({ type: "error", title: "Upload failed", message: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  const handleQuery = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    const userMsg = { type: "user", content: query };
    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMsg.content, session_id: null }),
      });
      if (!res.ok) throw new Error("Bad response");
      const data = await res.json();
      if (data.answer) setMessages((prev) => [...prev, { type: "assistant", content: data.answer }]);
      else throw new Error("Invalid response");
    } catch {
      addToast({ type: "error", title: "Error", message: "Failed to get response." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left: Upload panel */}
      <div className="w-[260px] shrink-0 border-r border-border flex flex-col bg-background">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Data Source</p>
        </div>
        <div className="flex-1 px-3 py-3 flex flex-col gap-3">
          {/* Drop zone */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => document.getElementById("file-upload").click()}
            className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-3 py-6 cursor-pointer transition-colors text-center
              ${isDragging ? "border-foreground bg-accent" : "border-border hover:border-foreground hover:bg-accent"}`}
          >
            <UploadCloud className="h-5 w-5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground leading-relaxed">Drop a CSV or Excel file<br />or click to browse</p>
            <input type="file" id="file-upload" className="hidden" accept=".csv,.xlsx,.xls" onChange={handleFileSelect} />
          </div>

          {file && (
            <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2">
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 text-sm truncate">{file.name}</span>
              <button onClick={() => setFile(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {file && (
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="flex items-center justify-center gap-2 rounded-md bg-foreground text-background text-sm font-medium px-4 py-2 hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isUploading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isUploading ? "Uploading…" : "Upload & Activate"}
            </button>
          )}

          <div className="mt-auto pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Upload your data file, then ask questions in the chat.
            </p>
          </div>
        </div>
      </div>

      {/* Right: Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-12 flex items-center px-5 border-b border-border shrink-0">
          <span className="font-semibold">Chat</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <Bot className="h-7 w-7 text-muted-foreground" />
              <p className="text-sm text-muted-foreground max-w-xs">
                Upload a file on the left, then ask anything about your data.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2.5 ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
              {msg.type === "assistant" && (
                <div className="h-7 w-7 rounded-full border border-border bg-card flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-3.5 w-3.5" />
                </div>
              )}
              {msg.type === "user" ? (
                <div className="max-w-[75%] rounded-xl rounded-br-sm px-4 py-2.5 text-sm leading-relaxed bg-foreground text-background">
                  {msg.content}
                </div>
              ) : (
                <div className="max-w-[80%] rounded-xl rounded-bl-sm px-4 py-3 bg-card border border-border text-foreground">
                  <AssistantMessage content={msg.content} />
                </div>
              )}
              {msg.type === "user" && (
                <div className="h-7 w-7 rounded-full border border-border bg-card flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2.5 justify-start">
              <div className="h-7 w-7 rounded-full border border-border bg-card flex items-center justify-center shrink-0">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div className="bg-card border border-border rounded-xl rounded-bl-sm px-4 py-2.5 flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Thinking…</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="shrink-0 px-5 py-3 border-t border-border">
          <form onSubmit={handleQuery} className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question about your data…"
              disabled={isLoading}
              className="flex-1 rounded-lg border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background disabled:opacity-40 hover:opacity-90 transition-opacity shrink-0"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
