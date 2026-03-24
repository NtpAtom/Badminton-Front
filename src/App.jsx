import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./page/Login/loginPage";
import RegisterPage from "./page/Register/registerPage";
import UserLayout from "./layouts/UserLayout";
import BookingPage from "./page/user/booking/bookingPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />


      <Route
        path="/user"
        element={
          <ProtectedRoute role={['user', 'admin']}>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />

        <Route path="dashboard" element={
          <div style={{ padding: '20px' }}>
            <h1>Dashboard</h1><p>Welcome to your Dashboard!</p>
          </div>
        } />

        <Route path="booking" element={<BookingPage />} />

        <Route path="my-bookings" element={
          <div style={{ padding: '20px' }}>
            <h1>รายการจองของฉัน</h1><p>Your upcoming bookings will appear here.</p>
          </div>
        } />

        <Route path="profile" element={
          <div style={{ padding: '20px' }}>
            <h1>Profile Settings</h1><p>Edit your profile details here.</p>
          </div>
        } />
      </Route>
    </Routes>
  );
}

export default App;
