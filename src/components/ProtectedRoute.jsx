import React from 'react';
import { Navigate } from 'react-router-dom';
import { useLogin } from '../store/loginStore';

function ProtectedRoute({ children, role }) {
  const { token, user } = useLogin()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  // ถ้ามี role และ user.role ไม่อยู่ใน array
  if (role && !role.includes(user?.user_role)) {
    return <Navigate to="/" />
  }

  return children
}

export default ProtectedRoute;
