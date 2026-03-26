import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import "./courtLivePage.css";
import ModalCourtLive from "./modalCourtLive";

// ===== Mock Data =====
const INITIAL_COURTS = [
  { court_id: 1, court_name: "สนาม 1", size: "40x20m", floor_type: "Vinyl Floor", court_type: "Premium" },
  { court_id: 2, court_name: "สนาม 2", size: "40x20m", floor_type: "Vinyl Floor", court_type: "Standard" },
  { court_id: 3, court_name: "สนาม 3", size: "30x15m", floor_type: "PVC Floor", court_type: "Standard" },
  { court_id: 4, court_name: "สนาม 4", size: "40x20m", floor_type: "Vinyl Floor", court_type: "Premium" },
];

const INITIAL_BOOKINGS = [
  { id: 1, court_id: 1, start: "08:00", end: "10:00", user: "สมชาย", status: "booked" },
  { id: 2, court_id: 1, start: "13:00", end: "14:00", user: "สุดา", status: "booked" },
  { id: 3, court_id: 1, start: "16:00", end: "18:00", user: "วิชัย", status: "in-use" },
  { id: 4, court_id: 2, start: "09:00", end: "11:00", user: "อนันต์", status: "booked" },
  { id: 5, court_id: 2, start: "11:00", end: "12:00", user: "พิมพ์", status: "in-use" },
  { id: 6, court_id: 2, start: "15:00", end: "17:00", user: "จิรา", status: "booked" },
  { id: 7, court_id: 3, start: "09:00", end: "11:00", user: "กมล", status: "in-use" },
  { id: 8, court_id: 3, start: "14:00", end: "16:00", user: "ดารา", status: "booked" },
  { id: 9, court_id: 4, start: "08:00", end: "10:00", user: "บุญมา", status: "booked" },
  { id: 10, court_id: 4, start: "10:00", end: "12:00", user: "ณัฐ", status: "in-use" },
  { id: 11, court_id: 4, start: "17:00", end: "18:00", user: "ภาคิน", status: "booked" },
];

const START_HOUR = 8;
const END_HOUR = 24;
const TOTAL_HOURS = END_HOUR - START_HOUR;

const TIME_LABELS = Array.from({ length: TOTAL_HOURS }, (_, i) =>
  `${String(START_HOUR + i).padStart(2, "0")}:00`
);

const BRANCHES = [
  { id: 1, name: "สาขา เซ็นทรัล ลาดพร้าว" },
  { id: 2, name: "สาขา สยามพารากอน" },
  { id: 3, name: "สาขา เมกาบางนา" },
];

// ===== Helpers =====
function getThaiDay(dateStr) {
  const days = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
  return `วัน${days[new Date(dateStr).getDay()]}`;
}

function formatThaiDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("th-TH", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function timeToHour(time) {
  return parseInt(time.split(":")[0]);
}

function buildCellMap(courtId, bookings) {
  const cells = [];
  const hourMap = {};
  const courtBookings = bookings.filter((b) => b.court_id === courtId);

  courtBookings.forEach((b) => {
    const startH = timeToHour(b.start);
    const endH = timeToHour(b.end);
    for (let h = startH; h < endH; h++) {
      hourMap[h] = b;
    }
  });

  let h = START_HOUR;
  while (h < END_HOUR) {
    const booking = hourMap[h];
    if (booking) {
      const startH = timeToHour(booking.start);
      const endH = timeToHour(booking.end);
      if (h === startH) {
        cells.push({ hour: h, status: booking.status, booking, isStart: true, colspan: endH - startH });
        h = endH;
      } else {
        h++;
      }
    } else {
      cells.push({ hour: h, status: "free", booking: null, isStart: false, colspan: 1 });
      h++;
    }
  }
  return cells;
}

// ===== Sub-Components =====
function StatCard({ icon, value, label, iconClass }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${iconClass}`}>{icon}</div>
      <div className="stat-info">
        <h4>{value}</h4>
        <p>{label}</p>
      </div>
    </div>
  );
}

// ===== Main =====
export default function CourtLivePage() {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedBranch, setSelectedBranch] = useState(1);
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);

  // Current time for the red line
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeLineLeft, setTimeLineLeft] = useState(null);
  const tableRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const currentHour = currentTime.getHours();
  const currentMin = currentTime.getMinutes();
  const showTimeLine = currentHour >= START_HOUR && currentHour < END_HOUR;

  // Measure time line position from actual table DOM
  const measureTimeLine = useCallback(() => {
    if (!tableRef.current || !showTimeLine) return;
    const ths = tableRef.current.querySelectorAll("thead th");
    // ths[0] = corner, ths[1..N] = time columns
    const colIndex = currentHour - START_HOUR;
    const th = ths[colIndex + 1]; // +1 for corner
    if (!th) return;
    const tableRect = tableRef.current.getBoundingClientRect();
    const thRect = th.getBoundingClientRect();
    const left = (thRect.left - tableRect.left) + (currentMin / 60) * thRect.width;
    setTimeLineLeft(left);
  }, [currentHour, currentMin, showTimeLine]);

  useEffect(() => {
    measureTimeLine();
    window.addEventListener("resize", measureTimeLine);
    return () => window.removeEventListener("resize", measureTimeLine);
  }, [measureTimeLine]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" | "edit"
  const [modalBooking, setModalBooking] = useState(null);
  const [modalCourt, setModalCourt] = useState(null);
  const [modalSlotHour, setModalSlotHour] = useState(null);

  // Click on free slot → create
  const handleClickFreeSlot = (court, hour) => {
    setModalMode("create");
    setModalBooking(null);
    setModalCourt(court);
    setModalSlotHour(hour);
    setModalOpen(true);
  };

  // Click on booking → edit
  const handleClickBooking = (booking, court) => {
    setModalMode("edit");
    setModalBooking(booking);
    setModalCourt(court);
    setModalSlotHour(null);
    setModalOpen(true);
  };

  // Save handler
  const handleSaveBooking = (data) => {
    if (modalMode === "create") {
      setBookings((prev) => [...prev, data]);
    } else {
      setBookings((prev) => prev.map((b) => (b.id === data.id ? data : b)));
    }
  };

  // Delete handler
  const handleDeleteBooking = (id) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
  };

  // Stats
  const stats = useMemo(() => {
    const total = INITIAL_COURTS.length;
    const inUse = new Set(bookings.filter((b) => b.status === "in-use").map((b) => b.court_id)).size;
    const booked = new Set(bookings.filter((b) => b.status === "booked").map((b) => b.court_id)).size;
    return { total, inUse, booked, free: Math.max(0, total - inUse) };
  }, [bookings]);

  return (
    <div className="court-live-container">
      {/* Header */}
      <div className="court-live-header">
        <h1>📋 ดูสนามสด (Court Live)</h1>
        <p>ตรวจสอบสถานะการใช้งานสนามแบบเรียลไทม์ และจัดการตารางการจอง</p>
      </div>

      {/* Stats */}
      <div className="court-live-stats">
        <StatCard icon="🏟️" value={stats.total} label="สนามทั้งหมด" iconClass="total" />
        <StatCard icon="✅" value={stats.free} label="สนามว่าง" iconClass="available" />
        <StatCard icon="📝" value={stats.booked} label="จองแล้ว" iconClass="booked-icon" />
        <StatCard icon="🏸" value={stats.inUse} label="กำลังใช้งาน" iconClass="in-use-icon" />
      </div>

      {/* Controls */}
      <div className="court-live-controls">
        <div className="date-picker-wrapper">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        <select
          className="branch-select"
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(Number(e.target.value))}
        >
          {BRANCHES.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        <div className="live-indicator">
          <span className="live-dot"></span>
          Live — {String(currentHour).padStart(2, "0")}:{String(currentMin).padStart(2, "0")}
        </div>
      </div>

      {/* Schedule Card */}
      <div className="date-section">
        <div className="date-section-header">
          <div className="day-info">
            <h3>{getThaiDay(selectedDate)}</h3>
            <span>{formatThaiDate(selectedDate)}</span>
          </div>
          <div className="court-count">{INITIAL_COURTS.length} สนาม</div>
        </div>

        {/* Table */}
        <div className="schedule-table-wrapper">
          <div className="schedule-table-container">
            <table className="schedule-table" ref={tableRef}>
              <thead>
                <tr>
                  <th className="table-corner">สนาม / เวลา</th>
                  {TIME_LABELS.map((t, i) => {
                    const hour = START_HOUR + i;
                    return (
                      <th
                        key={t}
                        className={`table-time-header ${hour === currentHour ? "current-hour" : ""}`}
                      >
                        {t}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {INITIAL_COURTS.map((court) => {
                  const cells = buildCellMap(court.court_id, bookings);
                  return (
                    <tr key={court.court_id} className="court-table-row">
                      <td className="court-info-cell">
                        <span className="court-name">{court.court_name}</span>
                        <span className="court-detail">
                          {court.size} · {court.floor_type}
                        </span>
                        <span className={`court-type-badge ${court.court_type.toLowerCase()}`}>
                          {court.court_type}
                        </span>
                      </td>
                      {cells.map((cell, idx) => {
                        if (cell.status === "free") {
                          return (
                            <td key={idx} className="slot-cell slot-free" colSpan={cell.colspan}>
                              <div
                                className="slot-inner free"
                                onClick={() => handleClickFreeSlot(court, cell.hour)}
                                title={`คลิกเพื่อจอง ${String(cell.hour).padStart(2, "0")}:00`}
                              >
                                <span className="free-plus">+</span>
                              </div>
                            </td>
                          );
                        }
                        return (
                          <td key={idx} className="slot-cell" colSpan={cell.colspan}>
                            <div
                              className={`slot-inner ${cell.status}`}
                              onClick={() => handleClickBooking(cell.booking, court)}
                              title="คลิกเพื่อแก้ไข"
                            >
                              <span className="slot-time">{cell.booking.start} - {cell.booking.end}</span>
                              <span className="slot-user">{cell.booking.user}</span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Current Time Line (absolute overlay) */}
            {showTimeLine && timeLineLeft !== null && (
              <div
                className="current-time-line"
                style={{ left: `${timeLineLeft}px` }}
              >
                <span className="current-time-label">
                  {String(currentHour).padStart(2, "0")}:{String(currentMin).padStart(2, "0")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="schedule-legend">
          <div className="legend-item">
            <span className="legend-color free"></span>
            ว่าง (Free)
          </div>
          <div className="legend-item">
            <span className="legend-color booked"></span>
            จองแล้ว (Booked)
          </div>
          <div className="legend-item">
            <span className="legend-color in-use"></span>
            กำลังใช้งาน (In Use)
          </div>
        </div>
      </div>

      {/* Modal */}
      <ModalCourtLive
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        booking={modalBooking}
        court={modalCourt}
        slotHour={modalSlotHour}
        allCourts={INITIAL_COURTS}
        allBookings={bookings}
        onSave={handleSaveBooking}
        onDelete={handleDeleteBooking}
      />
    </div>
  );
}
