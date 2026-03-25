import React from 'react'
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { useLoading } from '../store/loadingStore';

const Loading = () => {
    const { isLoading } = useLoading();
    return (
        <Backdrop
            sx={{ color: '#646cff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={isLoading}
        >
            <CircularProgress color="inherit" />
        </Backdrop>
    )
}

export default Loading
