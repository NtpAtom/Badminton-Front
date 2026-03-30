import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  IconButton,
  Chip,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import AddIcon from "@mui/icons-material/Add";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SportsTennisIcon from "@mui/icons-material/SportsTennis";

function hourLabel(h) {
  return `${String(h).padStart(2, "0")}:00`;
}

// Generate hour options
function generateHourOptions(from, to) {
  const opts = [];
  for (let h = from; h <= to; h++) {
    opts.push(h);
  }
  return opts;
}

/**
 * Modal สำหรับจัดการ booking (สร้างใหม่ / แก้ไข / ลบ)
 * 
 * Props:
 *  - open: เปิด/ปิด Modal
 *  - onClose: ฟังก์ชันปิด Modal
 *  - mode: โหมดการทำงาน ("create" สร้างใหม่, "edit" แก้ไข)
 *  - booking: ข้อมูลการจองที่มีอยู่ (สำหรับโหมด edit)
 *  - court: ข้อมูลสนามที่คลิกเลือก (สำหรับโหมด create)
 *  - slotHour: เวลาที่คลิกเลือก (สำหรับโหมด create)
 *  - allCourts: รายชื่อสนามทั้งหมดในสาขา
 *  - allBookings: รายการจองทั้งหมดในวันนั้น (เอาไว้เช็คเวลาซ้อน)
 *  - startHour: เวลาเริ่มเปิดของสาขา
 *  - endHour: เวลาปิดของสาขา
 *  - onSave: ฟังก์ชันส่งข้อมูลการจองกลับไปยังหน้าหลักเพื่อบันทึก
 *  - onDelete: ฟังก์ชันส่ง ID การจองกลับไปเพื่อลบ
 */
