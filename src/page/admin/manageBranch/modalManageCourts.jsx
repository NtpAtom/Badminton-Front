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
    Typography,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Paper,
    InputAdornment,
    Tooltip,
    Tabs,
    Tab,
    Alert
} from '@mui/material';
import {
    Close as CloseIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    SportsTennis as CourtIcon,
    DynamicFeed as BulkIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useLogin } from '../../../store/loginStore';
import API_URL from '../../../config/api';

const ModalManageCourts = ({ open, handleClose, branch }) => {
    const { token } = useLogin();
    const [courts, setCourts] = useState([]);
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);

    // Single Add Form
    const [singleCourt, setSingleCourt] = useState({
        court_name: '',
        price_per_hour: 200,
        status: 'available'
    });

    // Bulk Add Form
    const [bulkCourts, setBulkCourts] = useState({
        prefix: 'Court',
        count: 1,
        start_number: 1,
        price_per_hour: 200
    });

    const fetchCourts = async () => {
        if (!branch) return;
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/court?branch_id=${branch.branch_id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourts(response.data.data || response.data);
        } catch (error) {
            console.error('Error fetching courts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open && branch) {
            fetchCourts();
        }
    }, [branch, open]);

    const handleSingleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/court/addCourt`, {
                ...singleCourt,
                branch_id: branch.branch_id
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSingleCourt({ ...singleCourt, court_name: '' });
            fetchCourts();
        } catch (error) {
            alert('Error adding court: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleBulkSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const promises = [];
            for (let i = 0; i < bulkCourts.count; i++) {
                const courtNum = parseInt(bulkCourts.start_number) + i;
                promises.push(
                    axios.post(`${API_URL}/court/addCourt`, {
                        court_name: `${bulkCourts.prefix} ${courtNum}`,
                        price_per_hour: bulkCourts.price_per_hour,
                        status: 'available',
                        branch_id: branch.branch_id
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                );
            }
            await Promise.all(promises);
            alert(`เพิ่ม ${bulkCourts.count} สนามเรียบร้อยแล้ว`);
            setTabValue(0); // Switch to list
            fetchCourts();
        } catch (error) {
            alert('Error bulk adding courts: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCourt = async (court_id) => {
        if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบสนามนี้?')) {
            try {
                await axios.delete(`${API_URL}/court/delete/${court_id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchCourts();
            } catch (error) {
                alert('Error deleting court: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 4, minHeight: '500px' }
            }}
        >
            <DialogTitle sx={{ m: 0, p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8fafc' }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>
                        จัดการสนาม - {branch?.branch_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        เพิ่ม ลบ หรือแก้ไขข้อมูลสนามภายในสาขานี้
                    </Typography>
                </Box>
                <IconButton onClick={handleClose} sx={{ bgcolor: '#fff' }}><CloseIcon /></IconButton>
            </DialogTitle>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{
                    '.MuiTab-root': { fontWeight: 700, textTransform: 'none', py: 2 },
                    '.Mui-selected': { color: '#4F46E5 !important' },
                    '.MuiTabs-indicator': { backgroundColor: '#4F46E5' }
                }}>
                    <Tab icon={<CourtIcon sx={{ mr: 1 }} />} iconPosition="start" label="รายการสนาม" />
                    <Tab icon={<AddIcon sx={{ mr: 1 }} />} iconPosition="start" label="เพิ่มทีละสนาม" />
                    <Tab icon={<BulkIcon sx={{ mr: 1 }} />} iconPosition="start" label="เพิ่มครั้งละหลายสนาม" />
                </Tabs>
            </Box>

            <DialogContent sx={{ p: 0 }}>
                {tabValue === 0 && (
                    <Box sx={{ p: 3 }}>
                        {courts.length === 0 ? (
                            <Box sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
                                <CourtIcon sx={{ fontSize: 60, opacity: 0.2, mb: 2 }} />
                                <Typography>ยังไม่มีการเพิ่มสนามในสาขานี้</Typography>
                            </Box>
                        ) : (
                            <Grid container spacing={2}>
                                {courts.map((court) => (
                                    <Grid item xs={12} sm={6} key={court.court_id}>
                                        <Paper variant="outlined" sx={{
                                            p: 2,
                                            borderRadius: 3,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            transition: 'all 0.2s',
                                            '&:hover': { borderColor: '#4F46E5', bgcolor: '#f5f7ff' }
                                        }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Box sx={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: 2,
                                                    bgcolor: '#e0e7ff',
                                                    color: '#4338ca',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <CourtIcon />
                                                </Box>
                                                <Box>
                                                    <Typography sx={{ fontWeight: 700 }}>{court.court_name}</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        ราคา {court.price_per_hour} บาท/ชม.
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDeleteCourt(court.court_id)}
                                                sx={{ color: '#ef4444', bgcolor: '#fef2f2' }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                )}

                {tabValue === 1 && (
                    <Box sx={{ p: 4 }}>
                        <form onSubmit={handleSingleSubmit}>
                            <Typography sx={{ mb: 3, fontWeight: 700 }}>ข้อมูลสนามใหม่</Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="ชื่อสนาม"
                                        placeholder="เช่น A1, สนาม 1"
                                        value={singleCourt.court_name}
                                        onChange={(e) => setSingleCourt({ ...singleCourt, court_name: e.target.value })}
                                        required
                                        InputProps={{ sx: { borderRadius: 3 } }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="ราคาต่อชั่วโมง"
                                        value={singleCourt.price_per_hour}
                                        onChange={(e) => setSingleCourt({ ...singleCourt, price_per_hour: e.target.value })}
                                        InputProps={{
                                            sx: { borderRadius: 3 },
                                            endAdornment: <InputAdornment position="end">บาท</InputAdornment>
                                        }}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        fullWidth
                                        size="large"
                                        sx={{
                                            borderRadius: 3,
                                            py: 1.5,
                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                            fontWeight: 700
                                        }}
                                    >
                                        เพิ่มสนาม
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    </Box>
                )}

                {tabValue === 2 && (
                    <Box sx={{ p: 4 }}>
                        <Alert severity="info" sx={{ mb: 4, borderRadius: 3 }}>
                            ระบบจะสร้างสนามโดยใช้ <b>คำนำหน้า</b> ตามด้วย <b>ลำดับตัวเลข</b> ตามจำนวนที่ระบุ
                        </Alert>
                        <form onSubmit={handleBulkSubmit}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="คำนำหน้าชื่อสนาม"
                                        value={bulkCourts.prefix}
                                        onChange={(e) => setBulkCourts({ ...bulkCourts, prefix: e.target.value })}
                                        required
                                        InputProps={{ sx: { borderRadius: 3 } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="เริ่มที่หมายเลข"
                                        value={bulkCourts.start_number}
                                        onChange={(e) => setBulkCourts({ ...bulkCourts, start_number: e.target.value })}
                                        required
                                        InputProps={{ sx: { borderRadius: 3 } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="จำนวนสนามที่ต้องการเพิ่ม"
                                        value={bulkCourts.count}
                                        onChange={(e) => setBulkCourts({ ...bulkCourts, count: e.target.value })}
                                        required
                                        InputProps={{ sx: { borderRadius: 3 } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="ราคาต่อชั่วโมง (ทุกสนาม)"
                                        value={bulkCourts.price_per_hour}
                                        onChange={(e) => setBulkCourts({ ...bulkCourts, price_per_hour: e.target.value })}
                                        required
                                        InputProps={{
                                            sx: { borderRadius: 3 },
                                            endAdornment: <InputAdornment position="end">บาท</InputAdornment>
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        fullWidth
                                        size="large"
                                        disabled={loading}
                                        sx={{
                                            borderRadius: 3,
                                            py: 1.5,
                                            background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                                            fontWeight: 700
                                        }}
                                    >
                                        {loading ? 'กำลังสร้างสนาม...' : 'เริ่มสร้างหลายสนามแบบอัตโนมัติ'}
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    </Box>
                )}
            </DialogContent>

            <Divider />
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={handleClose} variant="outlined" sx={{ borderRadius: 3, fontWeight: 700 }}>
                    ปิดหน้าต่าง
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalManageCourts;
