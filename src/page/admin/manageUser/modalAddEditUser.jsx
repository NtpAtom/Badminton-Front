import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Divider,
    IconButton,
    Alert,
    Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import axios from 'axios';
import { useLogin } from '../../../store/loginStore';
import API_URL from '../../../config/api';

const ModalAddEditUser = ({ open, handleClose, user }) => {
    const { user: currentUser, token } = useLogin();
    const isSuperAdmin = currentUser?.user_role === 'super admin';

    const [formData, setFormData] = useState({
        user_role: 'user',
        is_active: true,
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && user) {
            setFormData({
                user_role: user.user_role || 'user',
                is_active: user.is_active ?? true,
            });
            setError('');
        }
    }, [user, open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // Super admin ใช้ route /role/:user_id เพื่อเปลี่ยน role + status
            await axios.put(
                `${API_URL}/user/role/${user.user_id}`,
                {
                    user_role: formData.user_role,
                    is_active: formData.is_active,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            handleClose();
        } catch (err) {
            setError(err.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    const roleDisplay = {
        user: { label: 'ลูกค้า (User)', color: '#4caf50', icon: <PersonIcon fontSize="small" /> },
        admin: { label: 'ผู้จัดการ (Admin)', color: '#1976d2', icon: <AdminPanelSettingsIcon fontSize="small" /> },
        'super admin': { label: 'ผู้ดูแลระบบ (Super Admin)', color: '#9c27b0', icon: <AdminPanelSettingsIcon fontSize="small" /> },
    };

    const currentRoleInfo = roleDisplay[user.user_role] || roleDisplay['user'];

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.12)'
                }
            }}
        >
            <DialogTitle sx={{ m: 0, p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                        จัดการสิทธิ์ผู้ใช้งาน
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        ปรับบทบาทและสถานะของผู้ใช้งาน
                    </Typography>
                </Box>
                <IconButton
                    onClick={handleClose}
                    sx={{
                        color: (theme) => theme.palette.grey[500],
                        bgcolor: '#f5f5f5',
                        '&:hover': { bgcolor: '#eeeeee' }
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                <Divider />
                <DialogContent sx={{ p: 4 }}>
                    {/* ข้อมูลผู้ใช้ที่กำลังแก้ไข (read-only) */}
                    <Box sx={{
                        p: 2.5,
                        mb: 3,
                        borderRadius: 3,
                        bgcolor: '#f8f9fa',
                        border: '1px solid #e9ecef'
                    }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                            ข้อมูลผู้ใช้
                        </Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            {user.user_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {user.user_email}
                        </Typography>
                        <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" color="text.secondary">บทบาทปัจจุบัน:</Typography>
                            <Chip
                                label={currentRoleInfo.label}
                                size="small"
                                icon={currentRoleInfo.icon}
                                sx={{
                                    bgcolor: currentRoleInfo.color + '20',
                                    color: currentRoleInfo.color,
                                    fontWeight: 600,
                                    border: `1px solid ${currentRoleInfo.color}40`
                                }}
                            />
                        </Box>
                        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                💡 หากต้องการเปลี่ยนรหัสผ่าน ผู้ใช้สามารถทำได้ที่หน้า
                                <strong> โปรไฟล์</strong> ของตนเอง
                            </Typography>
                        </Box>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Grid container spacing={3}>
                        {/* Super admin เปลี่ยน role ได้ */}
                        {isSuperAdmin && (
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>บทบาท (Role)</InputLabel>
                                    <Select
                                        name="user_role"
                                        value={formData.user_role}
                                        label="บทบาท (Role)"
                                        onChange={handleChange}
                                        sx={{ borderRadius: 3 }}
                                    >
                                        <MenuItem value="user">
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <PersonIcon fontSize="small" sx={{ color: '#4caf50' }} />
                                                User (ลูกค้า)
                                            </Box>
                                        </MenuItem>
                                        <MenuItem value="admin">
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <AdminPanelSettingsIcon fontSize="small" sx={{ color: '#1976d2' }} />
                                                Admin (ผู้จัดการ)
                                            </Box>
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                                {formData.user_role === 'admin' && user.user_role === 'user' && (
                                    <Alert severity="info" sx={{ mt: 1.5, borderRadius: 2 }} icon={<AdminPanelSettingsIcon />}>
                                        ผู้ใช้นี้จะได้รับสิทธิ์ <strong>Admin</strong> — สามารถเข้าถึงหน้าจัดการระบบได้
                                    </Alert>
                                )}
                                {formData.user_role === 'user' && user.user_role === 'admin' && (
                                    <Alert severity="warning" sx={{ mt: 1.5, borderRadius: 2 }}>
                                        สิทธิ์ Admin จะถูกลดลงเป็น <strong>User</strong>
                                    </Alert>
                                )}
                            </Grid>
                        )}

                        {/* ทั้ง super admin และ admin เปลี่ยน is_active ได้ */}
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>สถานะการใช้งาน</InputLabel>
                                <Select
                                    name="is_active"
                                    value={formData.is_active}
                                    label="สถานะการใช้งาน"
                                    onChange={handleChange}
                                    sx={{ borderRadius: 3 }}
                                >
                                    <MenuItem value={true}>✅ เปิดใช้งาน (Active)</MenuItem>
                                    <MenuItem value={false}>🚫 ปิดใช้งาน (Inactive)</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>

                <Divider />
                <DialogActions sx={{ p: 3, px: 4, gap: 1.5 }}>
                    <Button
                        onClick={handleClose}
                        color="inherit"
                        disabled={loading}
                        sx={{
                            borderRadius: 3,
                            px: 3,
                            fontWeight: 600,
                            color: '#666'
                        }}
                    >
                        ยกเลิก
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        sx={{
                            borderRadius: 3,
                            px: 4,
                            fontWeight: 600,
                            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                            }
                        }}
                    >
                        {loading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ModalAddEditUser;
