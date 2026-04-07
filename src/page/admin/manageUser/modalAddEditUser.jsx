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
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ModalAddEditUser = ({ open, handleClose, user }) => {
    const [formData, setFormData] = useState({
        user_name: '',
        user_email: '',
        user_password: '',
        user_phone: '',
        user_role: 'user',
        is_active: true,
        branch_id: ''
    });

    useEffect(() => {
        if (open) {
            if (user) {
                setFormData({
                    user_name: user.user_name || '',
                    user_email: user.user_email || '',
                    user_password: '',
                    user_phone: user.user_phone || '',
                    user_role: user.user_role || 'user',
                    is_active: user.is_active ?? true,
                    branch_id: user.branch_id || ''
                });
            } else {
                setFormData({
                    user_name: '',
                    user_email: '',
                    user_password: '',
                    user_phone: '',
                    user_role: 'user',
                    is_active: true,
                    branch_id: ''
                });
            }
        }
    }, [user, open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form Submitted UI Only:', formData);
        handleClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                }
            }}
        >
            <DialogTitle sx={{ m: 0, p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                        {user ? 'แก้ไขข้อมูลผู้ใช้งาน' : 'เพิ่มผู้ใช้งานใหม่'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        กรุณากรอกข้อมูลส่วนตัวของผู้ใช้งานให้ครบถ้วน
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
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                label="ชื่อ-นามสกุล"
                                name="user_name"
                                value={formData.user_name}
                                onChange={handleChange}
                                fullWidth
                                required
                                placeholder="เช่น นายสมชาย ใจดี"
                                InputProps={{ sx: { borderRadius: 3 } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="อีเมล"
                                name="user_email"
                                type="email"
                                value={formData.user_email}
                                onChange={handleChange}
                                fullWidth
                                required
                                placeholder="example@mail.com"
                                InputProps={{ sx: { borderRadius: 3 } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label={user ? "รหัสผ่านใหม่" : "รหัสผ่าน"}
                                name="user_password"
                                type="password"
                                value={formData.user_password}
                                onChange={handleChange}
                                fullWidth
                                required={!user}
                                helperText={user ? "ปล่อยว่างหากไม่ต้องการเปลี่ยน" : ""}
                                InputProps={{ sx: { borderRadius: 3 } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="เบอร์โทรศัพท์"
                                name="user_phone"
                                value={formData.user_phone}
                                onChange={handleChange}
                                fullWidth
                                placeholder="08XXXXXXXX"
                                InputProps={{ sx: { borderRadius: 3 } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>บทบาท (Role)</InputLabel>
                                <Select
                                    name="user_role"
                                    value={formData.user_role}
                                    label="บทบาท (Role)"
                                    onChange={handleChange}
                                    sx={{ borderRadius: 3 }}
                                >
                                    <MenuItem value="user">User (ลูกค้า)</MenuItem>
                                    <MenuItem value="admin">Admin (ผู้ดูเแล)</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
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
                                    <MenuItem value={true}>เปิดใช้งาน (Active)</MenuItem>
                                    <MenuItem value={false}>ปิดใช้งาน (Inactive)</MenuItem>
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
                        {user ? 'บันทึกการแก้ไข' : 'ยืนยันเพิ่มผู้ใช้งาน'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ModalAddEditUser;
