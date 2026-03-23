import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

// ดึงตัวช่วยสร้างหน้าตาเว็บจาก Material-UI (MUI) มาใช้
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Drawer,
} from "@mui/material";

// ดึงไอคอนมาใช้ (ของ MUI)
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SportsTennisIcon from "@mui/icons-material/SportsTennis";
import EventNoteIcon from "@mui/icons-material/EventNote";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";

import { useLogin } from "../store/loginStore";

export default function UserLayout() {
  // 1. ตัวแปรเก็บสถานะต่างๆ (State) ขององค์ประกอบในหน้า
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // เก็บสถานะว่า Sidebar ถูกเปิดอยู่หรือไม่
  const [anchorEl, setAnchorEl] = useState(null); // ใช้คู่กับปุ่ม Profile เพื่อบอกว่าจุดไหนคือจุดที่เปิด Dropdown

  // 2. ตัวช่วยการเปลี่ยนหน้า (Hooks จาก react-router-dom)
  const navigate = useNavigate();
  const location = useLocation(); // เช็คว่าปัจจุบันอยู่หน้าไหน (URL)

  // 3. ดึงข้อมูล User ตอนล็อกอินมาจาก Zustand Store ของเรา
  const user = useLogin((state) => state.user) || { user_name: "User" };
  const logout = useLogin((state) => state.logout);

  // === ฟังก์ชันการทำงานต่างๆ ===

  // กดปุ่ม 3 ขีด เพื่อสลับเปิด-ปิด Sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // เปิดเมนู Dropdown โปรไฟล์ ตอนกดที่รูป
  const handleOpenProfileMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // ปิดเมนูโปรไฟล์
  const handleCloseProfileMenu = () => {
    setAnchorEl(null);
  };

  // ระบบออกจากระบบ (Logout)
  const handleLogout = () => {
    logout(); // ลบข้อมูลใน store
    handleCloseProfileMenu(); // ปิดเมนูก่อน
    navigate("/login"); // เด้งไปหน้า Lockpage
  };

  // ความกว้างของเมนูด้านซ้าย แบบตั้งค่าตายตัว
  const drawerWidth = 260;

  // === ส่วนของหน้าตา UI (Render HTML) ===
  return (
    <Box
      sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f9fafb" }}
    >
      {/* ================= 1. Navbar (แถบเมนูด้านบน) ================= */}
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "#fff",
          color: "#333",
          boxShadow: "0px 1px 4px rgba(0,0,0,0.05)",
          zIndex: 1201, // บังคับให้อยู่เลเยอร์บนสุด เหนือ Sidebar เสมอ
        }}
      >
        <Toolbar>
          {/* ปุ่มขีด 3 ขีดใช้ เปิด/ปิด Sidebar */}
          <IconButton onClick={toggleSidebar} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          {/* ชื่อระบบด้านบน */}
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Badminton App
          </Typography>
          <Box sx={{ flexGrow: 1 }} />{" "}
          {/* ตัวช่วยดันให้ของข้างล่างนี้ไปอยู่มุมขวาจนสุด */}
          {/* ส่วนข้อมูลบัญชีผู้ใช้ (ชื่อ + รูปโปรไฟล์) */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography sx={{ fontWeight: "bold" }}>
              {user.user_name}
            </Typography>

            <IconButton onClick={handleOpenProfileMenu} sx={{ p: 0 }}>
              <Avatar sx={{ bgcolor: "#111" }}>
                {user.user_name && user.user_name !== "User" ? user.user_name[0].toUpperCase() : "U"}{" "}
                {/* โชว์ตัวพิมพ์ตัวแรกของชื่อ ถ้าไม่มีให้ขึ้น U */}
              </Avatar>
            </IconButton>

            {/* หน้าต่างเมนูเล็กๆ ที่จะเด้งมาตอนกดรูป (Dropdown) */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseProfileMenu}
              sx={{ mt: "40px" }} // ดันลงมานิดนึงไม่ให้บังรูป
            >
              <MenuItem
                onClick={() => {
                  handleCloseProfileMenu();
                  navigate("/user/profile");
                }}
              >
                โปรไฟล์ของฉัน
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ color: "red" }}>
                ออกจากระบบ
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* ================= 2. Sidebar (แถบเมนูด้านข้าง) ================= */}
      <Drawer
        variant="persistent" // persistent ย่อหดได้ โดยมันดันเนื้อหาคอนเทนต์ให้ขยับตามได้
        open={isSidebarOpen} // รับค่า state จากบรรทัด 24 (true/false)
        sx={{
          width: isSidebarOpen ? drawerWidth : 0,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth, // ความกว้างเท่าที่เรากำหนดไว้
            boxSizing: "border-box",
            backgroundColor: "#ffffff",
            borderRight: "1px solid #f0f0f0",
          },
        }}
      >
        <Toolbar />{" "}
        {/* ใส่ Toolbar ว่างๆ มาเพื่อดันของลงไปให้มีระยะห่างพ้น Navbar หัวด้านบน */}
        <List sx={{ p: 2 }}>
          {/* ---- ปุ่ม Dashboard ---- */}
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => navigate("/user/dashboard")}
              selected={location.pathname.includes("/user/dashboard")} // เช็คว่ากำลังอยู่หน้านี้หรือเปล่า
              sx={{ borderRadius: "8px" }}
            >
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>
          </ListItem>

          {/* ---- ปุ่ม จองสนาม ---- */}
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => navigate("/user/booking")}
              selected={location.pathname.includes("/user/booking")}
              sx={{ borderRadius: "8px" }}
            >
              <ListItemIcon>
                <SportsTennisIcon />
              </ListItemIcon>
              <ListItemText primary="จองสนาม" />
            </ListItemButton>
          </ListItem>

          {/* ---- ปุ่ม รายการจองของฉัน ---- */}
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => navigate("/user/my-bookings")}
              selected={location.pathname.includes("/user/my-bookings")}
              sx={{ borderRadius: "8px" }}
            >
              <ListItemIcon>
                <EventNoteIcon />
              </ListItemIcon>
              <ListItemText primary="รายการจองของฉัน" />
            </ListItemButton>
          </ListItem>

          {/* ---- ปุ่ม โปรไฟล์ ---- */}
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => navigate("/user/profile")}
              selected={location.pathname.includes("/user/profile")}
              sx={{ borderRadius: "8px" }}
            >
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="โปรไฟล์" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding sx={{ mb: 1, mt: 50 }}>
            <ListItemButton
              onClick={() => navigate("/login")}
              selected={location.pathname.includes("/login")}
              sx={{ borderRadius: "8px" }}
            >
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="ออกจากระบบ" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      {/* ================= 3. Main Content (ส่วนเนื้อหาตรงกลาง) ================= */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          // ทำอนิเมชั่นให้ค่อยๆยืด/หด เวลากดสลับเปิดปิด sidebar
          transition: "margin 0.3s ease",
        }}
      >
        <Toolbar /> {/* สร้างช่องว่างให้เนื้อหาไม่ชนแถบ Navbar ข้างบนสุด */}
        {/* ตรงนี้คือพื้นที่ที่ใช้แสดงหน้าลูกๆ ของ Layout นี้ เช่น หน้า bookingPage ที่เราเขียนไว้  */}
        <Outlet />
      </Box>
    </Box>
  );
}
