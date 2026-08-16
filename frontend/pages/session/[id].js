import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ArrowLeft, Clock, User, Bot, Loader2, AlertCircle, FileText } from "lucide-react";

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
        isUser ? "border-border bg-foreground text-background" : "border-border bg-card"
      }`}>
        {isUser
          ? <User className="h-3.5 w-3.5" />
          : <Bot className="h-3.5 w-3.5 text-muted-foreground" />
        }
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        <div className={`rounded-xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-foreground text-background rounded-tr-sm"
            : "bg-card border border-border rounded-tl-sm"
        }`}>
          {message.content}
        </div>
        <span className="text-xs text-muted-foreground px-1">
          {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}

export default function SessionDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/session/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Session not found");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-10">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-10">
        <AlertCircle className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <Link href="/history">
          <button className="text-sm underline text-muted-foreground hover:text-foreground">
            Back to History
          </button>
        </Link>
      </div>
    );
  }

  const { session, messages, summary } = data;

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto w-full">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
        <Link href="/history">
          <button className="flex items-center justify-center h-8 w-8 rounded-lg border border-border hover:bg-accent transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold truncate">
            {session.title || `Session #${session.id}`}
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
            <Clock className="h-3 w-3" />
            <span>
              {new Date(session.created_at).toLocaleDateString([], {
                year: "numeric", month: "short", day: "numeric",
              })}
              {" · "}
              {messages.length} message{messages.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground font-mono">
          #{session.id}
        </span>
      </div>

      {/* ── Summary banner ── */}
      {summary && (
        <div className="mx-5 mt-4 flex gap-3 rounded-lg border border-border bg-card px-4 py-3 shrink-0">
          <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
              Session Summary
            </p>
            <p className="text-sm text-foreground leading-relaxed">{summary}</p>
          </div>
        </div>
      )}

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-5">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-2 py-16">
            <Bot className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No messages in this session.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}
      </div>

      {/* ── Footer ── */}
      <div className="shrink-0 px-5 py-3 border-t border-border flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Last updated {new Date(session.updated_at).toLocaleString()}
        </p>
        <Link href="/history">
          <button className="text-xs text-muted-foreground hover:text-foreground transition-colors underline">
            ← All sessions
          </button>
        </Link>
      </div>

    </div>
  );
}
