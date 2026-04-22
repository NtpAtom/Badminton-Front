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
import axios from 'axios';
import { useLogin } from '../../../store/loginStore';
import API_URL from '../../../config/api';

const ModalAddEditBranch = ({ open, handleClose, branch }) => {
    const { token } = useLogin();
    const [formData, setFormData] = useState({
        branch_name: '',
        branch_address: '',
        open_time: '08:00',
        close_time: '22:00',
        is_active: true
    });

    useEffect(() => {
        if (open) {
            if (branch) {
                setFormData({
                    branch_name: branch.branch_name || '',
                    branch_address: branch.branch_address || '',
                    open_time: branch.open_time || '08:00',
                    close_time: branch.close_time || '22:00',
                    is_active: branch.is_active ?? true
                });
            } else {
                setFormData({
                    branch_name: '',
                    branch_address: '',
                    open_time: '08:00',
                    close_time: '22:00',
                    is_active: true
                });
            }
        }
    }, [branch, open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (branch) {
                // Update
                await axios.put(`${API_URL}/branch/update/${branch.branch_id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('แก้ไขข้อมูลสาขาเรียบร้อยแล้ว');
            } else {
                // Add
                await axios.post(`${API_URL}/branch/add`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('เพิ่มสาขาใหม่เรียบร้อยแล้ว');
            }
            handleClose();
        } catch (error) {
            console.error('Error saving branch:', error);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + (error.response?.data?.message || error.message));
        }
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
                        {branch ? 'แก้ไขข้อมูลสาขา' : 'เพิ่มสาขาใหม่'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        กรุณากรอกข้อมูลสาขาและเวลาทำการให้ครบถ้วน
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
                                label="ชื่อสาขา"
                                name="branch_name"
                                value={formData.branch_name}
                                onChange={handleChange}
                                fullWidth
                                required
                                placeholder="เช่น สาขารามอินทรา"
                                InputProps={{ sx: { borderRadius: 3 } }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="ที่อยู่สาขา"
                                name="branch_address"
                                value={formData.branch_address}
                                onChange={handleChange}
                                fullWidth
                                required
                                multiline
                                rows={2}
                                placeholder="กรอกที่อยู่โดยละเอียด..."
                                InputProps={{ sx: { borderRadius: 3 } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="เวลาเปิด"
                                name="open_time"
                                type="time"
                                value={formData.open_time}
                                onChange={handleChange}
                                fullWidth
                                required
                                InputLabelProps={{ shrink: true }}
                                InputProps={{ sx: { borderRadius: 3 } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="เวลาปิด"
                                name="close_time"
                                type="time"
                                value={formData.close_time}
                                onChange={handleChange}
                                fullWidth
                                required
                                InputLabelProps={{ shrink: true }}
                                InputProps={{ sx: { borderRadius: 3 } }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>สถานะการเปิดบริการ</InputLabel>
                                <Select
                                    name="is_active"
                                    value={formData.is_active}
                                    label="สถานะการเปิดบริการ"
                                    onChange={handleChange}
                                    sx={{ borderRadius: 3 }}
                                >
                                    <MenuItem value={true}>เปิดบริการ (Active)</MenuItem>
                                    <MenuItem value={false}>ปิดบริการชั่วคราว (Inactive)</MenuItem>
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
                            background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #3730a3 0%, #312e81 100%)',
                            }
                        }}
                    >
                        {branch ? 'บันทึกการแก้ไข' : 'ยืนยันเพิ่มสาขา'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ModalAddEditBranch;
