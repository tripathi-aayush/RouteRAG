import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Search, ChevronRight, Star, Send, Loader2, X } from "lucide-react";
import { useToast } from "../components/ui/toast";

function FeedbackModal({ session, onClose }) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: session.id, message_id: 0, rating, feedback_text: text }),
      });
      if (!res.ok) throw new Error();
      addToast({ type: "success", title: "Thanks!", message: "Feedback submitted." });
      onClose();
    } catch {
      addToast({ type: "error", title: "Error", message: "Failed to submit." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-4 w-4" />
        </button>
        <p className="font-semibold mb-0.5">Rate this session</p>
        <p className="text-sm text-muted-foreground mb-4">Session #{session.id} · {session.title || "Untitled"}</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((v) => (
              <button key={v} type="button" onClick={() => setRating(v)}>
                <Star className={`h-5 w-5 transition-colors ${rating >= v ? "fill-foreground text-foreground" : "text-muted-foreground"}`} />
              </button>
            ))}
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your thoughts…"
            rows={4}
            required
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="flex items-center gap-2 rounded-lg bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function History() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [feedbackSession, setFeedbackSession] = useState(null);

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then(setSessions)
      .finally(() => setLoading(false));
  }, []);

  const filtered = sessions.filter((s) =>
    (s.title || `Session ${s.id}`).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {feedbackSession && <FeedbackModal session={feedbackSession} onClose={() => setFeedbackSession(null)} />}

      <div className="flex flex-col gap-4 p-5 max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Sessions</p>
            <h1 className="text-2xl font-bold tracking-tight">History</h1>
          </div>
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sessions…"
              className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-[3rem_1fr_1fr_auto] gap-4 px-4 py-2.5 border-b border-border bg-muted/40">
            <p className="text-xs font-medium text-muted-foreground">#</p>
            <p className="text-xs font-medium text-muted-foreground">Title</p>
            <p className="text-xs font-medium text-muted-foreground">Last updated</p>
            <p className="text-xs font-medium text-muted-foreground w-20"></p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Clock className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {search ? "No sessions match your search." : "No sessions yet."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((session) => (
                <div key={session.id} className="grid grid-cols-[3rem_1fr_1fr_auto] gap-4 items-center px-4 py-3 hover:bg-accent/50 transition-colors group">
                  <span className="text-xs text-muted-foreground font-mono">{session.id}</span>
                  <Link href={`/session/${session.id}`} className="text-sm font-medium hover:underline truncate">
                    {session.title || `Session ${session.id}`}
                  </Link>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3 shrink-0" />
                    {new Date(session.updated_at).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setFeedbackSession(session)}
                      className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs hover:bg-background transition-colors"
                    >
                      <Star className="h-3 w-3" /> Rate
                    </button>
                    <Link href={`/session/${session.id}`}>
                      <div className="flex items-center justify-center rounded-md border border-border w-7 h-7 hover:bg-background transition-colors">
                        <ChevronRight className="h-3.5 w-3.5" />
                      </div>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
