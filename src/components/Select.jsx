import React from 'react';
import { FormControl, InputLabel, Select as MuiSelect, MenuItem } from '@mui/material';

const Select = ({ 
  label, 
  value, 
  onChange, 
  options = [], 
  ...props 
}) => {
  const labelId = label ? `${label}-select-label` : undefined;

  return (
    <FormControl fullWidth margin="normal">
      {label && <InputLabel id={labelId}>{label}</InputLabel>}
      <MuiSelect
        labelId={labelId}
        value={value}
        label={label}
        onChange={onChange}
        {...props}
      >
        {options.map((option, index) => (
          <MenuItem key={index} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </MuiSelect>
    </FormControl>
  );
};

export default Select;
