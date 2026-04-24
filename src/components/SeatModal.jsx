import { QRCodeSVG } from "qrcode.react";

export default function SeatModal({
  seatId,
  eventId,
  eventName,
  onConfirm,
  onClose,
}) {
  const seatUrl = `${window.location.origin}/book/${eventId}/${seatId}`;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-white mb-1">Seat {seatId}</h2>
        <p className="text-gray-400 text-sm mb-4">{eventName}</p>

        <div className="flex justify-center mb-4">
          <div className="bg-white p-3 rounded-xl">
            <QRCodeSVG value={seatUrl} size={140} />
          </div>
        </div>

        <p className="text-gray-400 text-xs mb-6">
          Scan to instantly book this seat
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-lg transition"
          >
            Confirm Seat
          </button>
        </div>
      </div>
    </div>
  );
}
