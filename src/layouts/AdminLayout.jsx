import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
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
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SportsIcon from "@mui/icons-material/Sports";
import PeopleIcon from "@mui/icons-material/People";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import BusinessIcon from "@mui/icons-material/Business";

import { useLogin } from "../store/loginStore";

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const user = useLogin((state) => state.user) || { user_name: "Admin", role: "admin" };
  const logout = useLogin((state) => state.logout);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleOpenProfileMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseProfileMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleCloseProfileMenu();
    navigate("/login");
  };

  const drawerWidth = 260;

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/admin/dashboard" },
    { text: "จัดการสนาม (Courts)", icon: <SportsIcon />, path: "/admin/courts" },
    ...(user.user_role === "super admin" ? [
      { text: "จัดการสาขา (Branches)", icon: <BusinessIcon />, path: "/admin/manageBranch" }
    ] : []),
    { text: "จัดการผู้ใช้งาน (Users)", icon: <PeopleIcon />, path: "/admin/manageUser" },
    { text: "ประวัติการจอง (History)", icon: <DashboardIcon />, path: "/admin/history-bookings" },
    { text: "ตั้งค่าระบบ", icon: <SettingsIcon />, path: "/admin/settings" },
  ];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f4f6f8" }}>
      {/* Navbar */}
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "#1a237e", // Darker blue for Admin
          color: "#fff",
          boxShadow: "0px 1px 4px rgba(0,0,0,0.1)",
          zIndex: 1201,
        }}
      >
        <Toolbar>
          <IconButton onClick={toggleSidebar} sx={{ mr: 2, color: "#fff" }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: "bold", flexGrow: 1 }}>
            Badminton Admin Panel
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
              <Typography sx={{ fontWeight: "bold", fontSize: "0.9rem" }}>
                {user.user_name}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Administrator
              </Typography>
            </Box>

            <IconButton onClick={handleOpenProfileMenu} sx={{ p: 0 }}>
              <Avatar sx={{ bgcolor: "#fff", color: "#1a237e" }}>
                {user.user_name ? user.user_name[0].toUpperCase() : "A"}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseProfileMenu}
              sx={{ mt: "40px" }}
            >
              <MenuItem onClick={handleLogout} sx={{ color: "red" }}>
                ออกจากระบบ
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        open={isSidebarOpen}
        onClose={toggleSidebar}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#fff",
            borderRight: "1px solid #e0e0e0",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto", p: 2 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  selected={location.pathname === item.path}
                  sx={{
                    borderRadius: "12px",
                    "&.Mui-selected": {
                      backgroundColor: "rgba(26, 35, 126, 0.08)",
                      color: "#1a237e",
                      "& .MuiListItemIcon-root": {
                        color: "#1a237e",
                      },
                    },
                    "&:hover": {
                      backgroundColor: "rgba(26, 35, 126, 0.04)",
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 45 }}>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{ fontWeight: location.pathname === item.path ? 700 : 500 }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 2 }} />
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1.5, sm: 2, md: 4 },
          transition: "margin 0.3s ease",
          width: "100%",
          overflowX: "hidden", // ป้องกันเลื่อนแนวนอนถ้าไม่จำเป็น
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
