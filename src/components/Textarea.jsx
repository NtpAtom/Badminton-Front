import React from 'react';
import { TextField } from '@mui/material';

const Textarea = ({ 
  label, 
  value, 
  onChange, 
  rows = 4, 
  ...props 
}) => {
  return (
    <TextField
      label={label}
      value={value}
      onChange={onChange}
      multiline
      rows={rows}
      variant="outlined"
      fullWidth
      margin="normal"
      {...props}
    />
  );
};

export default Textarea;
