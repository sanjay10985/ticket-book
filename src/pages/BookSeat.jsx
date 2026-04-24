import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import Stars from "../components/Stars";

const STATUS = {
  LOADING: "loading",
  SUCCESS: "success",
  TAKEN: "taken",
  ERROR: "error",
};

const COLORS = [
  "#a78bfa",
  "#34d399",
  "#38bdf8",
  "#fbbf24",
  "#f472b6",
  "#fb923c",
];

function Confetti() {
  const pieces = useRef(
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 6 + Math.random() * 8,
      duration: `${2 + Math.random() * 2}s`,
      delay: `${Math.random() * 1.5}s`,
      rotate: Math.random() > 0.5 ? "rotate(45deg)" : "none",
    })),
  ).current;

  return (
    <>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            background: p.color,
            animationDuration: p.duration,
            animationDelay: p.delay,
            transform: p.rotate,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          }}
        />
      ))}
    </>
  );
}

export default function BookSeat() {
  const { eventId, seatId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState(STATUS.LOADING);
  const [eventName, setEventName] = useState("");

  useEffect(() => {
    async function book() {
      try {
        const ref = doc(db, "events", eventId);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setStatus(STATUS.ERROR);
          return;
        }
        const data = snap.data();
        setEventName(data.name);
        if (data.seats[seatId] === false) {
          setStatus(STATUS.TAKEN);
          return;
        }
        await updateDoc(ref, { [`seats.${seatId}`]: false });
        setStatus(STATUS.SUCCESS);
      } catch {
        setStatus(STATUS.ERROR);
      }
    }
    book();
  }, [eventId, seatId]);

  return (
    <div
      className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, #1e0a3c 0%, #080b14 60%)",
      }}
    >
      <Stars />
      {status === STATUS.SUCCESS && <Confetti />}

      <div className="relative z-10 w-full max-w-sm text-center animate-slide-up">
        <div
          className="glass rounded-3xl p-8"
          style={{
            border: "1px solid rgba(167,139,250,0.2)",
            boxShadow: "0 0 60px #7c3aed22",
          }}
        >
          {status === STATUS.LOADING && (
            <>
              <div className="text-5xl mb-5 animate-float">🎟️</div>
              <h2 className="text-xl font-bold text-white mb-2">
                Reserving your seat...
              </h2>
              <div className="flex gap-1.5 justify-center mt-4">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="wave-bar"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </>
          )}

          {status === STATUS.SUCCESS && (
            <>
              <div className="text-6xl mb-4 animate-bounce-in">🎉</div>
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 font-bold text-2xl font-mono"
                style={{
                  background: "linear-gradient(135deg,#059669,#34d399)",
                  boxShadow: "0 0 30px #059669aa",
                }}
              >
                {seatId}
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">
                Seat {seatId} is yours!
              </h1>
              <p className="text-slate-400 text-sm mb-2">{eventName}</p>
              <p className="text-emerald-400 text-xs font-mono mb-6">
                ✓ Booking confirmed
              </p>
              <button
                onClick={() => navigate(`/event/${eventId}`)}
                className="w-full py-3 rounded-xl font-bold text-white transition-all hover:scale-105"
                style={{
                  background: "linear-gradient(135deg,#7c3aed,#2563eb)",
                  boxShadow: "0 0 20px #7c3aed66",
                }}
              >
                View Seat Map →
              </button>
            </>
          )}

          {status === STATUS.TAKEN && (
            <>
              <div className="text-5xl mb-4 animate-bounce-in">😬</div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Seat {seatId} is taken
              </h1>
              <p className="text-slate-400 text-sm mb-6">
                Someone got there first. Grab another one!
              </p>
              <button
                onClick={() => navigate(`/event/${eventId}`)}
                className="w-full py-3 rounded-xl font-bold text-white transition-all hover:scale-105"
                style={{
                  background: "linear-gradient(135deg,#7c3aed,#2563eb)",
                  boxShadow: "0 0 20px #7c3aed66",
                }}
              >
                Browse Available Seats
              </button>
            </>
          )}

          {status === STATUS.ERROR && (
            <>
              <div className="text-5xl mb-4 animate-bounce-in">⚠️</div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Something went wrong
              </h1>
              <p className="text-slate-400 text-sm mb-6">
                Couldn't load this event.
              </p>
              <button
                onClick={() => navigate("/")}
                className="w-full py-3 rounded-xl font-medium transition-all hover:scale-105"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#94a3b8",
                }}
              >
                Go Home
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
