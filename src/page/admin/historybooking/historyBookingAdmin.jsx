import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useLogin } from "../../../store/loginStore";
import { useLoading } from "../../../store/loadingStore";
import API_URL from '../../../config/api';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Stack,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Search as SearchIcon,
    Refresh as RefreshIcon,
    FilterList as FilterIcon
} from '@mui/icons-material';
import { DataTable } from '../../../components';
import './historyBookingAdmin.css'

function HistoryBookingAdmin() {
    const { user, token } = useLogin()
    const { setIsLoading } = useLoading()

    const [rows, setRows] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Filters
    const [userName, setUserName] = useState('');
    const [branchId, setBranchId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [branches, setBranches] = useState([]);

    const fetchBranches = async () => {
        if (user?.user_role !== 'super admin') return;
        try {
            const res = await axios.get(`${API_URL}/branch`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBranches(res.data.data || []);
        } catch (error) {
            console.error("Error fetching branches:", error);
        }
    }

    const fetchHistoryBooking = async () => {
        setIsLoading(true)
        try {
            const res = await axios.get(`${API_URL}/booking/admin/history`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    page: page + 1,
                    pageSize: rowsPerPage,
                    user_name: userName || undefined,
                    branch_id: user?.user_role === 'admin' ? user?.branch_id : (branchId || undefined),
                    startDate: startDate || undefined,
                    endDate: endDate || undefined
                }
            });

            const data = res.data.data;
            const count = res.data.total || 0;

            setRows(data || []);
            setTotalCount(count);
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching admin history:", error);
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (token) {
            fetchBranches();
        }
    }, [token, user?.user_role]);

    useEffect(() => {
        if (token) {
            fetchHistoryBooking();
        }
    }, [page, rowsPerPage, token]);

    const handleSearch = () => {
        setPage(0);
        fetchHistoryBooking();
    };

    const handleClearFilters = () => {
        setUserName('');
        setBranchId('');
        setStartDate('');
        setEndDate('');
        setPage(0);
        // We'll let the second useEffect handle the fetch if page was > 0, 
        // otherwise we force it if it's already 0
        if (page === 0) fetchHistoryBooking();
    };

    const columns = [
        { id: 'index', label: 'No.', minWidth: 40, format: (value, row, index) => page * rowsPerPage + index + 1 },
        { id: 'user_name', label: 'ผู้จอง (User)', minWidth: 140, format: (value) => <strong>{value}</strong> },
        {
            id: 'created_at',
            label: 'วันเวลาที่จอง',

            minWidth: 140,
            format: (value) => value
                ? new Date(value).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })
                : '-'
        },
        { id: 'branch_name', label: 'สาขา (Branch)', minWidth: 120 },
        { id: 'court_name', label: 'สนาม (Court)', minWidth: 100 },
        {
            id: 'booking_date',
            label: 'วันที่ (Date)',
            minWidth: 100,
            format: (value) => new Date(value).toLocaleDateString('th-TH')
        },
        {
            id: 'start_time',
            label: 'เริ่ม',
            minWidth: 70,
            format: (value) => <span style={{ color: '#1976d2', fontWeight: 600 }}>{value}</span>
        },
        {
            id: 'end_time',
            label: 'สิ้นสุด',
            minWidth: 70,
            format: (value) => <span style={{ color: '#1976d2', fontWeight: 600 }}>{value}</span>
        },
        { id: 'duration_hours', label: 'ชม.', align: 'right', minWidth: 60 },
        {
            id: 'total_price',
            label: 'ราคารวม',
            align: 'right',
            minWidth: 100,
            format: (value) => <strong>{parseFloat(value).toLocaleString()} ฿</strong>
        },
        {
            id: 'status',
            label: 'สถานะ',
            minWidth: 110,
            align: 'center',
            format: (value) => {
                let cls = 'status-pending';
                if (value === 'Cancelled') cls = 'status-cancelled';
                else if (value === 'Confirmed') cls = 'status-confirmed';
                return <Box className={`status-badge ${cls}`}>{value}</Box>;
            }
        },
        { id: 'remake', label: 'หมายเหตุ', minWidth: 100 },

    ];

    return (
        <Box className="history-booking-admin-container">
            <Box className="admin-header">
                <Box className="admin-header-text">
                    <h1>ประวัติการจองทั้งหมด</h1>
                    <p>ตรวจสอบและจัดการประวัติการจองสนามแบดมินตันสำหรับ {user?.user_role === 'super admin' ? 'ทุกสาขา' : 'สาขาของคุณ'}</p>
                </Box>
            </Box>

            <Paper elevation={0} className="search-paper">
                <Box className="filter-header">
                    <FilterIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle2" sx={{ ml: 1, fontWeight: 700, color: '#1a237e' }}>
                        ตัวกรองข้อมูล
                    </Typography>
                </Box>

                <Box className="search-fields-container">
                    <Box className="search-input-group flex-2">
                        <Typography variant="caption" className="search-label">ชื่อผู้จอง</Typography>
                        <TextField
                            size="small"
                            placeholder="ค้นหาชื่อผู้ใช้งาน..."
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            fullWidth
                            className="search-text-field"
                        />
                    </Box>

                    {user?.user_role === 'super admin' && (
                        <Box className="search-input-group flex-2">
                            <Typography variant="caption" className="search-label">สาขา</Typography>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={branchId}
                                    onChange={(e) => setBranchId(e.target.value)}
                                    displayEmpty
                                    className="search-select"
                                >
                                    <MenuItem value="">ทุกสาขา</MenuItem>
                                    {branches.map((b) => (
                                        <MenuItem key={b.branch_id} value={b.branch_id}>
                                            {b.branch_name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    )}

                    <Box className="search-input-group flex-1">
                        <Typography variant="caption" className="search-label">จากวันที่</Typography>
                        <TextField
                            type="date"
                            size="small"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            fullWidth
                            className="search-date-field"
                        />
                    </Box>

                    <Box className="search-input-group flex-1">
                        <Typography variant="caption" className="search-label">ถึงวันที่</Typography>
                        <TextField
                            type="date"
                            size="small"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            fullWidth
                            className="search-date-field"
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
                        <Tooltip title="ล้างการกรอง">
                            <IconButton
                                onClick={handleClearFilters}
                                sx={{
                                    backgroundColor: '#f5f5f5',
                                    '&:hover': { backgroundColor: '#eeeeee' }
                                }}
                            >
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Box>
            </Paper>

            <Box className="table-wrapper">
                <DataTable
                    columns={columns}
                    rows={rows}
                    totalCount={totalCount}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    emptyMessage="ไม่พบข้อมูลการจองตามเงื่อนไขที่ระบุ"
                />
            </Box>
        </Box>
    )
}

export default HistoryBookingAdmin
