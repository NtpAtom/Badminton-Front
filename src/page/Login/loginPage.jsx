import React, { useState } from "react";
import { Input, Button } from "../../components";
import "./loginPage.css";
import { useNavigate, Link } from "react-router-dom"; // ใช้ redirect ไปหน้าอื่น
import { useLogin } from "../../store/loginStore";
import axios from "axios";
import { InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";


function LoginPage() {
  const navigate = useNavigate();
  const setLogin = useLogin((state) => state.login);
  const [formData, setFormData] = useState({
    user_email: "",
    user_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = (event) => event.preventDefault();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const hdlLogin = async (e) => {
    e.preventDefault();
    setError(""); // Reset error before new attempt
    const { user_email, user_password } = formData;

    if (!user_email || !user_password) {
      setError("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }

    setLoading(true);
    try {
      const API_URL = 'http://localhost:3000/api/user/login';
      const res = await axios.post(API_URL, { user_email, user_password });
      setTimeout(() => {
        setLogin(res.data.token, res.data.user);
        setLoading(false);
        navigate('/user/booking');
      }, 800);
    } catch (err) {
      setTimeout(() => {


        console.log(err);
        const msg = err.response?.data?.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ";

        // แปลข้อความเป็นภาษาไทยเพื่อให้ผู้ใช้เข้าใจง่าย
        if (msg.includes("User not Found")) {
          setError("ไม่พบอีเมลนี้ในระบบ");
        } else if (msg.includes("password is not match")) {
          setError("รหัสผ่านไม่ถูกต้อง");
        } else {
          setError(msg);
        }

        setLoading(false);
      }, 800);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Welcome</h1>
        <p className="login-subtitle">Please enter your details to sign in.</p>

        <form className="login-form" onSubmit={hdlLogin}>
          <div className="input-group">
            <label htmlFor="user_email">email</label>
            <Input
              id="user_email"
              placeholder="Enter your email"
              margin="none"
              autoComplete="email"
              type="email"
              value={formData.user_email}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <div className="password-header">
              <label htmlFor="user_password">Password</label>
            </div>
            <Input
              id="user_password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              margin="none"
              autoComplete="current-password"
              value={formData.user_password}
              onChange={handleChange}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
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
            <a href="#" className="forgot-password-link">
              ลืมรหัสผ่าน?
            </a>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <Button type="submit" className="login-submit-btn" disableElevation loading={loading}>
            Sign In
          </Button>

          <p className="register-link-text">
            Don't have an account? <Link to="/register" className="register-link">Create Account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
