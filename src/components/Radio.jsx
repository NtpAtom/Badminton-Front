import React from 'react';
import { FormControlLabel, Radio as MuiRadio } from '@mui/material';

const Radio = ({ 
  label, 
  value, 
  checked, 
  onChange, 
  ...props 
}) => {
  return (
    <FormControlLabel
      value={value}
      control={
        <MuiRadio 
          checked={checked} 
          onChange={onChange} 
          {...props} 
        />
      }
      label={label}
    />
  );
};

export default Radio;
