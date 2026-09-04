"use client";

import { useState } from "react";

interface NameIdea {
  name: string;
  tagline: string;
  why: string;
  availability?: "checking" | "available" | "taken" | "error";
}

const EXAMPLES = [
  "A cozy bakery that specializes in sourdough and seasonal pastries",
  "An eco-friendly cleaning service for busy families",
  "A mobile dog grooming van with a spa vibe",
  "A vintage clothing resale shop with a quirky personality",
];

export default function Home() {
  const [description, setDescription] = useState("");
  const [names, setNames] = useState<NameIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);

  async function handleGenerate() {
    if (!description.trim()) return;
    setLoading(true);
    setError("");
    setNames([]);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          excludeNames: names.map((n) => n.name),
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        const namesWithChecking: NameIdea[] = data.names.map(
          (n: NameIdea) => ({ ...n, availability: "checking" as const })
        );
        setNames(namesWithChecking);
        setHasGenerated(true);

        // Check availability for all names in parallel
        namesWithChecking.forEach(async (item, i) => {
          try {
            const checkRes = await fetch("/api/check-name", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: item.name }),
            });
            const checkData = await checkRes.json();
            const status: NameIdea["availability"] = checkData.error
              ? "error"
              : checkData.available
              ? "available"
              : "taken";
            setNames((prev) =>
              prev.map((n, idx) =>
                idx === i ? { ...n, availability: status } : n
              )
            );
          } catch {
            setNames((prev) =>
              prev.map((n, idx) =>
                idx === i ? { ...n, availability: "error" } : n
              )
            );
          }
        });
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleExample(example: string) {
    setDescription(example);
    setNames([]);
    setHasGenerated(false);
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--cream)" }}>
      {/* Hero Header */}
      <header
        className="w-full py-6 px-6 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <span
            className="text-2xl font-black tracking-tight"
            style={{ color: "var(--orange)" }}
          >
            ✦ NAMEIT
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-4 pb-10 text-center">
        <p
          className="text-sm font-black uppercase tracking-[0.3em] mb-4"
          style={{ color: "var(--orange)" }}
        >
          ✦ Find your perfect name ✦
        </p>
        <h1
          className="text-6xl md:text-8xl font-black uppercase leading-none mb-6 tracking-tight"
          style={{ color: "var(--charcoal)" }}
        >
          What&apos;s your
          <br />
          <span style={{ color: "var(--orange)" }}>business</span>
          <br />
          called?
        </h1>
        <p
          className="text-lg font-semibold max-w-xl mx-auto"
          style={{ color: "var(--sand)" }}
        >
          Describe your business idea and we&apos;ll generate bold, creative
          name ideas in seconds.
        </p>
      </section>

      {/* Input Section */}
      <section className="max-w-3xl mx-auto px-6 pb-10">
        <div
          className="rounded-3xl p-8"
          style={{
            backgroundColor: "white",
            border: "3px solid var(--beige)",
          }}
        >
          <label
            className="block text-xs font-black uppercase tracking-widest mb-3"
            style={{ color: "var(--orange)" }}
          >
            Describe your business
          </label>
          <textarea
            className="w-full rounded-2xl p-4 text-base font-semibold resize-none outline-none transition-all"
            style={{
              backgroundColor: "var(--cream)",
              border: "2px solid var(--beige)",
              color: "var(--charcoal)",
              minHeight: "130px",
            }}
            placeholder="e.g. A plant-based smoothie bar for busy city commuters who want healthy, fast options..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--orange)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--beige)";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate();
            }}
          />

          {/* Example Prompts */}
          <div className="mt-4 mb-6">
            <p
              className="text-xs font-black uppercase tracking-widest mb-2"
              style={{ color: "var(--sand)" }}
            >
              Try an example:
            </p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => handleExample(ex)}
                  className="text-xs font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer"
                  style={{
                    backgroundColor: "var(--beige)",
                    color: "var(--charcoal)",
                    border: "2px solid var(--beige)",
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.borderColor =
                      "var(--orange)";
                    (e.target as HTMLElement).style.color = "var(--orange)";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.borderColor = "var(--beige)";
                    (e.target as HTMLElement).style.color = "var(--charcoal)";
                  }}
                >
                  {ex.length > 40 ? ex.slice(0, 40) + "…" : ex}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !description.trim()}
            className="w-full py-4 rounded-2xl text-lg font-black uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            style={{
              backgroundColor:
                loading || !description.trim()
                  ? "var(--beige)"
                  : "var(--orange)",
              color:
                loading || !description.trim() ? "var(--sand)" : "white",
            }}
          >
            {loading ? (
              <>
                <svg
                  className="spin-slow"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                Generating names…
              </>
            ) : (
              <>✦ Generate Names</>
            )}
          </button>
        </div>

        {error && (
          <p
            className="mt-4 text-center font-bold"
            style={{ color: "var(--orange)" }}
          >
            {error}
          </p>
        )}
      </section>

      {/* Results */}
      {names.length > 0 && (
        <section className="max-w-4xl mx-auto px-6 pb-20">
          <div className="text-center mb-10">
            <p
              className="text-xs font-black uppercase tracking-[0.3em] mb-2"
              style={{ color: "var(--orange)" }}
            >
              ✦ Your name ideas ✦
            </p>
            <h2
              className="text-4xl font-black uppercase"
              style={{ color: "var(--charcoal)" }}
            >
              {names.length} Ideas, Zero Limits
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {names.map((item, i) => (
              <div
                key={i}
                className="fade-up rounded-3xl p-6 flex flex-col gap-3 group cursor-default transition-all"
                style={{
                  animationDelay: `${i * 60}ms`,
                  backgroundColor: i % 3 === 0 ? "var(--orange)" : "white",
                  border: "3px solid",
                  borderColor: i % 3 === 0 ? "var(--orange)" : "var(--beige)",
                  color: i % 3 === 0 ? "white" : "var(--charcoal)",
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-3xl font-black uppercase leading-tight">
                    {item.name}
                  </h3>
                  <span
                    className="text-2xl font-black shrink-0 mt-1"
                    style={{
                      color: i % 3 === 0 ? "rgba(255,255,255,0.5)" : "var(--beige)",
                    }}
                  >
                    0{i + 1}
                  </span>
                </div>

                {/* Availability badge */}
                {item.availability === "checking" && (
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: i % 3 === 0 ? "rgba(255,255,255,0.15)" : "var(--cream)",
                      color: i % 3 === 0 ? "rgba(255,255,255,0.7)" : "var(--sand)",
                    }}
                  >
                    <svg className="spin-slow" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    Checking…
                  </span>
                )}
                {item.availability === "available" && (
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: i % 3 === 0 ? "rgba(255,255,255,0.2)" : "#d1fae5",
                      color: i % 3 === 0 ? "white" : "#065f46",
                    }}
                  >
                    ✓ Name Available
                  </span>
                )}
                {item.availability === "taken" && (
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: i % 3 === 0 ? "rgba(0,0,0,0.2)" : "#fee2e2",
                      color: i % 3 === 0 ? "rgba(255,255,255,0.9)" : "#991b1b",
                    }}
                  >
                    ✕ Already Registered
                  </span>
                )}
                {item.availability === "error" && (
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: i % 3 === 0 ? "rgba(255,255,255,0.15)" : "var(--cream)",
                      color: i % 3 === 0 ? "rgba(255,255,255,0.6)" : "var(--sand)",
                    }}
                  >
                    — Check Unavailable
                  </span>
                )}
                <p
                  className="text-sm font-black uppercase tracking-widest"
                  style={{
                    color: i % 3 === 0 ? "rgba(255,255,255,0.75)" : "var(--orange)",
                  }}
                >
                  &ldquo;{item.tagline}&rdquo;
                </p>
                <p
                  className="text-sm font-semibold leading-relaxed"
                  style={{
                    color: i % 3 === 0 ? "rgba(255,255,255,0.85)" : "var(--sand)",
                  }}
                >
                  {item.why}
                </p>
              </div>
            ))}
          </div>

          <p
            className="text-center text-xs font-semibold mt-8"
            style={{ color: "var(--sand)" }}
          >
            .com domain availability checked via RDAP. Always verify trademarks
            and local business registrations before use.
          </p>

          <div className="text-center mt-6">
            <button
              onClick={handleGenerate}
              className="px-10 py-4 rounded-2xl text-base font-black uppercase tracking-widest transition-all cursor-pointer"
              style={{
                backgroundColor: "transparent",
                border: "3px solid var(--orange)",
                color: "var(--orange)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  "var(--orange)";
                (e.currentTarget as HTMLElement).style.color = "white";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  "transparent";
                (e.currentTarget as HTMLElement).style.color = "var(--orange)";
              }}
            >
              ✦ Regenerate Ideas
            </button>
          </div>
        </section>
      )}

      {/* Empty state after first load */}
      {!hasGenerated && !loading && (
        <section className="max-w-4xl mx-auto px-6 pb-20">
          <div
            className="rounded-3xl p-10 text-center"
            style={{ border: "3px dashed var(--beige)" }}
          >
            <p className="text-6xl mb-4">✦</p>
            <p
              className="text-xl font-black uppercase tracking-wide"
              style={{ color: "var(--beige)" }}
            >
              Your name ideas will appear here
            </p>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer
        className="text-center py-8 text-xs font-bold uppercase tracking-widest"
        style={{
          borderTop: "3px solid var(--beige)",
          color: "var(--sand)",
        }}
      >
        ✦ NAMEIT — Powered by AI ✦
      </footer>
    </main>
  );
}
