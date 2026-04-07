import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Stack, IconButton, Tooltip } from '@mui/material';
import { 
    Add as AddIcon, 
    Edit as EditIcon, 
    Delete as DeleteIcon, 
    Search as SearchIcon,
    SportsTennis as CourtIcon 
} from '@mui/icons-material';
import { DataTable } from '../../../components';
import ModalAddEditBranch from './modalAddEditBranch';
import ModalManageCourts from './modalManageCourts';
import './manageBranchPage.css';
import axios from 'axios';
import { useLogin } from '../../../store/loginStore';

function manageBranchPage() {
    const [rows, setRows] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
    const [isCourtModalOpen, setIsCourtModalOpen] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [totalCount, setTotalCount] = useState(0);
    const { token, user } = useLogin();

    const fetchBranches = async () => {
        try {
            // Updated to use search and pagination if backend supports it
            // Based on branchController, it currently returns all
            const response = await axios.get('http://localhost:3000/api/branch', {
                headers: { Authorization: `Bearer ${token}` }
            });

            let data = response.data.data || response.data;
            
            // Local filtering for now if backend doesn't support search
            if (searchQuery) {
                data = data.filter(item => 
                    item.branch_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.branch_address.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }

            setTotalCount(data.length);
            
            // Pagination
            const start = page * rowsPerPage;
            const end = start + rowsPerPage;
            setRows(data.slice(start, end));

        } catch (error) {
            console.error('Error fetching branches:', error);
        }
    };

    useEffect(() => {
        if (token) {
            fetchBranches();
        }
    }, [page, rowsPerPage, token, searchQuery]);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setPage(0);
    };

    const handleAddBranchClick = () => {
        setSelectedBranch(null);
        setIsBranchModalOpen(true);
    };

    const handleEditBranchClick = (branch) => {
        setSelectedBranch(branch);
        setIsBranchModalOpen(true);
    };

    const handleManageCourtsClick = (branch) => {
        setSelectedBranch(branch);
        setIsCourtModalOpen(true);
    };

    const handleDeleteBranchClick = async (branch_id) => {
        if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบสาขานี้? การลบสาขาจะทำให้ข้อมูลสนามทั้งหมดในสาขานี้ถูกลบไปด้วย')) {
            try {
                await axios.delete(`http://localhost:3000/api/branch/delete/${branch_id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('ลบสาขาเรียบร้อยแล้ว');
                fetchBranches();
            } catch (error) {
                console.error('Error deleting branch:', error);
                alert('เกิดข้อผิดพลาดในการลบสาขา: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const handleCloseBranchModal = () => {
        setIsBranchModalOpen(false);
        fetchBranches();
    };

    const handleCloseCourtModal = () => {
        setIsCourtModalOpen(false);
        fetchBranches();
    };

    const columns = [
        { id: 'index', label: 'No.', minWidth: 50, format: (value, row, index) => page * rowsPerPage + index + 1 },
        {
            id: 'branch_name',
            label: 'ชื่อสาขา',
            minWidth: 150,
            format: (value) => <span className="branch-name">{value}</span>
        },
        { 
            id: 'branch_address', 
            label: 'ที่อยู่', 
            minWidth: 200,
            format: (value) => <Tooltip title={value}><span className="branch-address">{value}</span></Tooltip>
        },
        { 
            id: 'time', 
            label: 'เวลาเปิด-ปิด', 
            minWidth: 120,
            format: (_, row) => `${row.open_time} - ${row.close_time}`
        },
        {
            id: 'is_active',
            label: 'สถานะ',
            minWidth: 100,
            format: (value) => (
                <Box className={`status-badge ${value ? 'status-active' : 'status-inactive'}`}>
                    {value ? 'เปิดบริการ' : 'ปิดบริการ'}
                </Box>
            )
        },
        {
            id: 'actions',
            label: 'การจัดการ',
            minWidth: 180,
            align: 'right',
            format: (_, row) => (
                <Stack direction="row" spacing={1} justifyContent="flex-end" className="action-buttons">
                    <Tooltip title="จัดการสนาม">
                        <IconButton size="small" onClick={() => handleManageCourtsClick(row)} className="btn-action btn-manage-courts">
                            <CourtIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="แก้ไขสาขา">
                        <IconButton size="small" onClick={() => handleEditBranchClick(row)} className="btn-action btn-edit">
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    {user?.user_role === 'super admin' && (
                        <Tooltip title="ลบสาขา">
                            <IconButton size="small" onClick={() => handleDeleteBranchClick(row.branch_id)} className="btn-action btn-delete">
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Stack>
            )
        }
    ];

    return (
        <Box className="manage-branch-container">
            <Box className="admin-header">
                <Box className="admin-header-text">
                    <h1>จัดการสาขา</h1>
                    <p>กำหนดข้อมูลสถานที่ เวลาทำการ และจัดการสนามแบดมินตันในแต่ละสาขา</p>
                </Box>
                {user?.user_role === 'super admin' && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddBranchClick}
                        className="btn-add-branch"
                    >
                        เพิ่มสาขาใหม่
                    </Button>
                )}
            </Box>

            <Paper elevation={0} className="search-paper">
                <Box className="search-fields-container">
                    <Box className="search-input-group">
                        <TextField
                            size="small"
                            placeholder="ค้นหาชื่อสาขา หรือที่อยู่..."
                            value={searchQuery}
                            onChange={handleSearch}
                            fullWidth
                            className="search-text-field"
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                            }}
                        />
                    </Box>
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
                    emptyMessage="ไม่พบข้อมูลสาขา"
                />
            </Box>

            {isBranchModalOpen && (
                <ModalAddEditBranch
                    open={isBranchModalOpen}
                    handleClose={handleCloseBranchModal}
                    branch={selectedBranch}
                />
            )}

            {isCourtModalOpen && (
                <ModalManageCourts
                    open={isCourtModalOpen}
                    handleClose={handleCloseCourtModal}
                    branch={selectedBranch}
                />
            )}
        </Box>
    );
}

export default manageBranchPage;
