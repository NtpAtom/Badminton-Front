import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import Step1BranchDate from "./components/Step1BranchDate";
import Step2TimeDuration from "./components/Step2TimeDuration";
import Step3CourtList from "./components/Step3CourtList";
import PaymentModal from "./components/PaymentModal";
import "./bookingPage.css";
import axios from "axios";
import { useLogin } from "../../../store/loginStore";
import { useLoading } from "../../../store/loadingStore";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

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

  // 💳 Stripe Payment State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [currentAmount, setCurrentAmount] = useState(0);

  // Fetch branches on mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await axios.get(`${API}/branch`);
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
      const res = await axios.get(`${API}/court/available`, {
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

  // ────────────────────────────────────────────────
  // Step 1: กดเลือกสนาม → สร้าง Booking + PaymentIntent
  // ────────────────────────────────────────────────
  const hdlSelectCourt = async (court) => {
    if (!token) {
      alert("กรุณาเข้าสู่ระบบก่อนทำการจอง");
      return;
    }

    setIsLoading(true);
    try {
      // 1️⃣ สร้าง Booking (สถานะ Pending)
      const bookingRes = await axios.post(`${API}/booking/add`, {
        court_id: court.court_id,
        booking_date: bookingDate,
        start_time: startTime,
        end_time: endTime,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!bookingRes.data.status) throw new Error("ไม่สามารถสร้างการจองได้");
      const booking = bookingRes.data.data;

      // 2️⃣ สร้าง Stripe PaymentIntent
      const piRes = await axios.post(`${API}/stripe/create-payment-intent`, {
        booking_id: booking.booking_id,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!piRes.data.status) throw new Error("ไม่สามารถสร้างการชำระเงินได้");

      // 3️⃣ เปิด PaymentModal
      setCurrentBookingId(booking.booking_id);
      setClientSecret(piRes.data.clientSecret);
      setPaymentIntentId(piRes.data.paymentIntentId);
      setCurrentAmount(parseFloat(booking.total_price));
      setPaymentModalOpen(true);

    } catch (error) {
      console.error("Error booking court:", error);
      alert(error.response?.data?.message || error.message || "เกิดข้อผิดพลาดในการจอง");
    } finally {
      setIsLoading(false);
    }
  };

  // ────────────────────────────────────────────────
  // Step 2a: จ่ายเงินสำเร็จ → เรียก API เปลี่ยน status เป็น Confirmed ทันที
  // ────────────────────────────────────────────────
  const hdlPaymentSuccess = async () => {
    try {
      // ⚡ เรียก Backend เปลี่ยน status เป็น Confirmed ทันที
      await axios.post(`${API}/stripe/confirm-booking`, {
        booking_id: currentBookingId,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error("เปลี่ยน status ไม่สำเร็จ:", err);
    } finally {
      setPaymentModalOpen(false);
      setClientSecret(null);
      setPaymentIntentId(null);
      setCurrentBookingId(null);
      alert("✅ ชำระเงินสำเร็จ! การจองของคุณได้รับการยืนยันแล้ว");
      fetchAvailableCourts(); // refresh สนามว่าง
    }
  };

  // ────────────────────────────────────────────────
  // Step 2b: ยกเลิก / หมดเวลา 3 นาที
  // ────────────────────────────────────────────────
  const hdlPaymentCancel = async () => {
    setPaymentModalOpen(false);

    if (!currentBookingId) return;

    try {
      await axios.post(`${API}/stripe/cancel-booking`, {
        booking_id: currentBookingId,
        payment_intent_id: paymentIntentId,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Error cancelling booking:", err);
    } finally {
      setClientSecret(null);
      setPaymentIntentId(null);
      setCurrentBookingId(null);
      fetchAvailableCourts();
    }
  };

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
          onSelectCourt={(court) => hdlSelectCourt(court)}
        />
      )}

      {/* 💳 Stripe Payment Modal */}
      <PaymentModal
        open={paymentModalOpen}
        clientSecret={clientSecret}
        amount={currentAmount}
        onCancel={hdlPaymentCancel}
        onSuccess={hdlPaymentSuccess}
      />
    </Box>
  );
}
