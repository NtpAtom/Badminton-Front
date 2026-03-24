import React, { useState } from "react";
import { Input, Button } from "../../components";
import "./registerPage.css";
import { useNavigate, Link } from "react-router-dom";
import { InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    user_name: "",
    user_email: "",
    user_phone: "",
    user_password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);
  const handleMouseDownPassword = (event) => event.preventDefault();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const hdlRegister = async (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);

    if (!formData.user_name || !formData.user_email || !formData.user_phone || !formData.user_password || !formData.confirmPassword) {
      return setError("กรุณากรอกข้อมูลให้ครบ");
    }

    if (formData.user_password !== formData.confirmPassword) {
      return setError("รหัสผ่านไม่ตรงกัน");
    }

    setLoading(true);

    try {
      const API_URL = "http://localhost:3000/api/user/register"
      await axios.post(API_URL, formData)
      setTimeout(() => {
        setLoading(false);
        navigate('/login');
      }, 800);

    } catch (error) {
      setTimeout(() => {
        console.log(error);
        const msg = error.response?.data?.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก";
        setError(msg);
        setLoading(false);
      }, 800);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1 className="register-title">Create Account</h1>
        <p className="register-subtitle">Join us today! Please enter your details.</p>

        <form className="register-form" onSubmit={hdlRegister}>
          <div className="input-row">
            <div className="input-group">
              <label htmlFor="user_name">Full Name</label>
              <Input
                id="user_name"
                placeholder="John Doe"
                type="text"
                value={formData.user_name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="user_email">Email</label>
            <Input
              id="user_email"
              placeholder="example@mail.com"
              type="email"
              value={formData.user_email}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label htmlFor="user_phone">Phone Number (Optional)</label>
            <Input
              id="user_phone"
              placeholder="081-234-5678"
              type="tel"
              value={formData.user_phone}
              onChange={handleChange}
            />
          </div>

          <div className="input-row">
            <div className="input-group">
              <label htmlFor="user_password">Password</label>
              <Input
                id="user_password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.user_password}
                onChange={handleChange}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          size="small"
                          sx={{ mr: 0.5 }}
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </div>
            <div className="input-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleClickShowConfirmPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          size="small"
                          sx={{ mr: 0.5 }}
                        >
                          {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <Button type="submit" className="register-submit-btn" disableElevation loading={loading}>
            Create Account
          </Button>

          <p className="login-link-text">
            Already have an account? <Link to="/login" className="login-link">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
