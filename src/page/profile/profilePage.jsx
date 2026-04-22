import React, { useEffect, useState } from 'react';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SaveIcon from '@mui/icons-material/Save';
import { useLogin } from '../../store/loginStore';
import API_URL from '../../config/api';
import './profilePage.css';

import axios from 'axios';

const ProfilePage = () => {
    const { user, token, updateUser } = useLogin()

    const [formData, setFormData] = useState({
        user_name: user?.user_name || "",
        user_email: user?.email || "",
        user_phone: user?.phone || "",
        user_password: "",
        old_password: "",
        new_password: "",
        confirmPassword: "",
    })

    const fetchUser = async () => {
        try {
            const res = await axios.get(`${API_URL}/user/${user.user_id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // ข้อมูลจาก Backend อยู่ใน res.data.data[0]
            const userData = res.data.data?.[0];

            if (userData) {
                // เก็บข้อมูลทั้งหมดจาก Backend (รวมถึง Role, Branch) เพื่อไม่ให้หายตอน Update
                setFormData(prev => ({
                    ...prev,
                    ...userData,
                    user_name: userData.user_name || "",
                    user_email: userData.user_email || "",
                    user_phone: userData.user_phone || "",
                    user_password: "", // ล้างรหัสผ่าน (ที่เป็น Hash) ออกเพื่อความปลอดภัย
                    old_password: "",
                    new_password: "",
                    confirmPassword: "",
                }));
            }
        } catch (error) {
            console.log("Error fetching user:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };


    const hdlSubmitPersonal = async () => {
        try {
            // ส่งแค่ข้อมูลส่วนตัว (ชื่อ, อีเมล, เบอร์) ส่วนตัวอื่นส่ง null เพื่อให้ Backend ใช้ค่าเดิม
            const payload = {
                ...formData,
                user_name: formData.user_name,
                user_email: formData.user_email,
                user_phone: formData.user_phone,
                user_password: null,
                old_password: null
            };

            const res = await axios.put(`${API_URL}/user/update/${user.user_id}`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // 🔹 อัปเดตข้อมูลใน store ทันทีเพื่อให้ Navbar เปลี่ยนตาม!
            if (res.data.status) {
                updateUser(res.data.data);
            }

            console.log("Update Personal Success:", res.data);
            alert("บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว!");
        } catch (error) {
            console.log("Error updating user:", error);
            alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล: " + (error.response?.data?.message || error.message));
        }
    };

    const hdlSubmitPassword = async () => {

        if (!formData.old_password) {
            return alert("กรุณากรอกรหัสผ่านปัจจุบัน");
        }
        if (!formData.new_password || !formData.confirmPassword) {
            return alert("กรุณากรอกรหัสผ่านใหม่ให้ครบถ้วน");
        }
        if (formData.new_password !== formData.confirmPassword) {
            return alert("รหัสผ่านใหม่ไม่ตรงกัน");
        }

        try {
            // ส่งแค่รหัสผ่านใหม่ และรหัสผ่านเดิมไปเช็ค
            const payload = {
                ...formData,
                user_password: formData.new_password,
                old_password: formData.old_password
            };

            const res = await axios.put(`${API_URL}/user/update/${user.user_id}`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("Update Password Success:", res.data);
            alert("เปลี่ยนรหัสผ่านเรียบร้อยแล้ว!");

            // เคลียร์ช่องรหัสผ่าน
            setFormData(prev => ({
                ...prev,
                new_password: "",
                confirmPassword: ""
            }));
        } catch (error) {
            console.log("Error updating password:", error);
            const msg = error.response?.data?.message || error.message;
            if (msg === "รหัสผ่านเดิมไม่ถูกต้อง") {
                alert("❌ รหัสผ่านเดิมไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
            } else {
                alert("เกิดข้อผิดพลาด: " + msg);
            }
        }
    }


    useEffect(() => {
        fetchUser()
    }, [])



    return (
        <div className="profile-container">
            <div className="profile-content">
                <div className="profile-header">
                    <h1>โปรไฟล์</h1>
                    <p>จัดการข้อมูลส่วนตัวและความปลอดภัยของคุณ</p>
                </div>

                <div className="profile-grid">
                    {/* Sidebar section */}
                    <div className="sidebar-card">
                        <div className="avatar-wrapper">
                            <div className="avatar-gradient">
                                <PersonOutlineIcon sx={{ fontSize: 80 }} />
                            </div>
                        </div>
                        <div className="username-display">{formData.user_name}</div>
                        <div className="stats-divider"></div>
                        <div className="stats-list">
                            <div className="stat-item">
                                <span className="stat-label">การจองทั้งหมด</span>
                                <span className="stat-value">12</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">สมาชิกตั้งแต่</span>
                                <span className="stat-value">มี.ค. 2026</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Content section */}
                    <div className="main-content">
                        {/* Personal Info Card */}
                        <div className="form-card">
                            <h2 className="form-card-title">ข้อมูลส่วนตัว</h2>

                            <div className="input-group">
                                <label className="input-label">ชื่อ-นามสกุล</label>
                                <div className="input-with-icon">
                                    <PersonOutlineIcon className="input-icon" />
                                    <input
                                        type="text"
                                        name="user_name"
                                        className="custom-input"
                                        placeholder="ชื่อ-นามสกุล"
                                        value={formData.user_name || ""}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label className="input-label">อีเมล</label>
                                <div className="input-with-icon">
                                    <MailOutlineIcon className="input-icon" />
                                    <input
                                        type="email"
                                        name="user_email"
                                        className="custom-input"
                                        placeholder="อีเมล"
                                        value={formData.user_email || ""}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label className="input-label">เบอร์โทร</label>
                                <div className="input-with-icon">
                                    <PhoneIphoneIcon className="input-icon" />
                                    <input
                                        type="tel"
                                        name="user_phone"
                                        className="custom-input"
                                        placeholder="081-234-5678"
                                        value={formData.user_phone || ""}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <button className="save-button" type="button" onClick={hdlSubmitPersonal}>
                                <SaveIcon fontSize="small" />
                                บันทึกข้อมูล
                            </button>
                        </div>

                        {/* Password Change Card */}
                        <div className="form-card">
                            <h2 className="form-card-title">เปลี่ยนรหัสผ่าน</h2>

                            <div className="input-group">
                                <label className="input-label">รหัสผ่านปัจจุบัน</label>
                                <div className="input-with-icon">
                                    <LockOutlinedIcon className="input-icon" />
                                    <input
                                        type="password"
                                        name="old_password"
                                        className="custom-input"
                                        placeholder="รหัสผ่านปัจจุบัน"
                                        value={formData.old_password}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label className="input-label">รหัสผ่านใหม่</label>
                                <div className="input-with-icon">
                                    <LockOutlinedIcon className="input-icon" />
                                    <input
                                        type="password"
                                        name="new_password"
                                        className="custom-input"
                                        placeholder="........"
                                        value={formData.new_password}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label className="input-label">ยืนยันรหัสผ่านใหม่</label>
                                <div className="input-with-icon">
                                    <LockOutlinedIcon className="input-icon" />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        className="custom-input"
                                        placeholder="........"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <button className="password-button" type="button" onClick={hdlSubmitPassword}>
                                <LockOutlinedIcon fontSize="small" />
                                เปลี่ยนรหัสผ่าน
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
