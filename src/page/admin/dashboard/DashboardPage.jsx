import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Checkbox,
    ListItemText,
    OutlinedInput,
    CircularProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Fade,
    Grow
} from '@mui/material';
import {
    TrendingUp,
    TrendingDown,
    AccountBalanceWallet,
    EventAvailable,
    People,
    Stars,
    FilterList,
    Assessment,
    AccessTime,
    CalendarMonth
} from '@mui/icons-material';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend,
    Cell
} from 'recharts';
import axios from 'axios';
import { useLogin } from '../../../store/loginStore';
import API_URL from '../../../config/api';
import './DashboardPage.css';

const DashboardPage = () => {
    const { user, token } = useLogin();
    const isAdmin = user?.user_role === 'admin';
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [branches, setBranches] = useState([]);

    // Filters
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const today = now.toISOString().split('T')[0];

    const [filters, setFilters] = useState({
        startDate: firstDayOfMonth,
        endDate: today,
        selectedBranchIds: (isAdmin && user?.branch_id) ? [user.branch_id] : []
    });


    // Premium Color Palette
    const COLORS = [
        '#6366f1', // Indigo
        '#10b981', // Emerald
        '#f59e0b', // Amber
        '#ef4444', // Rose
        '#06b6d4', // Cyan
        '#8b5cf6', // Violet
        '#ec4899', // Pink
        '#f97316'  // Orange
    ];

    useEffect(() => {
        fetchBranches();
    }, [token]);

    useEffect(() => {
        if (token) {
            fetchStats();
        }
    }, [filters, token]);

    const fetchBranches = async () => {
        try {
            const res = await axios.get(`${API_URL}/branch`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBranches(res.data.data);
        } catch (err) {
            console.error('Error fetching branches:', err);
        }
    };

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/dashboard/stats`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    startDate: filters.startDate,
                    endDate: filters.endDate,
                    branchIds: filters.selectedBranchIds.join(',')
                }
            });
            setData(res.data.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching stats:', err);
            setError('ไม่สามารถดึงข้อมูลสถิติได้ กรุณาลองใหม่อีกครั้ง');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const KPICard = ({ title, value, growth, icon, color, prefix = "", delay = 0 }) => (
        <Grow in={true} timeout={delay}>
            <Paper className="kpi-card" sx={{ '--card-color': color }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ position: 'relative', zIndex: 1 }}>
                    <Box>
                        <Typography className="kpi-label">{title}</Typography>
                        <Typography className="kpi-value">{prefix}{value.toLocaleString()}</Typography>
                    </Box>
                    <Box sx={{ 
                        backgroundColor: `${color}15`, 
                        p: 1.5, 
                        borderRadius: '16px',
                        color: color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {icon}
                    </Box>
                </Box>
                <Box className={`kpi-growth ${growth >= 0 ? 'growth-up' : 'growth-down'}`} sx={{ position: 'relative', zIndex: 1 }}>
                    {growth >= 0 ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
                    {Math.abs(growth).toFixed(1)}% <Typography variant="caption" sx={{ ml: 0.5, opacity: 0.8 }}>Vs รอบก่อน</Typography>
                </Box>
            </Paper>
        </Grow>
    );

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <Box className="recharts-custom-tooltip">
                    <Typography sx={{ fontWeight: 800, color: '#0f172a', mb: 1, fontSize: '0.9rem' }}>{label}</Typography>
                    {payload.map((entry, index) => (
                        <Box key={index} display="flex" alignItems="center" gap={1} sx={{ mb: 0.5 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: entry.color }} />
                            <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                                {entry.name}: <span style={{ color: '#1e293b' }}>{entry.value.toLocaleString()} {entry.name.includes('รายได้') ? '฿' : ''}</span>
                            </Typography>
                        </Box>
                    ))}
                </Box>
            );
        }
        return null;
    };

    const activeBranchNames = useMemo(() => {
        if (filters.selectedBranchIds.length === 0) return branches.map(b => b.branch_name);
        return branches.filter(b => filters.selectedBranchIds.includes(b.branch_id)).map(b => b.branch_name);
    }, [branches, filters.selectedBranchIds]);

    if (error) return <Box p={4}><Alert severity="error" sx={{ borderRadius: '16px' }}>{error}</Alert></Box>;

    return (
        <Box className="dashboard-container">
            {/* Background Aesthetic Blobs */}
            <Box sx={{ 
                position: 'fixed', top: '-10%', left: '-5%', width: '40%', height: '40%', 
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 70%)', zIndex: 0, pointerEvents: 'none' 
            }} />
            <Box sx={{ 
                position: 'fixed', bottom: '-10%', right: '-5%', width: '40%', height: '40%', 
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)', zIndex: 0, pointerEvents: 'none' 
            }} />

            <Fade in={true} timeout={800}>
                <Box className="dashboard-header">
                    <Typography className="dashboard-title">System Insights</Typography>
                    <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 500, mt: 1 }}>
                        บทวิเคราะห์ข้อมูลและสรุปผลการดำเนินงานแบบเรียลไทม์
                    </Typography>
                </Box>
            </Fade>

            {/* Filter Bar */}
            <Paper className="filter-card">
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} sm={3}>
                        <TextField
                            label="ช่วงเริ่มต้น"
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                            fullWidth
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            label="ช่วงสิ้นสุด"
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                            fullWidth
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <FormControl size="small" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}>
                            <InputLabel><Box display="flex" alignItems="center" gap={1}><FilterList fontSize="small" /> {isAdmin ? "สาขาที่ดูแล" : "เลือกสาขา"}</Box></InputLabel>
                            <Select
                                multiple={!isAdmin}
                                value={isAdmin ? (user?.branch_id ? [user.branch_id] : []) : filters.selectedBranchIds}
                                onChange={(e) => !isAdmin && handleFilterChange('selectedBranchIds', e.target.value)}
                                input={<OutlinedInput label={isAdmin ? "สาขาที่ดูแล" : "เลือกสาขา"} />}
                                disabled={isAdmin}
                                renderValue={(selected) => {
                                    if (isAdmin) {
                                        return branches.find(b => b.branch_id === user?.branch_id)?.branch_name || "กำลังโหลด...";
                                    }
                                    return selected.length === 0 ? "ทุกสาขาในระบบ" : 
                                    branches.filter(b => selected.includes(b.branch_id)).map(b => b.branch_name).join(', ');
                                }}
                            >
                                {!isAdmin && branches.map((branch) => (
                                    <MenuItem key={branch.branch_id} value={branch.branch_id}>
                                        <Checkbox checked={filters.selectedBranchIds.indexOf(branch.branch_id) > -1} />
                                        <ListItemText primary={branch.branch_name} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>


            {loading && !data ? (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={12}>
                    <CircularProgress thickness={5} size={60} sx={{ color: '#6366f1' }} />
                    <Typography sx={{ mt: 3, fontWeight: 600, color: '#64748b' }}>กำลังปรับปรุงข้อมูลของคุณ...</Typography>
                </Box>
            ) : data && (
                <>
                    {/* 1. KPI Sections */}
                    <Box className="kpi-grid">
                        <KPICard 
                            title="รายได้สุทธิทั้งหมด" 
                            value={data.summary.revenue.value} 
                            growth={data.summary.revenue.growth} 
                            icon={<AccountBalanceWallet fontSize="large" />}
                            color="#6366f1"
                            prefix="฿"
                            delay={400}
                        />
                        <KPICard 
                            title="จำนวนการจองสำเร็จ" 
                            value={data.summary.bookings.value} 
                            growth={data.summary.bookings.growth} 
                            icon={<EventAvailable fontSize="large" />}
                            color="#10b981"
                            delay={600}
                        />
                        <KPICard 
                            title="ลูกค้าที่แอคทีฟ" 
                            value={data.summary.users.value} 
                            growth={data.summary.users.growth} 
                            icon={<People fontSize="large" />}
                            color="#f59e0b"
                            delay={800}
                        />
                    </Box>

                    {/* Table Summary Breakdown */}
                    <Fade in={true} timeout={1000}>
                        <Box sx={{ mb: 6 }}>
                            <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                                <Assessment sx={{ color: '#6366f1' }} />
                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>Branch Statistics Breakdown</Typography>
                            </Box>
                            <TableContainer component={Paper} className="branch-stats-table">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>BRANCH NAME</TableCell>
                                            <TableCell align="right">REVENUE (THB)</TableCell>
                                            <TableCell align="right">BOOKINGS</TableCell>
                                            <TableCell align="right">SHARE %</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data.summary.branchBreakdown.map((row, index) => (
                                            <TableRow key={row.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[index % COLORS.length] }} />
                                                    {row.name}
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 800 }}>฿{row.revenue.toLocaleString()}</TableCell>
                                                <TableCell align="right">{row.bookings.toLocaleString()} sessions</TableCell>
                                                <TableCell align="right">
                                                    <Box sx={{ 
                                                        px: 1.5, py: 0.5, borderRadius: '8px', background: '#f1f5f9', 
                                                        display: 'inline-block', fontSize: '0.75rem', fontWeight: 700 
                                                    }}>
                                                        {((row.revenue / (data.summary.revenue.value || 1)) * 100).toFixed(1)}%
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </Fade>

                    {/* 2. Charts Grid */}
                    <Box className="charts-grid">
                        <Grow in={true} timeout={1200}>
                            <Box className="chart-card full-width">
                                <Typography className="chart-title">Revenue Dynamics</Typography>
                                <Box sx={{ width: '100%', height: 450 }}>
                                    <ResponsiveContainer>
                                        <AreaChart data={data.revenueTrend}>
                                            <defs>
                                                {branches.map((b, i) => (
                                                    <linearGradient key={b.branch_id} id={`color${i}`} x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.2}/>
                                                        <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0}/>
                                                    </linearGradient>
                                                ))}
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.5} />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '30px' }} />
                                            {activeBranchNames.map((name, i) => (
                                                <Area
                                                    key={name}
                                                    type="monotone"
                                                    dataKey={name}
                                                    name={name}
                                                    stroke={COLORS[i % COLORS.length]}
                                                    strokeWidth={4}
                                                    fillOpacity={1}
                                                    fill={`url(#color${i})`}
                                                />
                                            ))}
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </Box>
                            </Box>
                        </Grow>

                        <Grow in={true} timeout={1400}>
                            <Box className="chart-card full-width">
                                <Typography className="chart-title">Busiest Hours per Location</Typography>
                                <Box sx={{ width: '100%', height: 400 }}>
                                    <ResponsiveContainer>
                                        <BarChart data={data.peakHours} margin={{ top: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.5} />
                                            <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600 }} />
                                            <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
                                            <Legend verticalAlign="top" align="right" iconType="diamond" wrapperStyle={{ paddingBottom: '20px' }} />
                                            {activeBranchNames.map((name, i) => (
                                                <Bar key={name} dataKey={name} name={name} fill={COLORS[i % COLORS.length]} radius={[6, 6, 0, 0]} barSize={24} />
                                            ))}
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </Box>
                        </Grow>

                        <Grow in={true} timeout={1600}>
                            <Box className="chart-card">
                                <Typography className="chart-title">Market Share Ranking</Typography>
                                <Box sx={{ width: '100%', height: 350 }}>
                                    <ResponsiveContainer>
                                        <BarChart data={data.branchPerformance} layout="vertical" margin={{ left: 20, right: 30 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" opacity={0.5} />
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{ fontWeight: 800, fontSize: '0.8rem' }} />
                                            <Tooltip cursor={{fill: 'transparent'}} />
                                            <Bar dataKey="revenue" radius={[0, 15, 15, 0]} barSize={40} name="รายได้สะสม">
                                                {data.branchPerformance.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.9} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </Box>
                        </Grow>

                        <Grow in={true} timeout={1800}>
                            <Box className="chart-card">
                                <Typography className="chart-title">Daily Booking Intensity</Typography>
                                <Box sx={{ width: '100%', height: 350 }}>
                                    <ResponsiveContainer>
                                        <BarChart data={data.peakDays}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.5} />
                                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontWeight: 600 }} />
                                            <YAxis axisLine={false} tickLine={false} />
                                            <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
                                            <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '20px' }} />
                                            {activeBranchNames.map((name, i) => (
                                                <Bar key={name} dataKey={name} name={name} fill={COLORS[i % COLORS.length]} radius={[8, 8, 0, 0]} barSize={20} />
                                            ))}
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </Box>
                        </Grow>
                    </Box>
                </>
            )}
        </Box>
    );
};

export default DashboardPage;
