import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useLogin } from "../../../store/loginStore";
import { useLoading } from "../../../store/loadingStore";
import API_URL from '../../../config/api';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SearchIcon from '@mui/icons-material/Search';
import Typography from '@mui/material/Typography';
import RefreshIcon from '@mui/icons-material/Refresh';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import { DataTable } from '../../../components';
import './historyBookingPage.css'

function historyBookingPage() {
    const { user, token } = useLogin()
    const { setIsLoading } = useLoading()
    const [rows, setRows] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [displayRows, setDisplayRows] = useState([]);

    const fetchHistoryBooking = async () => {
        setIsLoading(true)
        try {
            const res = await axios.get(`${API_URL}/booking`, {
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
            console.log(data);

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

    useEffect(() => {
        fetchHistoryBooking()
    }, [page, rowsPerPage])

    const handleSearch = () => {
        setPage(0);
        fetchHistoryBooking();
    };

    const handleClearAndFetch = () => {
        setStartDate('');
        setEndDate('');

        const fetchCleared = async () => {
            setIsLoading(true)
            try {
                const res = await axios.get(`${API_URL}/booking`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: {
                        page: page + 1,
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

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const columns = [
        { id: 'index', label: 'No.', minWidth: 40, format: (value, row, index) => page * rowsPerPage + index + 1 }, {
            id: 'created_at',
            label: 'วันเวลาที่จอง',

            minWidth: 140,
            format: (value) => value
                ? new Date(value).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })
                : '-'
        },
        { id: 'branch_name', label: 'สาขา (Branch)', minWidth: 120, format: (value) => <strong>{value}</strong> },
        { id: 'court_name', label: 'สนาม (Court)', minWidth: 100 },
        { id: 'booking_date', label: 'วันที่จอง', align: 'right', minWidth: 110, format: (value) => new Date(value).toLocaleDateString('th-TH') },
        { id: 'start_time', label: 'เริ่ม', align: 'right', minWidth: 70, format: (value) => <span style={{ color: '#1976d2', fontWeight: 600 }}>{value}</span> },
        { id: 'end_time', label: 'สิ้นสุด', align: 'right', minWidth: 70, format: (value) => <span style={{ color: '#1976d2', fontWeight: 600 }}>{value}</span> },
        { id: 'duration_hours', label: 'ชั่วโมง', align: 'right', minWidth: 70 },
        { id: 'total_price', label: 'ราคารวม', align: 'right', minWidth: 100, format: (value) => <strong>{parseFloat(value).toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท</strong> },
        {
            id: 'status',
            label: 'สถานะ',
            align: 'center',
            minWidth: 110,
            format: (value) => {
                let cls = 'status-pending';
                if (value === 'Completed') cls = 'status-completed';
                else if (value === 'Cancelled') cls = 'status-cancelled';
                return <Box className={`status-badge ${cls}`}>{value}</Box>;
            }
        },
        { id: 'remake', label: 'หมายเหตุ', minWidth: 100 },

    ];

    return (
        <Box className="history-booking-container">
            <div className="profile-header">
                <h1>ประวัติการจอง</h1>
                <p>ตรวจสอบและจัดการประวัติการเข้าใช้งานสนามของคุณ</p>
            </div>

            {/* Minimal & Compact Search Bar */}
            <Paper elevation={0} className="search-paper">
                <Typography variant="subtitle1" className="search-title">
                    ค้นหาประวัติการจอง
                </Typography>
                <Box className="search-fields-container">
                    <Box className="search-input-group">
                        <Typography variant="caption" className="search-label">จากวันที่</Typography>
                        <TextField
                            type="date"
                            size="small"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            fullWidth
                            className="search-text-field"
                        />
                    </Box>
                    <Box className="search-input-group">
                        <Typography variant="caption" className="search-label">ถึงวันที่</Typography>
                        <TextField
                            type="date"
                            size="small"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            fullWidth
                            className="search-text-field"
                        />
                    </Box>
                    <Stack direction="row" spacing={1} className="search-actions">
                        <Button
                            variant="contained"
                            startIcon={<SearchIcon />}
                            onClick={handleSearch}
                            className="btn-search"
                        >
                            ค้นหา
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={handleClearAndFetch}
                            className="btn-clear"
                        >
                            ล้างค่า
                        </Button>
                    </Stack>
                </Box>
            </Paper>

            <Box className="table-wrapper">
                <DataTable
                    columns={columns}
                    rows={displayRows}
                    totalCount={totalCount}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    emptyMessage="ไม่พบข้อมูลการจองในช่วงเวลานี้"
                />
            </Box>
        </Box>
    )
}

export default historyBookingPage
