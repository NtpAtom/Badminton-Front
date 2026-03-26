import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TablePagination from '@mui/material/TablePagination';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import './DataTable.css';

const DataTable = ({
    columns,
    rows,
    totalCount,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    loading = false,
    emptyMessage = "ไม่พบข้อมูล"
}) => {
    return (
        <Paper elevation={0} className="data-table-paper">
            <TableContainer className="data-table-container">
                <Table stickyHeader aria-label="data table">
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    align={column.align || 'left'}
                                    style={{ minWidth: column.minWidth }}
                                    className="data-table-header-cell"
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.length > 0 ? (
                            rows.map((row, index) => (
                                <TableRow hover key={row.booking_id || row.id || index} className="data-table-row">
                                    {columns.map((column) => {
                                        const value = row[column.id];
                                        return (
                                            <TableCell key={column.id} align={column.align} className="data-table-cell">
                                                {column.format ? column.format(value, row, index) : value}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} align="center" className="data-table-empty-cell">
                                    {!loading && (
                                        <Box className="data-table-empty-box">
                                            <SearchIcon className="data-table-empty-icon" />
                                            <Typography variant="body1">{emptyMessage}</Typography>
                                        </Box>
                                    )}
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
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
                className="data-table-pagination"
            />
        </Paper>
    );
};

export default DataTable;
