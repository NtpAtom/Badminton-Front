import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import Step1BranchDate from "./components/Step1BranchDate";
import Step2TimeDuration from "./components/Step2TimeDuration";
import Step3CourtList from "./components/Step3CourtList";
import "./bookingPage.css";
import axios from "axios";
import { useLogin } from "../../../store/loginStore";
import { useLoading } from "../../../store/loadingStore";

export default function BookingPage() {
  const { user, token } = useLogin();
  const { setIsLoading } = useLoading();
  const [branchId, setBranchId] = useState("");
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState(0);
  const [branches, setBranches] = useState([]);
  const [availableCourts, setAvailableCourts] = useState([]);

  // Fetch branches on mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/branch");
        if (res.data.status) {
          setBranches(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching branches:", err);
      }
    };
    fetchBranches();
  }, []);

  const fetchAvailableCourts = async () => {
    if (!branchId || !bookingDate || !startTime || !endTime) return;

    setIsLoading(true);
    try {
      const res = await axios.get("http://localhost:3000/api/court/available", {
        params: {
          branch_id: branchId,
          booking_date: bookingDate,
          start_time: startTime,
          end_time: endTime
        }
      });
      if (res.data.status) {
        setAvailableCourts(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching available courts:", err);
    } finally {
      setIsLoading(false);
    }
  };



  useEffect(() => {
    fetchAvailableCourts();
  }, [branchId, bookingDate, startTime, endTime]);

  useEffect(() => {
    if (startTime && endTime) {
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      const totalMinutes = (endH * 60 + endM) - (startH * 60 + startM);
      setDuration(totalMinutes > 0 ? totalMinutes : 0);
    }
  }, [startTime, endTime]);

  const hdlSelectCourt = async (court) => {
    if (!token) {
      alert("กรุณาเข้าสู่ระบบก่อนทำการจอง");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post("http://localhost:3000/api/booking/add", {
        court_id: court.court_id,
        booking_date: bookingDate,
        start_time: startTime,
        end_time: endTime,
        // user_id: user.user_id // Backend ดึงจาก Token ได้เองอยู่แล้ว แต่อาจจะใส่กันไว้ก็ได้ครับ
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.status) {
        alert("จองสนามสำเร็จ!");
        fetchAvailableCourts();
        // อาจจะ navigate ไปหน้าอื่นต่อ เช่น หน้าประวัติการจอง
      }
    } catch (error) {
      console.error("Error booking court:", error);
      alert(error.response?.data?.message || "เกิดข้อผิดพลาดในการจอง");
    } finally {
      setIsLoading(false);
    }
  }


  const selectedBranch = branches.find(b => b.branch_id === branchId);

  return (
    <Box className="booking-container">
      <h1 className="booking-title">จองสนาม</h1>

      <Step1BranchDate
        branchId={branchId}
        setBranchId={setBranchId}
        bookingDate={bookingDate}
        setBookingDate={setBookingDate}
        branches={branches}
      />

      <Step2TimeDuration
        startTime={startTime}
        setStartTime={setStartTime}
        endTime={endTime}
        setEndTime={setEndTime}
        duration={duration}
        selectedBranch={selectedBranch}
      />

      {(branchId && duration >= 60) && (
        <Step3CourtList
          courts={availableCourts}
          branchName={selectedBranch?.branch_name}
          date={bookingDate}
          timeRange={`${startTime} - ${endTime}`}
          duration={duration}
          onSelectCourt={(court) => { console.log("Selected:", court); hdlSelectCourt(court) }}
        />
      )}
    </Box>
  );
}
