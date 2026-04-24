import { BrowserRouter, Routes, Route } from "react-router-dom";
import Setup from "./pages/Setup";
import EventView from "./pages/EventView";
import BookSeat from "./pages/BookSeat";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Setup />} />
        <Route path="/event/:eventId" element={<EventView />} />
        <Route path="/book/:eventId/:seatId" element={<BookSeat />} />
      </Routes>
    </BrowserRouter>
  );
}
