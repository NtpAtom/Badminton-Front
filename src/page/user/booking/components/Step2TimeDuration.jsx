import React from "react";
import { TextField, MenuItem, Select } from "@mui/material";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const Step2TimeDuration = ({ startTime, setStartTime, endTime, setEndTime, duration, selectedBranch }) => {
  // 1. เตรียมรายการเวลา (เช่น 08:00, 09:00...) ตามเวลาเปิด-ปิดของสาขา
  const openTimeStr = selectedBranch?.open_time || "08:00:00";
  const closeTimeStr = selectedBranch?.close_time || "22:00:00";

  const openHour = parseInt(openTimeStr.split(":")[0]);
  const closeHour = parseInt(closeTimeStr.split(":")[0]);

  // สร้างรายการเวลาทุกๆ 1 ชั่วโมง
  const timeOptions = [];
  for (let h = openHour; h <= closeHour; h++) {
    const hh = String(h).padStart(2, "0");
    timeOptions.push(`${hh}:00`);
  }

  return (
    <div className="step-card">
      <div className="step-header">
        <AccessTimeIcon fontSize="small" />
        <h2>ขั้นตอนที่ 2: เลือกเวลาที่ต้องการจอง</h2>
      </div>

      <div className="input-row">
        <div className="input-group">
          <label htmlFor="startTime">เวลาเริ่มต้น</label>
          <Select
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            fullWidth
            displayEmpty
            size="small"
            sx={{ borderRadius: "8px", backgroundColor: "#f8fafc" }}
          >
            <MenuItem value="" disabled>เลือกเวลาเริ่ม</MenuItem>
            {timeOptions.slice(0, -1).map((time) => (
              <MenuItem key={time} value={time}>{time}</MenuItem>
            ))}
          </Select>
        </div>

        <div className="input-group">
          <label htmlFor="endTime">เวลาสิ้นสุด</label>
          <Select
            id="endTime"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            fullWidth
            displayEmpty
            size="small"
            sx={{ borderRadius: "8px", backgroundColor: "#f8fafc" }}
          >
            <MenuItem value="" disabled>เลือกเวลาเลิก</MenuItem>
            {timeOptions.map((time) => (
              <MenuItem
                key={time}
                value={time}
                disabled={startTime && time <= startTime}
              >
                {time}
              </MenuItem>
            ))}
          </Select>
        </div>

        <div className="input-group">
          <label htmlFor="duration">ระยะเวลา</label>
          <TextField
            id="duration"
            value={duration > 0 ? `${Math.floor(duration / 60)} ชม. ${duration % 60} นาที` : "- ชม. - นาที"}
            readOnly
            fullWidth
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": { borderRadius: "8px", backgroundColor: "#f0fdfa" },
              "& .MuiInputBase-input": { color: "#0d9488", fontWeight: "600" }
            }}
          />
        </div>
      </div>



      <div className="info-alert">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <InfoOutlinedIcon fontSize="small" />
          <span>
            คำแนะนำ: จองได้ขั้นต่ำ 1 ชม. โดยระบบจะแสดงเฉพาะสนามที่ว่างตามช่วงเวลาที่เลือก<br />
            เวลาทำการของสาขา: {openHour}:00 - {closeHour}:00 น.
          </span>
        </div>
      </div>
    </div>
  );
};

export default Step2TimeDuration;
