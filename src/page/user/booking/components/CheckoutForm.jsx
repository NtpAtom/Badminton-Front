import React, { useState } from "react";
import { 
  PaymentElement, 
  useStripe, 
  useElements 
} from "@stripe/react-stripe-js";
import { Button, Box, Typography, CircularProgress } from "@mui/material";

export default function CheckoutForm({ amount, onCancel, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false); // New state to track if element is ready

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || !isReady) {
      return;
    }

    setIsLoading(true);

    // Confirm the payment using the clientSecret passed to the Elements provider
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required", // Handle success manually on the same page
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message);
      } else {
        setMessage("เกิดข้อผิดพลาดในการชำระเงิน: " + error.message);
      }
      setIsLoading(false);
    } else {
        // Payment succeeded or is in progress
        if (paymentIntent.status === "succeeded") {
            onSuccess();
        } else if (paymentIntent.status === "processing") {
            setMessage("กำลังดำเนินการชำระเงินของคุณ...");
        } else {
            setMessage("มีบางอย่างผิดพลาด โปรดตรวจสอบภายหลัง");
        }
        setIsLoading(false);
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        ชำระเงินทั้งหมด {amount} บาท
      </Typography>
      
      <PaymentElement 
        id="payment-element" 
        onReady={() => setIsReady(true)} // Set ready when Stripe element mounts
      />
      
      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button onClick={onCancel} disabled={isLoading} color="inherit">
          ยกเลิก
        </Button>
        <Button 
          type="submit" 
          variant="contained" 
          sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
          disabled={isLoading || !stripe || !elements || !isReady}
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isLoading ? "กำลังชำระเงิน..." : "ชำระเงินทันที"}
        </Button>
      </Box>


      {message && (
        <Box sx={{ mt: 2, p: 1, borderRadius: 1, bgcolor: '#ffebee', color: '#c62828' }}>
          {message}
        </Box>
      )}
    </form>
  );
}
