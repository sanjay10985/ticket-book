import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

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
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-md shadow-xl">
        <h1 className="text-3xl font-bold text-white mb-2">🎟️ SeatMap</h1>
        <p className="text-gray-400 mb-8">
          Create a live seat map for your event
        </p>
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Event Name
            </label>
            <input
              type="text"
              placeholder="IPL Watch Party"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">
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
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition"
            />
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-3 transition"
          >
            {loading ? "Creating..." : "Create Event →"}
          </button>
        </form>
      </div>
    </div>
  );
}
