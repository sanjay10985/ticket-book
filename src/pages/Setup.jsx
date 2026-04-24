import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import Stars from "../components/Stars";

export default function Setup() {
  const [name, setName] = useState("");
  const [totalSeats, setTotalSeats] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim() || !totalSeats) return;
    setLoading(true);
    setError(null);
    try {
      const count = parseInt(totalSeats);
      const seats = Object.fromEntries(
        Array.from({ length: count }, (_, i) => [i + 1, true]),
      );
      const ref = await addDoc(collection(db, "events"), {
        name,
        totalSeats: count,
        seats,
      });
      navigate(`/event/${ref.id}?admin=true`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div
      className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, #1e0a3c 0%, #080b14 60%)",
      }}
    >
      <Stars />

      {/* Glow orbs */}
      <div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, #7c3aed22, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, #0ea5e922, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 animate-float"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #2563eb)",
              boxShadow: "0 0 40px #7c3aed66",
            }}
          >
            <span className="text-4xl">🎟️</span>
          </div>
          <h1 className="text-4xl font-bold shimmer-text mb-1">SeatMap</h1>
          <p className="text-slate-400 text-sm">
            Live seat management, real-time fun
          </p>
        </div>

        {/* Card */}
        <div
          className="glass rounded-3xl p-8 animate-neon-border"
          style={{ borderWidth: "1px" }}
        >
          <form onSubmit={handleCreate} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-mono text-violet-400 mb-2 uppercase tracking-widest">
                Event Name
              </label>
              <input
                type="text"
                placeholder="IPL Watch Party 🏏"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl px-4 py-3 text-white placeholder-slate-600 outline-none transition-all duration-200 font-medium"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(167,139,250,0.3)",
                  boxShadow: name ? "0 0 0 2px #7c3aed44" : "none",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#a78bfa")}
                onBlur={(e) =>
                  (e.target.style.borderColor = "rgba(167,139,250,0.3)")
                }
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-violet-400 mb-2 uppercase tracking-widest">
                Number of Seats
              </label>
              <input
                type="number"
                placeholder="50"
                min="1"
                max="500"
                value={totalSeats}
                onChange={(e) => setTotalSeats(e.target.value)}
                required
                className="w-full rounded-xl px-4 py-3 text-white placeholder-slate-600 outline-none transition-all duration-200 font-mono text-lg"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(167,139,250,0.3)",
                  boxShadow: totalSeats ? "0 0 0 2px #7c3aed44" : "none",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#a78bfa")}
                onBlur={(e) =>
                  (e.target.style.borderColor = "rgba(167,139,250,0.3)")
                }
              />
              {totalSeats && (
                <p className="text-xs text-slate-500 mt-1.5 font-mono">
                  → {Math.ceil(Math.sqrt(parseInt(totalSeats) || 0))} ×{" "}
                  {Math.ceil(Math.sqrt(parseInt(totalSeats) || 0))} grid
                </p>
              )}
            </div>

            {error && (
              <div
                className="rounded-xl px-4 py-3 text-sm text-red-300 font-mono"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                }}
              >
                ⚠ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="relative mt-1 rounded-xl py-4 font-bold text-white text-lg overflow-hidden transition-all duration-200 disabled:opacity-50"
              style={{
                background: loading
                  ? "rgba(124,58,237,0.5)"
                  : "linear-gradient(135deg, #7c3aed, #2563eb)",
                boxShadow: loading
                  ? "none"
                  : "0 0 30px #7c3aed66, 0 4px 20px #00000066",
              }}
              onMouseEnter={(e) => {
                if (!loading)
                  e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="wave-bar"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </span>
                  Launching event...
                </span>
              ) : (
                "🚀 Launch Event"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6 font-mono">
          Real-time · Shareable · AI-powered
        </p>
      </div>
    </div>
  );
}
