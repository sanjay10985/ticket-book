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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm text-center animate-pop-in"
        style={{
          background: "linear-gradient(160deg, #1a0a2e, #0d1117)",
          border: "1px solid rgba(167,139,250,0.4)",
          borderRadius: "24px",
          padding: "32px 24px",
          boxShadow: "0 0 60px #7c3aed44, 0 20px 60px #00000088",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Seat badge */}
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 font-bold text-2xl font-mono"
          style={{
            background: "linear-gradient(135deg, #059669, #34d399)",
            boxShadow: "0 0 30px #059669aa",
          }}
        >
          {seatId}
        </div>

        <h2 className="text-2xl font-bold text-white mb-1">Seat {seatId}</h2>
        <p className="text-slate-400 text-sm mb-6">{eventName}</p>

        {/* QR */}
        <div className="flex justify-center mb-3">
          <div
            className="p-3 rounded-2xl"
            style={{ background: "white", boxShadow: "0 0 30px #a78bfa66" }}
          >
            <QRCodeSVG value={seatUrl} size={148} />
          </div>
        </div>
        <p className="text-slate-500 text-xs mb-6 font-mono">
          Scan QR to instantly book · or confirm below
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-medium transition-all duration-150 hover:scale-105"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#94a3b8",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl font-bold text-white transition-all duration-150 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #059669, #34d399)",
              boxShadow: "0 0 20px #05966966",
            }}
          >
            ✓ Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
