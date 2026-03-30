import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import "./courtLivePage.css";
import ModalCourtLive from "../modalCourtLive";
import axios from "axios";
import { useLogin } from "../../../store/loginStore";

const API_BASE = "http://localhost:3000/api";

const START_HOUR = 8; // เวลาเริ่มให้บริการ (8 โมงเช้า)
const END_HOUR = 24;   // เวลาปิดให้บริการ (เที่ยงคืน)
const TOTAL_HOURS = END_HOUR - START_HOUR; // จำนวนชั่วโมงทั้งหมดใน 1 วันที่เปิด

const TIME_LABELS = Array.from({ length: TOTAL_HOURS }, (_, i) =>
  `${String(START_HOUR + i).padStart(2, "0")}:00`
);

// ===== Helpers =====
// ฟังก์ชันสำหรับแปลงวันที่เป็นชื่อวันภาษาไทย (เช่น วันจันทร์)
function getThaiDay(dateStr) {
  const days = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
  return `วัน${days[new Date(dateStr).getDay()]}`;
}

// ฟังก์ชันสำหรับฟอร์แมตวันที่เป็นรูปแบบไทย (วว/ดด/ปปปป)
function formatThaiDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("th-TH", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// ฟังก์ชันสำหรับดึงชั่วโมงจากสตริงเวลา (เช่น "10:00" -> 10)
function timeToHour(time) {
  if (!time) return 0;
  return parseInt(time.split(":")[0]);
}

// ฟังก์ชันหลักที่ใช้สร้างข้อมูลสำหรับแต่ละช่องในตาราง (Time Slot)
function buildCellMap(courtId, bookings, currentHour) {
  const cells = [];
  const hourMap = {};
  const courtBookings = bookings.filter((b) => b.court_id === courtId);

  courtBookings.forEach((b) => {
    const startH = timeToHour(b.start_time);
    const endH = timeToHour(b.end_time);
    for (let h = startH; h < endH; h++) {
      hourMap[h] = b;
    }
  });

  let h = START_HOUR;
  while (h < END_HOUR) {
    const booking = hourMap[h];
    if (booking) {
      const startH = timeToHour(booking.start_time);
      const endH = timeToHour(booking.end_time);
      if (h === startH) {
        // กำลังใช้งาน (In Use) logic: if currentHour is within booking range
        const isInUse = currentHour >= startH && currentHour < endH;
        cells.push({
          hour: h,
          status: isInUse ? "in-use" : "booked",
          booking,
          isStart: true,
          colspan: endH - startH
        });
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
  const user = useLogin((state) => state.user);
  const token = useLogin((state) => state.token);
  const isAdmin = user?.user_role === "admin";
  const isSuper = user?.user_role === "super";

  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today); // วันที่ที่เลือกดู (เริ่มต้นเป็นวันนี้)
  const [selectedBranch, setSelectedBranch] = useState(isAdmin ? user.branch_id : ""); // สาขาที่เลือกดู
  const [branches, setBranches] = useState([]); // รายชื่อสาขาทั้งหมด
  const [courts, setCourts] = useState([]);     // รายชื่อสนามในสาขานั้นๆ
  const [bookings, setBookings] = useState([]);  // รายการจองทั้งหมดของวันที่เลือก

  // สำหรับแสดงเส้นสีแดงบอกเวลาปัจจุบัน
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeLineLeft, setTimeLineLeft] = useState(null);
  const tableRef = useRef(null);

  // ดึงข้อมูลสาขาทั้งหมดเมื่อโหลดหน้าเว็บ
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await axios.get(`${API_BASE}/branch`);
        setBranches(res.data.data);
        if (!selectedBranch && res.data.data.length > 0) {
          if (isAdmin) {
            setSelectedBranch(user.branch_id);
          } else {
            setSelectedBranch(res.data.data[0].branch_id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch branches", err);
      }
    };
    fetchBranches();
  }, [isAdmin, user?.branch_id]);

  // ฟังก์ชันสำหรับดึงข้อมูลสนามและการจองจาก Backend
  const fetchData = useCallback(async () => {
    if (!selectedBranch) return;
    try {
      const [courtsRes, bookingsRes] = await Promise.all([
        axios.get(`${API_BASE}/court?branch_id=${selectedBranch}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE}/booking/all?branch_id=${selectedBranch}&booking_date=${selectedDate}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setCourts(courtsRes.data.data);
      setBookings(bookingsRes.data.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  }, [selectedBranch, selectedDate, token]);

  // เรียกใช้ fetchData เมื่อมีการเปลี่ยนสาขาหรือวันที่ และตั้ง Auto-refresh ทุก 30 วินาที
  useEffect(() => {
    fetchData();
    const refreshTimer = setInterval(() => {
      fetchData();
    }, 30000);
    return () => clearInterval(refreshTimer);
  }, [fetchData]);

  // อัปเดตเวลาปัจจุบันทุกนาที เพื่อเลื่อนเส้นสีแดง
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const currentHour = currentTime.getHours();
  const currentMin = currentTime.getMinutes();
  const showTimeLine = currentHour >= START_HOUR && currentHour < END_HOUR;

  // คำนวณตำแหน่งของเส้นสีแดงบอกเวลาปัจจุบันบนตาราง
  const measureTimeLine = useCallback(() => {
    if (!tableRef.current || !showTimeLine) return;
    const ths = tableRef.current.querySelectorAll("thead th");
    const colIndex = currentHour - START_HOUR;
    const th = ths[colIndex + 1];
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

  // สถานะสำหรับเปิด/ปิด และส่งค่าไปยัง Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [modalBooking, setModalBooking] = useState(null);
  const [modalCourt, setModalCourt] = useState(null);
  const [modalSlotHour, setModalSlotHour] = useState(null);

  // เมื่อคลิกที่ช่องว่าง เพื่อสร้างการจองใหม่
  const handleClickFreeSlot = (court, hour) => {
    setModalMode("create");
    setModalBooking(null);
    setModalCourt(court);
    setModalSlotHour(hour);
    setModalOpen(true);
  };

  // เมื่อคลิกที่รายการจองที่มีอยู่แล้ว เพื่อแก้ไขหรือดูรายละเอียด
  const handleClickBooking = (booking, court) => {
    setModalMode("edit");
    setModalBooking(booking);
    setModalCourt(court);
    setModalSlotHour(null);
    setModalOpen(true);
  };

  // ส่วนของการบันทึกข้อมูลการจอง (ทั้งสร้างใหม่และแก้ไข)
  const handleSaveBooking = async (data) => {
    try {
      if (modalMode === "create") {
        await axios.post(`${API_BASE}/booking/add`, {
          court_id: data.court_id,
          booking_date: selectedDate,
          start_time: data.start,
          end_time: data.end,
          status: "Pending"
        }, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.put(`${API_BASE}/booking/update/${data.booking_id}`, {
          court_id: data.court_id,
          booking_date: selectedDate,
          start_time: data.start,
          end_time: data.end,
          status: data.status
        }, { headers: { Authorization: `Bearer ${token}` } });
      }
      fetchData(); // ดึงข้อมูลใหม่หลังบันทึกสำเร็จ
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save booking");
    }
  };

  // ส่วนของการลบการจอง
  const handleDeleteBooking = async (id) => {
    try {
      await axios.delete(`${API_BASE}/booking/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData(); // ดึงข้อมูลใหม่หลังลบสำเร็จ
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete booking");
    }
  };

  // สรุปสถิติสำหรับแสดงใน Stat Cards (ใช้ useMemo เพื่อความรวดเร็ว)
  const stats = useMemo(() => {
    const total = courts.length;

    // จองแล้ว (Booked): นับการจองทั้งหมดของทั้งวัน (ที่ไม่รวม Cancelled ซึ่งถูกกรองจาก Backend แล้ว)
    const bookedCount = bookings.length;

    // กำลังใช้งาน (In Use): นับสนามที่มีการจองอยู่ในช่วงเวลาปัจจุบัน (Red Line)
    const inUseCourts = new Set();
    bookings.forEach(b => {
      const startH = timeToHour(b.start_time);
      const endH = timeToHour(b.end_time);
      if (currentHour >= startH && currentHour < endH) {
        inUseCourts.add(b.court_id);
      }
    });
    const inUseCount = inUseCourts.size;

    // สนามว่าง (Available): จำนวนสนามทั้งหมด - จำนวนสนามที่กำลังใช้งานอยู่ ณ ตอนนี้
    const availableCount = Math.max(0, total - inUseCount);

    return {
      total,
      available: availableCount,
      booked: bookedCount,
      inUse: inUseCount,
    };
  }, [courts, bookings, currentHour]);

  return (
    <div className="court-live-container">
      {/* ส่วนหัวของหน้า (Header) */}
      <div className="court-live-header">
        <h1>📋 ดูสนามสด (Court Live)</h1>
        <p>ตรวจสอบสถานะการใช้งานสนามแบบเรียลไทม์ และจัดการตารางการจอง</p>
      </div>

      {/* สรุปตัวเลขสถิติ (Stats Cards) */}
      <div className="court-live-stats">
        <StatCard icon="🏟️" value={stats.total} label="สนามทั้งหมด" iconClass="total" />
        <StatCard icon="✅" value={stats.available} label="สนามว่าง" iconClass="available" />
        <StatCard icon="📝" value={stats.booked} label="จองแล้ว" iconClass="booked-icon" />
        <StatCard icon="🏸" value={stats.inUse} label="กำลังใช้งาน" iconClass="in-use-icon" />
      </div>

      {/* ส่วนควบคุม (Controls): เลือกวันที่, เลือกสาขา, และแสดงเวลาปัจจุบัน */}
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
          onChange={(e) => setSelectedBranch(e.target.value)}
          disabled={isAdmin && !isSuper}
        >
          {branches.map((b) => (
            <option key={b.branch_id} value={b.branch_id}>{b.branch_name}</option>
          ))}
        </select>
        <div className="live-indicator">
          <span className="live-dot"></span>
          Live — {String(currentHour).padStart(2, "0")}:{String(currentMin).padStart(2, "0")}
        </div>
      </div>

      {/* ส่วนแสดงตารางเวลาการจอง (Schedule Table) */}
      <div className="date-section">
        <div className="date-section-header">
          <div className="day-info">
            <h3>{getThaiDay(selectedDate)}</h3>
            <span>{formatThaiDate(selectedDate)}</span>
          </div>
          <div className="court-count">{courts.length} สนาม</div>
        </div>

        {/* ตัวตารางเวลา (Table Content) */}
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
                {courts.map((court) => {
                  const cells = buildCellMap(court.court_id, bookings, currentHour);
                  return (
                    <tr key={court.court_id} className="court-table-row">
                      <td className="court-info-cell">
                        <span className="court-name">{court.court_name}</span>
                        <span className="court-detail">
                          {court.price_per_hour} บาท/ชม.
                        </span>
                        <span className={`court-type-badge ${court.status}`}>
                          {court.status}
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
                              <span className="slot-time">{cell.booking.start_time.substring(0, 5)} - {cell.booking.end_time.substring(0, 5)}</span>
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

            {/* เส้นสีแดงบอกเวลาปัจจุบัน (Current Time Line) จะเลื่อนตามเวลาจริง */}
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

        {/* คำอธิบายความหมายของสี (Legend) */}
        <div className="schedule-legend">
          <div className="legend-item">
            <span className="legend-color free"></span>
            ว่าง (Free)
          </div>
          <div className="legend-item">
            <span className="legend-color booked"></span>
            จอง (Booked)
          </div>
          <div className="legend-item">
            <span className="legend-color in-use"></span>
            กำลังใช้งาน (In Use)
          </div>
        </div>
      </div>

      {/* โมดอลสำหรับจัดการการจอง (Modal) */}
      {modalOpen && (
        <ModalCourtLive
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          mode={modalMode}
          booking={modalBooking}
          court={modalCourt}
          slotHour={modalSlotHour}
          allCourts={courts}
          allBookings={bookings}
          onSave={handleSaveBooking}
          onDelete={handleDeleteBooking}
        />
      )}
    </div>
  );
}
