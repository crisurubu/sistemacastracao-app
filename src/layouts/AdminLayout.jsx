import React from 'react';
import AdminSidebar from '../components/AdminSiderbar/index';
import AdminHeader from '../components/AdminHeader/index';

const AdminLayout = ({ children }) => {
    return (
        <div className="flex h-screen bg-[#020617] overflow-hidden text-slate-100">
            {/* Sidebar Fixa (Painel de Controle) */}
            <AdminSidebar />

            <div className="flex flex-col flex-1 overflow-hidden">
                {/* Header Superior */}
                <AdminHeader />
                
                {/* Stage Central (Onde os gráficos aparecem) */}
                <main className="flex-1 overflow-y-auto p-6 bg-[#020617] custom-scrollbar">
                    <div className="max-w-[1600px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;