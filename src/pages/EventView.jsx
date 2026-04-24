import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import SeatGrid from "../components/SeatGrid";
import SeatModal from "../components/SeatModal";
import AIRecommend from "../components/AIRecommend";

export default function EventView() {
  const { eventId } = useParams();
  const [searchParams] = useSearchParams();
  const isAdmin = searchParams.get("admin") === "true";

  const [event, setEvent] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [showAI, setShowAI] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "events", eventId), (snap) => {
      if (snap.exists()) setEvent({ id: snap.id, ...snap.data() });
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
    if (event.seats[seatId] === true) {
      setSelectedSeat(seatId);
    } else if (isAdmin) {
      resetSeat(seatId);
    }
  }

  function shareLink() {
    const url = `${window.location.origin}/event/${eventId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">Loading event...</div>
      </div>
    );
  }

  const seats = event.seats || {};
  const total = event.totalSeats;
  const taken = Object.values(seats).filter((v) => v === false).length;
  const available = total - taken;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top bar */}
      <div className="border-b border-gray-800 px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold">{event.name}</h1>
          {isAdmin && (
            <p className="text-sm text-gray-400 mt-0.5">
              {taken} / {total} seats taken · {available} available
            </p>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {isAdmin && (
            <button
              onClick={resetAll}
              className="bg-gray-800 hover:bg-gray-700 text-sm px-3 py-2 rounded-lg transition"
            >
              Reset All
            </button>
          )}
          <button
            onClick={shareLink}
            className="bg-violet-600 hover:bg-violet-500 text-sm px-3 py-2 rounded-lg transition"
          >
            {copied ? "✓ Copied!" : "🔗 Share"}
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 px-4 pt-4 text-sm text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />{" "}
          Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-500 inline-block" />{" "}
          Occupied
        </span>
        {isAdmin && (
          <span className="text-violet-400 text-xs">
            (Admin: click red to reset)
          </span>
        )}
      </div>

      {/* Seat grid */}
      <SeatGrid
        seats={seats}
        totalSeats={total}
        onSeatClick={handleSeatClick}
        isAdmin={isAdmin}
      />

      {/* AI button */}
      <button
        onClick={() => setShowAI(true)}
        className="fixed bottom-6 right-6 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-4 py-3 rounded-full shadow-lg transition flex items-center gap-2"
      >
        ✦ Find me a seat
      </button>

      {/* Modals */}
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
