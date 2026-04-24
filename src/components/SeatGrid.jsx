import { useRef, useEffect, useState } from "react";

export default function SeatGrid({
  seats,
  totalSeats,
  onSeatClick,
  isAdmin,
  lastTaken,
}) {
  const cols = Math.ceil(Math.sqrt(totalSeats));
  const [mounted, setMounted] = useState(false);
  const [animating, setAnimating] = useState(null);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  useEffect(() => {
    if (lastTaken) {
      setAnimating(lastTaken);
      setTimeout(() => setAnimating(null), 500);
    }
  }, [lastTaken]);

  return (
    <div className="p-4 pb-24 overflow-auto">
      <div
        className="grid gap-1.5 mx-auto"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          maxWidth: `${cols * 48}px`,
        }}
      >
        {Array.from({ length: totalSeats }, (_, i) => {
          const id = String(i + 1);
          const available = seats[id] === true;
          const isAnimating = animating === id;

          return (
            <button
              key={id}
              onClick={() => onSeatClick(id)}
              title={`Seat ${id} — ${available ? "Available" : "Occupied"}`}
              className={`
                relative aspect-square rounded-lg text-xs font-bold font-mono
                transition-all duration-150 select-none
                ${available ? "seat-available text-white cursor-pointer" : `seat-occupied text-white ${isAdmin ? "admin cursor-pointer" : "cursor-not-allowed"}`}
                ${isAnimating ? "animate-seat-taken" : ""}
              `}
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "scale(1)" : "scale(0)",
                transition: `opacity 0.3s ease ${i * 8}ms, transform 0.3s cubic-bezier(.34,1.56,.64,1) ${i * 8}ms, box-shadow 0.15s ease, filter 0.15s ease`,
              }}
            >
              {id}
              {/* Shine overlay on available */}
              {available && (
                <span
                  className="absolute inset-0 rounded-lg pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%)",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
