import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const STATUS = {
  LOADING: "loading",
  SUCCESS: "success",
  TAKEN: "taken",
  ERROR: "error",
};

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
      } catch (err) {
        setStatus(STATUS.ERROR);
      }
    }
    book();
  }, [eventId, seatId]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-sm text-center shadow-xl">
        {status === STATUS.LOADING && (
          <>
            <div className="text-4xl mb-4 animate-pulse">🎟️</div>
            <p className="text-gray-400">Booking your seat...</p>
          </>
        )}

        {status === STATUS.SUCCESS && (
          <>
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Seat {seatId} is yours!
            </h1>
            <p className="text-gray-400 text-sm mb-6">{eventName}</p>
            <button
              onClick={() => navigate(`/event/${eventId}`)}
              className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 rounded-lg transition"
            >
              View Seat Map
            </button>
          </>
        )}

        {status === STATUS.TAKEN && (
          <>
            <div className="text-5xl mb-4">😬</div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Seat {seatId} is taken
            </h1>
            <p className="text-gray-400 text-sm mb-6">
              Someone got there first. Pick another seat.
            </p>
            <button
              onClick={() => navigate(`/event/${eventId}`)}
              className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 rounded-lg transition"
            >
              Browse Available Seats
            </button>
          </>
        )}

        {status === STATUS.ERROR && (
          <>
            <div className="text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Something went wrong
            </h1>
            <p className="text-gray-400 text-sm mb-6">
              Couldn't load this event. Check the link and try again.
            </p>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition"
            >
              Go Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}
