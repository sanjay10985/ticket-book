import { useState } from "react";
import { GoogleGenAI } from "@google/genai";

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

      // Parse "1. Seat X — reason" lines
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
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">✦ AI Seat Finder</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {!recommendations && !loading && (
          <div className="text-center py-4">
            <p className="text-gray-400 mb-6 text-sm">
              {availableSeats.length} seats available. Let AI pick the best ones
              for you.
            </p>
            <button
              onClick={getRecommendations}
              className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-3 rounded-lg transition"
            >
              Get Recommendations
            </button>
          </div>
        )}

        {loading && (
          <div className="text-center py-8 text-gray-400 animate-pulse">
            Thinking...
          </div>
        )}

        {error && (
          <div className="text-red-400 text-sm text-center py-4">
            {error}
            <br />
            <button
              onClick={getRecommendations}
              className="mt-3 text-violet-400 underline"
            >
              Try again
            </button>
          </div>
        )}

        {recommendations && (
          <div className="flex flex-col gap-3">
            {recommendations.map((rec, i) => (
              <div
                key={i}
                className="bg-gray-800 rounded-xl p-4 flex items-center justify-between gap-3"
              >
                <div>
                  <span className="text-violet-400 font-bold text-sm">
                    #{i + 1}
                  </span>
                  {rec.seatId && (
                    <span className="text-white font-semibold ml-2">
                      Seat {rec.seatId}
                    </span>
                  )}
                  <p className="text-gray-400 text-sm mt-0.5">{rec.reason}</p>
                </div>
                {rec.seatId && event.seats[rec.seatId] === true && (
                  <button
                    onClick={() => onTakeSeat(rec.seatId)}
                    className="shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-3 py-2 rounded-lg transition"
                  >
                    Take it
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={getRecommendations}
              className="text-gray-500 hover:text-gray-300 text-sm text-center mt-1 transition"
            >
              Refresh recommendations
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
