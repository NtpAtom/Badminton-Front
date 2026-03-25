import React from "react";
import { Button } from "@mui/material";
import GridViewIcon from '@mui/icons-material/GridView';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const Step3CourtList = ({ courts, branchName, date, timeRange, duration, onSelectCourt }) => {
  return (
    <div className="step-card">
      <div className="step-header">
        <GridViewIcon fontSize="small" />
        <h2>ขั้นตอนที่ 3: เลือกสนาม <span style={{ fontWeight: 400, color: "#64748b", fontSize: "14px", marginLeft: "8px" }}>({courts.length} สนามว่าง)</span></h2>
      </div>

      <div className="summary-row">
        <div className="summary-item">
          <StorefrontIcon fontSize="inherit" /> {branchName || "ไม่ระบุสาขา"}
        </div>
        <div className="summary-item">
          <CalendarMonthIcon fontSize="inherit" /> {date || "ไม่ระบุวันที่"}
        </div>
        <div className="summary-item">
          <AccessTimeIcon fontSize="inherit" /> {timeRange} ({Math.floor(duration / 60)} ชม. {duration % 60} นาที)
        </div>
      </div>

      <div className="court-grid">
        {courts.length > 0 ? (
          courts.map((court) => (
            <div key={court.court_id} className="court-card">
              <span className={`badge ${court.court_type === "Premium" ? "badge-premium" : "badge-standard"}`}>
                {court.court_type || "Standard"}
              </span>
              <h3>สนาม {court.court_name}</h3>

              <div className="price-row">
                <span className="price-label">ราคา/ชม.</span>
                <span className="price-value">฿{court.price_per_hour}</span>
              </div>
              <div className="price-row" style={{ border: "none", marginTop: 0, paddingTop: 4 }}>
                <span className="price-label" style={{ fontWeight: 600 }}>รวมทั้งหมด</span>
                <span className="price-value total-price" style={{ color: "#0284c7" }}>฿{(court.price_per_hour * (duration / 60)).toLocaleString()}</span>
              </div>

              <Button
                className="select-court-btn"
                variant="contained"
                onClick={() => onSelectCourt(court)}
              >
                เลือกสนามนี้
              </Button>
            </div>
          ))
        ) : (
          <div className="no-courts-alert" style={{ 
            gridColumn: "1 / -1", 
            textAlign: "center", 
            padding: "40px 20px", 
            backgroundColor: "#fff7ed", 
            borderRadius: "12px", 
            border: "1px dashed #fdba74",
            color: "#c2410c"
          }}>
            <GridViewIcon sx={{ fontSize: "48px", mb: 2, opacity: 0.5 }} />
            <h3 style={{ marginBottom: "8px" }}>ขออภัย ขณะนี้ไม่มีสนามว่าง</h3>
            <p style={{ fontSize: "14px", opacity: 0.8 }}>ลองเปลี่ยน "วัน" หรือ "ช่วงเวลา" อื่นๆ ดูนะครับ เพราะสนามอาจถูกจองเต็มแล้ว</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step3CourtList;