export default function ModalCourtLive({
  open,
  onClose,
  mode,
  booking,
  court,
  slotHour,
  allCourts,
  allBookings,
  startHour,
  endHour,
  onSave,
  onDelete,
}) {
  const isEdit = mode === "edit";

  // ค่าขอบเขตเวลาเริ่มต้น/สิ้นสุด (Default ถ้าไม่มีส่งมา)
  const MIN_H = startHour ?? 8;
  const MAX_H = endHour ?? 24;

  // สถานะของฟอร์ม (Form State)
  const [sessionStartHour, setSessionStartHour] = useState(
    isEdit ? parseInt(booking?.start_time) : (slotHour ?? MIN_H)
  );
  const [sessionEndHour, setSessionEndHour] = useState(
    isEdit ? parseInt(booking?.end_time) : ((slotHour ?? MIN_H) + 1)
  );
  const [selectedCourtId, setSelectedCourtId] = useState(
    isEdit ? booking?.court_id : court?.court_id
  );
  const [userName, setUserName] = useState(isEdit ? (booking?.user_name || booking?.user) : "");

  // รีเซ็ตค่าในฟอร์มทุกครั้งที่เปิด Modal ขึ้นมาใหม่
  React.useEffect(() => {
    if (open) {
      if (mode === "edit" && booking) {
        setSessionStartHour(parseInt(booking.start_time));
        setSessionEndHour(parseInt(booking.end_time));
        setSelectedCourtId(booking.court_id);
        setUserName(booking.user_name || booking.user || "");
      } else {
        setSessionStartHour(slotHour ?? MIN_H);
        setSessionEndHour((slotHour ?? MIN_H) + 1);
        setSelectedCourtId(court?.court_id);
        setUserName("");
      }
    }
  }, [open, mode, booking, slotHour, court, MIN_H]);

  // ค้นหาสนามที่ว่าง (Available Courts) ในช่วงเวลาที่เลือก
  const availableCourts = useMemo(() => {
    if (!allCourts || !allBookings) return [];

    return allCourts.filter((c) => {
      // ตรวจสอบว่าสนามนี้มีการจองซ้อนในช่วงเวลาที่เลือกหรือไม่
      const courtBookings = allBookings.filter(
        (b) => b.court_id === c.court_id && (isEdit ? b.booking_id !== booking?.booking_id : true)
      );
      const isFree = courtBookings.every((b) => {
        const bStart = parseInt(b.start_time);
        const bEnd = parseInt(b.end_time);
        // เช็คว่าเวลาไม่ทับซ้อนกัน (Overlap check)
        return sessionEndHour <= bStart || sessionStartHour >= bEnd;
      });
      return isFree;
    });
  }, [allCourts, allBookings, sessionStartHour, sessionEndHour, booking, isEdit]);

  // ตรวจสอบความถูกต้องของข้อมูลก่อนกดบันทึก
  const isValid =
    sessionStartHour < sessionEndHour &&
    selectedCourtId &&
    (isEdit ? true : userName.trim() !== "") &&
    availableCourts.some((c) => c.court_id === selectedCourtId);

  const handleSave = () => {
    if (!isValid) return;
    onSave({
      booking_id: isEdit ? booking.booking_id : null,
      court_id: selectedCourtId,
      start: hourLabel(sessionStartHour),
      end: hourLabel(sessionEndHour),
      user: userName.trim(),
      status: isEdit ? booking.status : "Pending",
    });
    onClose();
  };

  const handleDelete = () => {
    if (isEdit && booking) {
      if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบการจองนี้?")) {
        onDelete(booking.booking_id);
        onClose();
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          overflow: "hidden",
        },
      }}
    >
      {/* ส่วนหัวของ Modal (Header) */}
      <DialogTitle
        sx={{
          background: isEdit
            ? "linear-gradient(135deg, #1a237e, #283593)"
            : "linear-gradient(135deg, #059669, #10b981)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 5
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {isEdit ? <EditIcon /> : <AddIcon />}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
              {isEdit ? "แก้ไขการจอง" : "จองสนาม"}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.85 }}>
              {isEdit
                ? `${booking?.user} — ${booking?.start}-${booking?.end}`
                : `สนาม ${court?.court_name || ""} — ${hourLabel(slotHour ?? 8)}`}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "#fff" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 1, px: 3, mt: 5 }}>


        {/* การเลือกช่วงเวลา (Time Selection) */}
        <Box sx={{ mb: 2.5 }}>
          <Typography
            variant="subtitle2"
            sx={{ mb: 1, fontWeight: 600, color: "#475569", display: "flex", alignItems: "center", gap: 0.5 }}
          >
            <AccessTimeIcon fontSize="small" /> เลือกเวลา (เต็มชั่วโมง)
          </Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel>เริ่ม</InputLabel>
              <Select
                value={sessionStartHour}
                label="เริ่ม"
                onChange={(e) => {
                  const val = e.target.value;
                  setSessionStartHour(val);
                  if (val >= sessionEndHour) setSessionEndHour(val + 1);
                }}
                sx={{ borderRadius: "10px" }}
              >
                {generateHourOptions(MIN_H, MAX_H - 1).map((h) => (
                  <MenuItem key={h} value={h}>
                    {hourLabel(h)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography sx={{ fontWeight: 700, color: "#94a3b8" }}>ถึง</Typography>

            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel>สิ้นสุด</InputLabel>
              <Select
                value={sessionEndHour}
                label="สิ้นสุด"
                onChange={(e) => setSessionEndHour(e.target.value)}
                sx={{ borderRadius: "10px" }}
              >
                {generateHourOptions(sessionStartHour + 1, MAX_H).map((h) => (
                  <MenuItem key={h} value={h}>
                    {hourLabel(h)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Typography variant="caption" sx={{ color: "#94a3b8", mt: 0.5, display: "block" }}>
            ระยะเวลา: {sessionEndHour - sessionStartHour} ชั่วโมง
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* การเลือกสนาม (Court Selection) */}
        <Box sx={{ mb: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{ mb: 1, fontWeight: 600, color: "#475569", display: "flex", alignItems: "center", gap: 0.5 }}
          >
            <SportsTennisIcon fontSize="small" /> เลือกสนาม (สนามว่างในเวลาที่เลือก)
          </Typography>

          {availableCourts.length === 0 ? (
            <Box
              sx={{
                p: 2,
                textAlign: "center",
                color: "#ef4444",
                background: "#fef2f2",
                borderRadius: "10px",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              ❌ ไม่มีสนามว่างในช่วงเวลานี้
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {availableCourts.map((c) => {
                const isSelected = c.court_id === selectedCourtId;
                return (
                  <Box
                    key={c.court_id}
                    onClick={() => setSelectedCourtId(c.court_id)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: "10px 14px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      border: isSelected ? "2px solid #1a237e" : "2px solid #e2e8f0",
                      background: isSelected ? "#eef2ff" : "#fff",
                      transition: "all 0.15s ease",
                      "&:hover": {
                        borderColor: "#94a3b8",
                        background: "#f8fafc",
                      },
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#1e293b" }}>
                        {c.court_name}
                      </Typography>
                      <Typography sx={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                        {c.size} · {c.floor_type}
                      </Typography>
                    </Box>
                    <Chip
                      label={c.court_type}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.65rem",
                        background:
                          c.court_type === "Premium"
                            ? "linear-gradient(135deg, #fef3c7, #fde68a)"
                            : "#e0f2fe",
                        color: c.court_type === "Premium" ? "#92400e" : "#0369a1",
                      }}
                    />
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </DialogContent>

      {/* ปุ่มจัดการต่างๆ (Actions) */}
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        {isEdit && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            sx={{
              mr: "auto",
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            ลบการจอง
          </Button>
        )}
        <Button
          onClick={onClose}
          sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 600, color: "#64748b" }}
        >
          ยกเลิก
        </Button>
        <Button
          variant="contained"
          disabled={!isValid}
          onClick={handleSave}
          startIcon={isEdit ? <SwapHorizIcon /> : <AddIcon />}
          sx={{
            borderRadius: "10px",
            textTransform: "none",
            fontWeight: 600,
            background: isEdit ? "#1a237e" : "#059669",
            px: 3,
            "&:hover": {
              background: isEdit ? "#283593" : "#047857",
            },
          }}
        >
          {isEdit ? "บันทึกการแก้ไข" : "จองเลย"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
