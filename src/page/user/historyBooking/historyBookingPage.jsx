import React, { useEffect, useState } from 'react'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import axios from 'axios'
import { useLogin } from "../../../store/loginStore";
import { useLoading } from "../../../store/loadingStore";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SearchIcon from '@mui/icons-material/Search';
import TablePagination from '@mui/material/TablePagination';
import Typography from '@mui/material/Typography';

import RefreshIcon from '@mui/icons-material/Refresh';
import Stack from '@mui/material/Stack';

function historyBookingPage() {
    const { user, token } = useLogin()
    const { setIsLoading } = useLoading()
    const [rows, setRows] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Using a intermediate state to sync data with loading animation
    const [displayRows, setDisplayRows] = useState([]);

    // ฟังก์ชันหลักสำหรับดึงข้อมูลประวัติการจองจาก API
    const fetchHistoryBooking = async () => {
        setIsLoading(true)
        try {
            const res = await axios.get("http://localhost:3000/api/booking", {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    page: page + 1,
                    pageSize: rowsPerPage,
                    startDate: startDate || undefined,
                    endDate: endDate || undefined
                }
            });

            const data = res.data.data;
            const count = res.data.total || 0;

            // Wait until the transition backdrop is fully up before showing data
            setTimeout(() => {
                setRows(data);
                setDisplayRows(data);
                setTotalCount(count);
                setIsLoading(false);
            }, 500);
        } catch (error) {
            console.log(error);
            setIsLoading(false);
        }
    }

    // เรียกดึงข้อมูลเมื่อมีการเปลี่ยนหน้า (Page) หรือจำนวนแถวต่อหน้า (RowsPerPage)
    useEffect(() => {
        fetchHistoryBooking()
    }, [page, rowsPerPage])

    // ฟังก์ชันสำหรับกดปุ่ม "ค้นหา" - จะรีเซ็ตกลับไปหน้าแรกสุด
    const handleSearch = () => {
        setPage(0);
        fetchHistoryBooking();
    };

    // ฟังก์ชันสำหรับ "ล้างค่า" - ล้างเฉพาะฟิลเตอร์วันที่ แต่คงค่า Pagination เดิมไว้
    const handleClearAndFetch = () => {
        setStartDate('');
        setEndDate('');
        // User requested NOT to clear pagination (page) when clearing filters

        const fetchCleared = async () => {
            setIsLoading(true)
            try {
                const res = await axios.get("http://localhost:3000/api/booking", {
                    headers: { Authorization: `Bearer ${token}` },
                    params: {
                        page: page + 1, // Use current page instead of forcing page 1
                        pageSize: rowsPerPage
                    }
                });
                const data = res.data.data;
                const count = res.data.total || 0;

                setTimeout(() => {
                    setRows(data);
                    setDisplayRows(data);
                    setTotalCount(count);
                    setIsLoading(false);
                }, 500);
            } catch (error) {
                console.log(error);
                setIsLoading(false);
            }
        }
        fetchCleared();
    };

    // ฟังก์ชันจัดการเมื่อผู้ใช้เปลี่ยนหน้าตาราง
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    // ฟังก์ชันจัดการเมื่อผู้ใช้เปลี่ยนจำนวนแถวที่ต้องการแสดงต่อหน้า
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Box sx={{
            width: '100%',
            p: { xs: 1, md: 0 },
            maxWidth: 'lg',
            mx: 'auto',
            height: { md: 'calc(100vh - 120px)', xs: 'auto' }, // Fix height on desktop to enable internal scroll
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden' // Prevent whole page scroll on desktop
        }}>
            {/* Minimal & Compact Search Bar */}
            <Box sx={{ flexShrink: 0 }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 2, md: 2.5 },
                        mb: 2.5,
                        borderRadius: 3,
                        boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
                        border: '1px solid #eee',
                        backgroundColor: '#fff'
                    }}
                >
                    <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 700, color: '#333' }}>
                        ค้นหาประวัติการจอง
                    </Typography>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: { xs: 'stretch', md: 'flex-end' },
                        gap: 2
                    }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flex: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: '#999', ml: 0.5 }}>จากวันที่</Typography>
                            <TextField
                                type="date"
                                size="small"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                fullWidth
                                sx={{ '& .MuiInputBase-root': { borderRadius: '8px', backgroundColor: '#fcfcfc' } }}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flex: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: '#999', ml: 0.5 }}>ถึงวันที่</Typography>
                            <TextField
                                type="date"
                                size="small"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                fullWidth
                                sx={{ '& .MuiInputBase-root': { borderRadius: '8px', backgroundColor: '#fcfcfc' } }}
                            />
                        </Box>
                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{
                                mt: { xs: 1, md: 0 },
                                width: { xs: '100%', md: 'auto' }
                            }}
                        >
                            <Button
                                variant="contained"
                                startIcon={<SearchIcon />}
                                onClick={handleSearch}
                                sx={{
                                    textTransform: 'none',
                                    px: 3.5,
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    py: { xs: 1, md: 0.8 },
                                    flex: { xs: 1, md: 'none' }
                                }}
                            >
                                ค้นหา
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<RefreshIcon />}
                                onClick={handleClearAndFetch}
                                sx={{
                                    textTransform: 'none',
                                    px: 2,
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    color: '#777',
                                    borderColor: '#e0e0e0',
                                    flex: { xs: 1, md: 'none' },
                                    '&:hover': { borderColor: '#ccc', backgroundColor: '#f9f9f9' }
                                }}
                            >
                                ล้างค่า
                            </Button>
                        </Stack>
                    </Box>
                </Paper>
            </Box>

            {/* --- ส่วนแสดงตารางข้อมูล (Table Area) --- */}
            <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', mb: 2 }}>
                <Paper
                    elevation={0}
                    sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: 0,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                        borderRadius: 4,
                        overflow: 'hidden',
                        border: '1px solid #f0f0f0'
                    }}
                >
                    <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
                        <Table sx={{ minWidth: 850 }} aria-label="premium booking table" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ background: 'linear-gradient(90deg, #1976d2 0%, #1565c0 100%)', color: 'white', fontWeight: 700, py: 2, whiteSpace: 'nowrap', zIndex: 10 }}>No.</TableCell>
                                    <TableCell sx={{ background: '#1565c0', color: 'white', fontWeight: 700, whiteSpace: 'nowrap', zIndex: 10 }}>สาขา (Branch)</TableCell>
                                    <TableCell sx={{ background: '#1565c0', color: 'white', fontWeight: 700, whiteSpace: 'nowrap', zIndex: 10 }}>สนาม (Court)</TableCell>
                                    <TableCell align="right" sx={{ background: '#1565c0', color: 'white', fontWeight: 700, whiteSpace: 'nowrap', zIndex: 10 }}>วันที่ (Date)</TableCell>
                                    <TableCell align="right" sx={{ background: '#1565c0', color: 'white', fontWeight: 700, whiteSpace: 'nowrap', zIndex: 10 }}>เริ่ม</TableCell>
                                    <TableCell align="right" sx={{ background: '#1565c0', color: 'white', fontWeight: 700, whiteSpace: 'nowrap', zIndex: 10 }}>สิ้นสุด</TableCell>
                                    <TableCell align="right" sx={{ background: '#1565c0', color: 'white', fontWeight: 700, whiteSpace: 'nowrap', zIndex: 10 }}>ชั่วโมง</TableCell>
                                    <TableCell align="right" sx={{ background: '#1565c0', color: 'white', fontWeight: 700, whiteSpace: 'nowrap', zIndex: 10 }}>ราคารวม</TableCell>
                                    <TableCell align="right" sx={{ background: 'linear-gradient(90deg, #1565c0 0%, #0d47a1 100%)', color: 'white', fontWeight: 700, whiteSpace: 'nowrap', zIndex: 10 }}>สถานะ</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {displayRows.length > 0 ? displayRows.map((row, index) => (
                                    <TableRow
                                        key={row.booking_id}
                                        sx={{
                                            '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.02)' },
                                            transition: 'background-color 0.15s'
                                        }}
                                    >
                                        <TableCell sx={{ color: '#888', fontWeight: 600 }}>{page * rowsPerPage + index + 1}</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: '#444' }}>{row.branch_name}</TableCell>
                                        <TableCell>{row.court_name}</TableCell>
                                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{new Date(row.booking_date).toLocaleDateString()}</TableCell>
                                        <TableCell align="right" sx={{ color: '#1976d2', fontWeight: 600 }}>{row.start_time}</TableCell>
                                        <TableCell align="right" sx={{ color: '#1976d2', fontWeight: 600 }}>{row.end_time}</TableCell>
                                        <TableCell align="right">{row.duration_hours}</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, color: '#333', whiteSpace: 'nowrap' }}>{row.total_price} บาท</TableCell>
                                        <TableCell align="right">
                                            <Box sx={{
                                                display: 'inline-flex',
                                                px: 1.5,
                                                py: 0.5,
                                                borderRadius: '12px',
                                                fontSize: '0.7rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                backgroundColor: row.status === 'Pending' ? '#fff4e5' : '#edf7ed',
                                                color: row.status === 'Pending' ? '#b26a00' : '#2e7d32',
                                                fontWeight: 800,
                                                border: `1px solid ${row.status === 'Pending' ? '#ffe2bc' : '#d1eed1'}`,
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {row.status}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center" sx={{ py: 10 }}>
                                            <Box sx={{ opacity: 0.5, textAlign: 'center' }}>
                                                <SearchIcon sx={{ fontSize: 40, mb: 1, color: '#ccc' }} />
                                                <Typography variant="body1" sx={{ color: '#999' }}>ไม่พบข้อมูลการจองในช่วงเวลานี้</Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={totalCount}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        sx={{
                            borderTop: '1px solid #f0f0f0',
                            backgroundColor: '#fafafa',
                            flexShrink: 0,
                            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': { color: '#888', fontWeight: 600 }
                        }}
                    />
                </Paper>
            </Box>
        </Box>
    )
}

export default historyBookingPage





