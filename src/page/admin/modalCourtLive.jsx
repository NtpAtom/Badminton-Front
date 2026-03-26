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

const START_HOUR = 8;
const END_HOUR = 24;

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
 * Modal สำหรับจัดการ booking
 * 
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - mode: "create" | "edit"
 *  - booking: existing booking object (for edit mode)
 *  - court: court object for the clicked slot
 *  - slotHour: the clicked hour (for create mode)
 *  - allCourts: array of all courts
 *  - allBookings: array of all bookings
 *  - onSave: (bookingData) => void
 *  - onDelete: (bookingId) => void
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
  onSave,
  onDelete,
}) {
  const isEdit = mode === "edit";

  // Form state
  const [startHour, setStartHour] = useState(
    isEdit ? parseInt(booking?.start) : (slotHour ?? START_HOUR)
  );
  const [endHour, setEndHour] = useState(
    isEdit ? parseInt(booking?.end) : ((slotHour ?? START_HOUR) + 1)
  );
  const [selectedCourtId, setSelectedCourtId] = useState(
    isEdit ? booking?.court_id : court?.court_id
  );
  const [userName, setUserName] = useState(isEdit ? booking?.user : "");

  // Reset form when modal opens with new data
  React.useEffect(() => {
    if (open) {
      if (mode === "edit" && booking) {
        setStartHour(parseInt(booking.start));
        setEndHour(parseInt(booking.end));
        setSelectedCourtId(booking.court_id);
        setUserName(booking.user);
      } else {
        setStartHour(slotHour ?? START_HOUR);
        setEndHour((slotHour ?? START_HOUR) + 1);
        setSelectedCourtId(court?.court_id);
        setUserName("");
      }
    }
  }, [open, mode, booking, slotHour, court]);

  // Find available courts for the selected time range
  const availableCourts = useMemo(() => {
    if (!allCourts || !allBookings) return [];

    return allCourts.filter((c) => {
      // Check if this court is free in the selected time range
      const courtBookings = allBookings.filter(
        (b) => b.court_id === c.court_id && (isEdit ? b.id !== booking?.id : true)
      );
      const isFree = courtBookings.every((b) => {
        const bStart = parseInt(b.start);
        const bEnd = parseInt(b.end);
        // No overlap
        return endHour <= bStart || startHour >= bEnd;
      });
      return isFree;
    });
  }, [allCourts, allBookings, startHour, endHour, booking, isEdit]);

  // Validate
  const isValid =
    startHour < endHour &&
    selectedCourtId &&
    userName.trim() !== "" &&
    availableCourts.some((c) => c.court_id === selectedCourtId);

  const handleSave = () => {
    if (!isValid) return;
    onSave({
      id: isEdit ? booking.id : Date.now(),
      court_id: selectedCourtId,
      start: hourLabel(startHour),
      end: hourLabel(endHour),
      user: userName.trim(),
      status: isEdit ? booking.status : "booked",
    });
    onClose();
  };

  const handleDelete = () => {
    if (isEdit && booking) {
      onDelete(booking.id);
      onClose();
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
      {/* Header */}
      <DialogTitle
        sx={{
          background: isEdit
            ? "linear-gradient(135deg, #1a237e, #283593)"
            : "linear-gradient(135deg, #059669, #10b981)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: 2,
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

      <DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
        {/* User Name */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, color: "#475569" }}>
            ชื่อผู้จอง
          </Typography>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="กรอกชื่อผู้จอง..."
            style={{
              width: "100%",
              padding: "10px 14px",
              border: "2px solid #e2e8f0",
              borderRadius: "10px",
              fontSize: "0.95rem",
              outline: "none",
              transition: "border-color 0.2s",
              boxSizing: "border-box",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#1a237e")}
            onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
          />
        </Box>

        {/* Time Selection */}
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
                value={startHour}
                label="เริ่ม"
                onChange={(e) => {
                  const val = e.target.value;
                  setStartHour(val);
                  if (val >= endHour) setEndHour(val + 1);
                }}
                sx={{ borderRadius: "10px" }}
              >
                {generateHourOptions(START_HOUR, END_HOUR - 1).map((h) => (
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
                value={endHour}
                label="สิ้นสุด"
                onChange={(e) => setEndHour(e.target.value)}
                sx={{ borderRadius: "10px" }}
              >
                {generateHourOptions(startHour + 1, END_HOUR).map((h) => (
                  <MenuItem key={h} value={h}>
                    {hourLabel(h)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Typography variant="caption" sx={{ color: "#94a3b8", mt: 0.5, display: "block" }}>
            ระยะเวลา: {endHour - startHour} ชั่วโมง
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Court Selection */}
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

      {/* Actions */}
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
