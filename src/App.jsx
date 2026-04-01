import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./page/Login/loginPage";
import RegisterPage from "./page/Register/registerPage";
import UserLayout from "./layouts/UserLayout";
import BookingPage from "./page/user/booking/bookingPage";
import ProtectedRoute from "./components/ProtectedRoute";
import HistoryBookingPage from "./page/user/historyBooking/historyBookingPage";
import Loading from "./components/Loading";
import ProfilePage from "./page/profile/profilePage";
import AdminLayout from "./layouts/AdminLayout";
import CourtPage from "./page/admin/manageCourt/courtLivePage";
import ManageUserPage from "./page/admin/manageUser/manageUserPage";
import ManageBranchPage from "./page/admin/manageBranch/manageBranchPage";
import HistoryBookingAdmin from "./page/admin/historybooking/historyBookingAdmin";

function App() {
  return (
    <>
      <Loading />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />


        <Route
          path="/user"
          element={
            <ProtectedRoute role={['user', 'admin', 'super admin']}>
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

          <Route path="my-bookings" element={<HistoryBookingPage />} />

          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role={['admin', 'super admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="courts" replace />} />
          <Route path="courts" element={<CourtPage />} />
          <Route path="manageUser" element={<ManageUserPage />} />
          <Route path="manageBranch" element={<ManageBranchPage />} />
          <Route path="history-bookings" element={<HistoryBookingAdmin />} />
          <Route path="dashboard" element={<div style={{ padding: '20px' }}><h1>Admin Dashboard</h1></div>} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
