import React from "react";
import { Autocomplete, TextField } from "@mui/material";

// Using standard MUI icons
import StorefrontIcon from '@mui/icons-material/Storefront';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const Step1BranchDate = ({ branchId, setBranchId, bookingDate, setBookingDate, branches }) => {
  // Find the selected branch object for Autocomplete's value
  const selectedBranch = branches.find(b => b.branch_id === branchId) || null;

  return (
    <div className="step-card">
      <div className="step-header">
        <StorefrontIcon fontSize="small" />
        <h2>ขั้นตอนที่ 1: เลือกสาขาและวันที่</h2>
      </div>

      <div className="input-row">
        <div className="input-group">
          <label htmlFor="branch">สาขา</label>
          <Autocomplete
            id="branch"
            options={branches}
            getOptionLabel={(option) => option.branch_name || ""}
            value={selectedBranch}
            onChange={(event, newValue) => {
              setBranchId(newValue ? newValue.branch_id : "");
            }}
            fullWidth
            size="small"
            renderInput={(params) => (
              <TextField 
                {...params} 
                placeholder="ค้นหาชื่อสาขา..."
                sx={{ 
                  "& .MuiOutlinedInput-root": { borderRadius: "8px", backgroundColor: "#f8fafc" } 
                }}
              />
            )}
            noOptionsText="ไม่พบสาขาที่คุณค้นหา"
          />
        </div>

        <div className="input-group">
          <label htmlFor="date">วันที่</label>
          <TextField
            id="date"
            type="date"
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
            fullWidth
            size="small"
            sx={{ 
              "& .MuiOutlinedInput-root": { borderRadius: "8px", backgroundColor: "#f8fafc" }
            }}
            InputLabelProps={{ shrink: true }}
          />
        </div>
      </div>
    </div>
  );
};

export default Step1BranchDate;
