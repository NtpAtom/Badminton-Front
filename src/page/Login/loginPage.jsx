import React, { useState } from "react";
import { Input, Button } from "../../components";
import "./loginPage.css";
import { useNavigate } from "react-router-dom"; // ใช้ redirect ไปหน้าอื่น
import { useLogin } from "../../store/loginStore";
function LoginPage() {
  const navigate = useNavigate();
  const setLogin = useLogin((state) => state.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const hdlLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post();
    } catch (error) {}
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Welcome</h1>
        <p className="login-subtitle">Please enter your details to sign in.</p>

        <form className="login-form">
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <Input
              id="username"
              placeholder="Enter your username"
              margin="none"
              autoComplete="username"
            />
          </div>

          <div className="input-group">
            <div className="password-header">
              <label htmlFor="password">Password</label>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              margin="none"
              autoComplete="current-password"
            />
            <a href="#" className="forgot-password-link">
              ลืมรหัสผ่าน?
            </a>
          </div>

          <Button type="submit" className="login-submit-btn" disableElevation>
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
