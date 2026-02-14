import React, { useState, useEffect, useCallback, useContext } from 'react';
import { 
    LayoutDashboard, PawPrint, BadgeDollarSign, 
    Users, Bell, LogOut, CalendarDays, Menu,
    Hospital, UserCog, ClipboardList, Settings2 
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const AdminSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useContext(AuthContext); 
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [totalAlarmes, setTotalAlarmes] = useState(0);

    const handleLogout = useCallback(() => {
        logout(); 
        navigate('/admin/login');
    }, [logout, navigate]);

    // Monitor de Inatividade (15 minutos)
    useEffect(() => {
        let timer;
        const tempoInatividade = 15 * 60 * 1000; 
        const resetTimer = () => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                alert("Sessão encerrada por inatividade.");
                handleLogout();
            }, tempoInatividade);
        };
        const eventos = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        eventos.forEach(evento => document.addEventListener(evento, resetTimer));
        resetTimer(); 
        return () => {
            eventos.forEach(evento => document.removeEventListener(evento, resetTimer));
            if (timer) clearTimeout(timer);
        };
    }, [handleLogout]);

    // Busca contagem de alarmes
    useEffect(() => {
        const fetchContagem = async () => {
            if (!user || user.nivelAcesso === 'CLINICA') {
                setTotalAlarmes(0);
                return;
            }

            try {
                const response = await api.get('/admin/alarmes');
                setTotalAlarmes(response.data.length);
            } catch (err) {
                console.error("Erro ao buscar total de alarmes", err);
            }
        };
        fetchContagem();
    }, [location.pathname, user]);

    // --- CONFIGURAÇÃO DE MENUS ORGANIZADA ---
    const menusCompletos = [
        { 
            icon: <LayoutDashboard size={20}/>, 
            label: 'Dashboard', 
            path: '/admin/painel', 
            roles: ['MASTER', 'VOLUNTARIO'] 
        },
        { 
            icon: <BadgeDollarSign size={20}/>, 
            label: 'Pagamentos', 
            path: '/admin/pagamentos', 
            roles: ['MASTER', 'VOLUNTARIO'] 
        },
        // HISTÓRICO DE VIDA / AUDITORIA
        { 
            icon: <ClipboardList size={20}/>, 
            label: 'Extrato Auditoria', 
            path: '/admin/extrato', 
            roles: ['MASTER', 'VOLUNTARIO'] 
        },
        { 
            icon: <Hospital size={20}/>, 
            label: 'Clínicas', 
            path: '/admin/clinicas', 
            roles: ['MASTER'] 
        }, 
        { 
            icon: <UserCog size={20}/>, 
            label: 'Voluntários', 
            path: '/admin/voluntarios', 
            roles: ['MASTER'] 
        },
        // CONFIGURAÇÃO CRÍTICA (Apenas Master)
        { 
            icon: <Settings2 size={20}/>, 
            label: 'Configurar PIX', 
            path: '/admin/configuracao-pix', 
            roles: ['MASTER'] 
        },
        { 
            icon: <PawPrint size={20}/>, 
            label: 'Fila de Castração', 
            path: '/admin/fila', 
            roles: ['MASTER', 'VOLUNTARIO'] 
        },
        { 
            icon: <CalendarDays size={20}/>, 
            label: 'Agendados', 
            path: '/admin/agendados', 
            roles: ['MASTER', 'VOLUNTARIO'] 
        }, 
        { 
            icon: <Users size={20}/>, 
            label: 'Tutores', 
            path: '/admin/tutores', 
            roles: ['MASTER', 'VOLUNTARIO'] 
        },
        { 
            icon: <Bell size={20}/>, 
            label: 'Alarmes', 
            path: '/admin/alarmes', 
            badge: totalAlarmes, 
            roles: ['MASTER', 'VOLUNTARIO'] 
        },
    ];

    const menusVisiveis = menusCompletos.filter(item => item.roles.includes(user?.nivelAcesso));

    return (
        <aside className={`${isCollapsed ? 'w-16' : 'w-64'} bg-[#0f172a] border-r border-slate-800 flex flex-col transition-all duration-300 ease-in-out h-screen sticky top-0`}>
            
            <div className="h-16 flex items-center px-4 border-b border-slate-800 gap-4">
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                >
                    <Menu size={24} />
                </button>
                
                {!isCollapsed && (
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-blue-500 font-black text-lg tracking-tighter truncate">CENTRAL_ONG</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase">{user?.nivelAcesso}</span>
                    </div>
                )}
            </div>

            <nav className="flex-1 p-2 mt-4 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                {menusVisiveis.map((item) => {
                    const isActive = location.pathname === item.path || (item.path !== '/admin/painel' && location.pathname.startsWith(item.path));
                    
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
                                    <span className="ml-3 font-semibold text-sm whitespace-nowrap">
                                        {item.label}
                                    </span>
                                )}
                            </div>

                            {item.badge > 0 && (
                                <span className={`bg-red-500 text-white text-[10px] font-bold rounded-full animate-pulse flex items-center justify-center ${
                                    isCollapsed ? 'absolute top-1 right-1 w-4 h-4' : 'ml-auto px-1.5 py-0.5'
                                }`}>
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>

            <div className="p-2 border-t border-slate-800">
                <button 
                    onClick={handleLogout}
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