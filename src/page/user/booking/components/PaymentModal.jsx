import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, Box, IconButton, Typography, Alert } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TimerIcon from '@mui/icons-material/Timer';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from './CheckoutForm';

// Initialize stripe outside of component to avoid re-creation on every render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function PaymentModal({ open, clientSecret, amount, onCancel, onSuccess }) {
  const [timeLeft, setTimeLeft] = useState(180); // 180 seconds = 3 minutes

  useEffect(() => {
    if (!open) {
      setTimeLeft(180); // Reset timer when modal closed
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onCancel(); // Trigger cancellation on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, onCancel]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!clientSecret) return null;

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#1976d2',
      },
    },
  };

  return (
    <Dialog 
      open={open} 
      maxWidth="sm" 
      fullWidth
      sx={{ '& .MuiDialog-paper': { borderRadius: 2, p: 1 } }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          ชำระเงินเพื่อยืนยันการจอง
        </Typography>
        <IconButton onClick={onCancel}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: 0 }}>
        <Alert 
          severity={timeLeft < 60 ? "error" : "info"} 
          icon={<TimerIcon />} 
          sx={{ mb: 2, fontWeight: 'bold' }}
        >
          โปรดชำระเงินภายใน: {formatTime(timeLeft)} นาที (หากไม่ทันสนามจะหลุดจอง)
        </Alert>

        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm 
            amount={amount} 
            onCancel={onCancel} 
            onSuccess={onSuccess} 
          />
        </Elements>
      </DialogContent>
    </Dialog>
  );
}

