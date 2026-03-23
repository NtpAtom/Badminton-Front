import React from 'react';
import { Typography } from '@mui/material';

const Label = ({ 
  children, 
  variant = 'body1',
  ...props 
}) => {
  return (
    <Typography 
      variant={variant} 
      component="label" 
      sx={{ display: 'inline-block', marginBottom: '8px', fontWeight: 500 }}
      {...props}
    >
      {children}
    </Typography>
  );
};

export default Label;
