import { useState } from "react";
import { GoogleGenAI } from "@google/genai";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function AIRecommend({ event, onTakeSeat, onClose }) {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState(null);

  const availableSeats = Object.entries(event.seats)
    .filter(([, v]) => v === true)
    .map(([k]) => k);
  const occupiedSeats = Object.entries(event.seats)
    .filter(([, v]) => v === false)
    .map(([k]) => k);

  async function getRecommendations() {
    setLoading(true);
    setError(null);
    setRecommendations(null);
    try {
      const prompt = `Here is the seat map for "${event.name}":
Total seats: ${event.totalSeats}
Available seats: [${availableSeats.join(", ")}]
Occupied seats: [${occupiedSeats.join(", ")}]

Recommend the top 3 best available seats.
Consider central seats, seats away from clusters of occupied ones. Be short and fun.
Format exactly like this (no extra text):
1. Seat X — reason
2. Seat Y — reason
3. Seat Z — reason`;

      const ai = new GoogleGenAI({
        apiKey: import.meta.env.VITE_GEMINI_API_KEY,
      });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      const text = response.text.trim();

      const lines = text.split("\n").filter((l) => /^\d\./.test(l));
      const parsed = lines
        .map((line) => {
          const match = line.match(/^\d\.\s*Seat\s*(\d+)\s*[—–-]\s*(.+)/);
          return match ? { seatId: match[1], reason: match[2] } : null;
        })
        .filter(Boolean);

      setRecommendations(
        parsed.length ? parsed : [{ seatId: null, reason: text }],
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md animate-pop-in"
        style={{
          background: "linear-gradient(160deg, #1a0a2e, #0d1117)",
          border: "1px solid rgba(167,139,250,0.3)",
          borderRadius: "24px",
          padding: "28px 24px",
          boxShadow: "0 0 80px #7c3aed33, 0 20px 60px #00000099",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span style={{ filter: "drop-shadow(0 0 8px #a78bfa)" }}>✦</span>
              AI Seat Finder
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Powered by Gemini
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
            style={{ background: "rgba(255,255,255,0.06)", color: "#64748b" }}
          >
            ✕
          </button>
        </div>

        {/* Idle */}
        {!recommendations && !loading && !error && (
          <div className="text-center py-4">
            <div className="text-5xl mb-4 animate-float">🤖</div>
            <p className="text-slate-400 text-sm mb-1">
              {availableSeats.length} seats available
            </p>
            <p className="text-slate-500 text-xs mb-6">
              Let AI find the perfect spot for you
            </p>
            <button
              onClick={getRecommendations}
              className="px-8 py-3 rounded-xl font-bold text-white transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg,#7c3aed,#2563eb)",
                boxShadow: "0 0 24px #7c3aed66",
              }}
            >
              ✦ Get Recommendations
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4 animate-spin-slow">🔮</div>
            <p className="text-slate-400 text-sm font-mono mb-4">
              Analysing seat map...
            </p>
            <div className="flex gap-1.5 justify-center">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="wave-bar"
                  style={{
                    animationDelay: `${i * 0.15}s`,
                    background: "#a78bfa",
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">😵</div>
            <p className="text-red-400 text-sm font-mono mb-4">{error}</p>
            <button
              onClick={getRecommendations}
              className="text-violet-400 text-sm underline hover:text-violet-300 transition"
            >
              Try again
            </button>
          </div>
        )}

        {/* Results */}
        {recommendations && (
          <div className="flex flex-col gap-3">
            {recommendations.map((rec, i) => (
              <div
                key={i}
                className="rounded-xl p-4 flex items-center justify-between gap-3 animate-slide-up"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(167,139,250,0.15)",
                  animationDelay: `${i * 80}ms`,
                }}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span className="text-xl shrink-0">{MEDALS[i] || "🎯"}</span>
                  <div className="min-w-0">
                    {rec.seatId && (
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-white font-mono">
                          Seat {rec.seatId}
                        </span>
                        {event.seats[rec.seatId] === true ? (
                          <span
                            className="text-xs px-1.5 py-0.5 rounded-md font-mono"
                            style={{
                              background: "rgba(52,211,153,0.15)",
                              color: "#34d399",
                            }}
                          >
                            free
                          </span>
                        ) : (
                          <span
                            className="text-xs px-1.5 py-0.5 rounded-md font-mono"
                            style={{
                              background: "rgba(239,68,68,0.15)",
                              color: "#f87171",
                            }}
                          >
                            taken
                          </span>
                        )}
                      </div>
                    )}
                    <p className="text-slate-400 text-xs leading-relaxed">
                      {rec.reason}
                    </p>
                  </div>
                </div>
                {rec.seatId && event.seats[rec.seatId] === true && (
                  <button
                    onClick={() => onTakeSeat(rec.seatId)}
                    className="shrink-0 px-3 py-2 rounded-lg text-sm font-bold text-white transition-all hover:scale-105"
                    style={{
                      background: "linear-gradient(135deg,#059669,#34d399)",
                      boxShadow: "0 0 12px #05966966",
                    }}
                  >
                    Take it
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={getRecommendations}
              className="text-slate-500 hover:text-slate-300 text-xs text-center mt-1 font-mono transition"
            >
              ↻ Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
