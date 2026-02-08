import React from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import DashboardHome from './DashboardHome';

const PainelAdmin = () => {
    return (
        <AdminLayout>
            {/* Aqui você pode futuramente colocar condicionais para trocar de tela 
                sempre mantendo o Layout (Sidebar/Header) estático */}
            <DashboardHome />
        </AdminLayout>
    );
};

export default PainelAdmin;