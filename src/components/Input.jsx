import React from "react";
import { TextField } from "@mui/material";

const Input = ({
  type = "text",
  label,
  value,
  onChange,
  placeholder,
  ...props
}) => {
  return (
    <TextField
      type={type} // supports 'text', 'password', 'number'
      label={label}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      variant="outlined"
      fullWidth
      margin="normal"
      {...props}
    />
  );
};

export default Input;
