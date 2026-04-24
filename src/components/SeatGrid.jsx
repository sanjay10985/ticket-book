export default function SeatGrid({ seats, totalSeats, onSeatClick, isAdmin }) {
  const cols = Math.ceil(Math.sqrt(totalSeats));

  return (
    <div className="p-4 overflow-auto">
      <div
        className="grid gap-2 mx-auto"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          maxWidth: `${cols * 52}px`,
        }}
      >
        {Array.from({ length: totalSeats }, (_, i) => {
          const id = String(i + 1);
          const available = seats[id] === true;
          return (
            <button
              key={id}
              onClick={() => onSeatClick(id)}
              title={`Seat ${id} — ${available ? "Available" : "Occupied"}`}
              className={`
                aspect-square rounded-md text-xs font-semibold transition-all
                ${
                  available
                    ? "bg-emerald-500 hover:bg-emerald-400 text-white cursor-pointer"
                    : isAdmin
                      ? "bg-red-500 hover:bg-red-400 text-white cursor-pointer"
                      : "bg-red-500 text-white cursor-not-allowed opacity-70"
                }
              `}
            >
              {id}
            </button>
          );
        })}
      </div>
    </div>
  );
}
