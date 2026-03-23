import React from 'react';
import { Button as MuiButton, CircularProgress } from '@mui/material';

const Button = ({ 
  children, 
  variant = 'primary', 
  loading = false, 
  disabled = false, 
  ...props 
}) => {
  // Map custom variants to MUI colors
  const colorMap = {
    primary: 'primary',
    secondary: 'secondary',
    danger: 'error',
  };

  return (
    <MuiButton
      variant="contained"
      color={colorMap[variant] || 'primary'}
      disabled={loading || disabled}
      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
      {...props}
    >
      {children}
    </MuiButton>
  );
};

export default Button;
