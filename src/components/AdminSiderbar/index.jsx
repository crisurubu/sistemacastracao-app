import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard, PawPrint, BadgeDollarSign, 
    Users, Bell, LogOut, CalendarDays, Menu 
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';

const AdminSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [totalAlarmes, setTotalAlarmes] = useState(0);

    // Busca o total real de alarmes
    useEffect(() => {
        const fetchContagem = async () => {
            try {
                const response = await api.get('/admin/alarmes');
                setTotalAlarmes(response.data.length);
            } catch (err) {
                console.error("Erro ao buscar total de alarmes", err);
            }
        };
        fetchContagem();
    }, [location.pathname]);

    const menus = [
        { icon: <LayoutDashboard size={20}/>, label: 'Dashboard', path: '/admin/painel' },
        { icon: <BadgeDollarSign size={20}/>, label: 'Pagamentos', path: '/admin/pagamentos' },
        { icon: <PawPrint size={20}/>, label: 'Fila de Castração', path: '/admin/fila' },
        { icon: <CalendarDays size={20}/>, label: 'Agendados', path: '/admin/agendados' }, 
        { icon: <Users size={20}/>, label: 'Tutores', path: '/admin/tutores' },
        { icon: <Bell size={20}/>, label: 'Alarmes', path: '/admin/alarmes', badge: totalAlarmes },
    ];

    return (
        <aside className={`${isCollapsed ? 'w-16' : 'w-64'} bg-[#0f172a] border-r border-slate-800 flex flex-col transition-all duration-300 ease-in-out h-screen`}>
            
            {/* Header com Botão de 3 Linhas (Menu) */}
            <div className="h-16 flex items-center px-4 border-b border-slate-800 gap-4">
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                    title="Menu"
                >
                    <Menu size={24} />
                </button>
                
                {!isCollapsed && (
                    <span className="text-blue-500 font-black text-lg tracking-tighter truncate">
                        CENTRAL_ONG
                    </span>
                )}
            </div>

            {/* Itens do Menu */}
            <nav className="flex-1 p-2 mt-4 space-y-1 overflow-y-auto overflow-x-hidden">
                {menus.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <button 
                            key={item.label}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center p-3 rounded-xl transition-all group relative ${
                                isActive 
                                ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' 
                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                            }`}
                        >
                            <div className={`flex items-center w-full ${isCollapsed ? 'justify-center' : ''}`}>
                                <div className="min-w-[20px]">{item.icon}</div>
                                {!isCollapsed && (
                                    <span className="ml-3 font-semibold text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                                        {item.label}
                                    </span>
                                )}
                            </div>

                            {/* Badge Dinâmico - Matamos o "3" fixo */}
                            {item.badge > 0 && (
                                <span className={`bg-red-500 text-white text-[10px] font-bold rounded-full animate-pulse flex items-center justify-center ${
                                    isCollapsed 
                                    ? 'absolute top-1 right-1 w-4 h-4 text-[8px]' 
                                    : 'ml-auto px-1.5 py-0.5'
                                }`}>
                                    {item.badge}
                                </span>
                            )}

                            {/* Tooltip apenas se estiver colapsado */}
                            {isCollapsed && (
                                <div className="absolute left-16 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-slate-700 shadow-xl">
                                    {item.label}
                                </div>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Footer / Botão Sair */}
            <div className="p-2 border-t border-slate-800">
                <button 
                    onClick={() => navigate('/admin/login')}
                    className={`w-full flex items-center p-3 text-slate-500 hover:text-red-400 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
                >
                    <LogOut size={20}/>
                    {!isCollapsed && <span className="ml-3 font-semibold text-sm">Sair</span>}
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;