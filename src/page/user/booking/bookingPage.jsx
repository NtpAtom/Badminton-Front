import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

export default function BookingPage() {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        จองสนาม
      </Typography>
      <Paper sx={{ p: 5, borderRadius: 3, textAlign: 'center', color: '#666' }}>
        <Typography variant="h6">
          โปรดเลือกเวลาเพื่อดูสนามที่ว่าง
        </Typography>
        {/* You can add your time selection and court UI here */}
      </Paper>
    </Box>
  );
}
