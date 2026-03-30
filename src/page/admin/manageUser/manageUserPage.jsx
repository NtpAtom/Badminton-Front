import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Stack, IconButton, Tooltip } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';
import { DataTable } from '../../../components';
import ModalAddEditUser from './modalAddEditUser';
import './manageUserPage.css';
import axios from 'axios';
import { useLogin } from '../../../store/loginStore';


function manageUserPage() {
    const [rows, setRows] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [totalCount, setTotalCount] = useState(0);
    const { user, token } = useLogin()

    const fetchUser = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/user', {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    page: page + 1,
                    pageSize: rowsPerPage,
                    search: searchQuery
                }
            });

            // Data is already filtered by the backend based on user role
            setRows(response.data.data);
            setTotalCount(response.data.total || 0);
            console.log("Server response:", response.data);

        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    useEffect(() => {
        if (token) {
            fetchUser();
        }
    }, [page, rowsPerPage, token])

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setPage(0);
        if (page === 0) fetchUser();
    };

    const handleAddClick = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (user_id) => {
        if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งานนี้?')) {
            try {
                await axios.delete(`http://localhost:3000/api/user/delete/${user_id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('ลบผู้ใช้งานเรียบร้อยแล้ว');
                fetchUser();
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('เกิดข้อผิดพลาดในการลบผู้ใช้งาน: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        fetchUser();
    };


    const columns = [
        { id: 'index', label: 'No.', minWidth: 50, format: (value, row, index) => page * rowsPerPage + index + 1 },
        {
            id: 'user_name',
            label: 'ชื่อ-นามสกุล',
            minWidth: 150,
            format: (value) => <strong>{value}</strong>
        },
        { id: 'user_email', label: 'อีเมล', minWidth: 150 },
        { id: 'user_phone', label: 'เบอร์โทร', minWidth: 120 },
        {
            id: 'user_role',
            label: 'บทบาท',
            minWidth: 100,
            format: (value) => (
                <span className={`role-badge role-${value}`}>
                    {value === 'super admin' ? 'ผู้ดูแลระบบ (Super Admin)' : (value === 'admin' ? 'ผู้จัดการ (Admin)' : 'ลูกค้า (User)')}
                </span>
            )
        },
        {
            id: 'is_active',
            label: 'สถานะ',
            minWidth: 100,
            format: (value) => (
                <Box className={`status-badge ${value ? 'status-active' : 'status-inactive'}`}>
                    {value ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                </Box>
            )
        },
        {
            id: 'actions',
            label: 'การจัดการ',
            minWidth: 120,
            align: 'right',
            format: (_, row) => (
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Tooltip title="แก้ไข">
                        <IconButton size="small" onClick={() => handleEditClick(row)} className="btn-edit">
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="ลบ">
                        <IconButton size="small" onClick={() => handleDeleteClick(row.user_id)} className="btn-delete">
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            )
        }
    ];

    return (
        <Box className="manage-user-container">
            <Box className="admin-header">
                <Box className="admin-header-text">
                    <h1>จัดการผู้ใช้งาน</h1>
                    <p>ค้นหา เพิ่ม แก้ไข และลบข้อมูลผู้เข้าใช้งานในระบบ</p>
                </Box>
                {user?.user_role === 'super admin' && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddClick}
                        className="btn-add-user"
                    >
                        เพิ่มผู้ใช้งานใหม่
                    </Button>
                )}
            </Box>

            <Paper elevation={0} className="search-paper">
                <Box className="search-fields-container">
                    <Box className="search-input-group">
                        <TextField
                            size="small"
                            placeholder="ค้นหาชื่อ หรืออีเมล..."
                            value={searchQuery}
                            onChange={handleSearch}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    setPage(0);
                                    fetchUser();
                                }
                            }}
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
                    emptyMessage="ไม่พบข้อมูลผู้ใช้งาน"
                />
            </Box>

            <ModalAddEditUser
                open={isModalOpen}
                handleClose={handleCloseModal}
                user={selectedUser}
            />
        </Box>
    );
}

export default manageUserPage;