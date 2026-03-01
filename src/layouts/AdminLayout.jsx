import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';

const AdminLayout = () => {
    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-[#020617] text-slate-100">
            
            {/* SIDEBAR: No mobile ela NÃO pode ter altura fixa. No PC ela trava na lateral. */}
            <aside className="w-full md:w-64 flex-shrink-0 bg-[#020617] border-b md:border-r border-slate-800">
                <AdminSidebar />
            </aside>

            {/* CONTEÚDO: No mobile ele segue o fluxo. No PC ele ocupa o resto da tela. */}
            <div className="flex flex-col flex-1 min-w-0">
                <AdminHeader />
                
                <main className="p-4 md:p-8">
                    {/* Container para evitar que as tabelas/cards estourem a largura da tela */}
                    <div className="max-w-full overflow-x-hidden">
                        <Outlet /> 
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;