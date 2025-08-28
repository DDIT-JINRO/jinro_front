import React from 'react';
import { Outlet } from 'react-router-dom';
import { ModalProvider } from '../context/ModalContext.jsx';

const RootLayout = () => {
    return (
        <ModalProvider>
            <Outlet />
        </ModalProvider>
    );
};

export default RootLayout;