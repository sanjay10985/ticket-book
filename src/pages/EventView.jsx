import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import SeatGrid from "../components/SeatGrid";
import SeatModal from "../components/SeatModal";
import AIRecommend from "../components/AIRecommend";
import Stars from "../components/Stars";

export default function EventView() {
  const { eventId } = useParams();
  const [searchParams] = useSearchParams();
  const isAdmin = searchParams.get("admin") === "true";

  const [event, setEvent] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [showAI, setShowAI] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lastTaken, setLastTaken] = useState(null);
  const prevSeats = useRef({});

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "events", eventId), (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      const prev = prevSeats.current;
      for (const [k, v] of Object.entries(data.seats || {})) {
        if (prev[k] === true && v === false) {
          setLastTaken(k);
          break;
        }
      }
      prevSeats.current = data.seats || {};
      setEvent({ id: snap.id, ...data });
    });
    return unsub;
  }, [eventId]);

  async function takeSeat(seatId) {
    await updateDoc(doc(db, "events", eventId), { [`seats.${seatId}`]: false });
  }
  async function resetSeat(seatId) {
    await updateDoc(doc(db, "events", eventId), { [`seats.${seatId}`]: true });
  }
  async function resetAll() {
    const allTrue = Object.fromEntries(
      Object.keys(event.seats).map((k) => [k, true]),
    );
    await updateDoc(doc(db, "events", eventId), { seats: allTrue });
  }

  function handleSeatClick(seatId) {
    if (!event) return;
    if (event.seats[seatId] === true) setSelectedSeat(seatId);
    else if (isAdmin) resetSeat(seatId);
  }

  function shareLink() {
    navigator.clipboard.writeText(`${window.location.origin}/event/${eventId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!event) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, #1e0a3c 0%, #080b14 60%)",
        }}
      >
        <Stars />
        <div className="relative z-10 text-center">
          <div className="flex gap-1.5 justify-center mb-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="wave-bar"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <p className="text-slate-400 font-mono text-sm">Loading event...</p>
        </div>
      </div>
    );
  }

  const seats = event.seats || {};
  const total = event.totalSeats;
  const taken = Object.values(seats).filter((v) => v === false).length;
  const available = total - taken;
  const pct = Math.round((taken / total) * 100);
  const urgency = pct >= 80 ? "#f87171" : pct >= 50 ? "#fbbf24" : "#34d399";

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, #1e0a3c 0%, #080b14 70%)",
      }}
    >
      <Stars />

      {/* Ticker */}
      <div
        className="relative z-10 ticker-wrap py-1.5 text-xs font-mono"
        style={{
          background: "rgba(124,58,237,0.15)",
          borderBottom: "1px solid rgba(124,58,237,0.2)",
        }}
      >
        <div className="ticker-inner text-violet-400 opacity-60">
          {Array(6)
            .fill(
              `🎟 ${event.name} · ${available} seats left · Live updates · `,
            )
            .join("")}
        </div>
      </div>

      {/* Header */}
      <div
        className="relative z-10 px-4 pt-4 pb-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">{event.name}</h1>
              <p className="text-slate-500 text-xs font-mono mt-0.5">
                {isAdmin ? "👑 Admin Mode" : "🎫 Attendee View"}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {isAdmin && (
                <button
                  onClick={resetAll}
                  className="text-sm px-3 py-2 rounded-xl font-medium transition-all duration-150 hover:scale-105"
                  style={{
                    background: "rgba(239,68,68,0.15)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    color: "#f87171",
                  }}
                >
                  ↺ Reset All
                </button>
              )}
              <button
                onClick={shareLink}
                className="text-sm px-4 py-2 rounded-xl font-semibold transition-all duration-150 hover:scale-105"
                style={{
                  background: copied
                    ? "rgba(52,211,153,0.2)"
                    : "linear-gradient(135deg,#7c3aed,#2563eb)",
                  border: copied ? "1px solid rgba(52,211,153,0.4)" : "none",
                  color: copied ? "#34d399" : "white",
                  boxShadow: copied ? "none" : "0 0 20px #7c3aed44",
                }}
              >
                {copied ? "✓ Copied!" : "🔗 Share"}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "Total", value: total, color: "#a78bfa" },
              { label: "Taken", value: taken, color: "#f87171" },
              { label: "Free", value: available, color: "#34d399" },
            ].map((s) => (
              <div
                key={s.label}
                className="glass rounded-xl py-2.5 px-3 text-center"
              >
                <div
                  className="text-xl font-bold font-mono"
                  style={{
                    color: s.color,
                    textShadow: `0 0 12px ${s.color}88`,
                  }}
                >
                  {s.value}
                </div>
                <div className="text-xs text-slate-500 uppercase tracking-widest font-mono">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-500">Occupancy</span>
              <span style={{ color: urgency }}>{pct}% full</span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <div
                className="h-full rounded-full progress-bar-fill"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-3 text-xs text-slate-500 font-mono">
            <span className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-sm inline-block"
                style={{ background: "#34d399", boxShadow: "0 0 6px #059669" }}
              />
              Available
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-sm inline-block"
                style={{ background: "#ef4444", boxShadow: "0 0 6px #dc2626" }}
              />
              Occupied
            </span>
            {isAdmin && (
              <span style={{ color: "#a78bfa" }}>· tap red to free</span>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="relative z-10 max-w-3xl mx-auto">
        <SeatGrid
          seats={seats}
          totalSeats={total}
          onSeatClick={handleSeatClick}
          isAdmin={isAdmin}
          lastTaken={lastTaken}
        />
      </div>

      {/* AI FAB */}
      <button
        onClick={() => setShowAI(true)}
        className="fixed bottom-6 right-6 z-20 font-bold text-white px-5 py-3.5 rounded-2xl flex items-center gap-2"
        style={{
          background: "linear-gradient(135deg, #7c3aed, #2563eb)",
          boxShadow: "0 0 30px #7c3aed88, 0 8px 24px #00000066",
          animation: "float 3s ease-in-out infinite",
        }}
      >
        ✦ Find me a seat
      </button>

      {selectedSeat && (
        <SeatModal
          seatId={selectedSeat}
          eventId={eventId}
          eventName={event.name}
          onConfirm={() => {
            takeSeat(selectedSeat);
            setSelectedSeat(null);
          }}
          onClose={() => setSelectedSeat(null)}
        />
      )}

      {showAI && (
        <AIRecommend
          event={event}
          onTakeSeat={(seatId) => {
            takeSeat(seatId);
            setShowAI(false);
          }}
          onClose={() => setShowAI(false)}
        />
      )}
    </div>
  );
}
