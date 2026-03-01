import React, { useState, useEffect, useCallback, useContext } from 'react';
import { 
    LayoutDashboard, PawPrint, BadgeDollarSign, 
    Users, Bell, LogOut, CalendarDays, Menu, X,
    Hospital, UserCog, ClipboardList, Settings2 
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const AdminSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useContext(AuthContext); 
    const [isCollapsed, setIsCollapsed] = useState(true); // Começa fechada no mobile
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
                alert("Sessão encerrada por inatividade para segurança dos dados da ONG.");
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
                setTotalAlarmes(response.data.length || 0);
            } catch (err) {
                console.error("Erro ao buscar total de alarmes", err);
            }
        };
        fetchContagem();
    }, [location.pathname, user]);

    const menusCompletos = [
        { icon: <LayoutDashboard size={20}/>, label: 'Dashboard', path: '/admin/painel', roles: ['MASTER', 'VOLUNTARIO'] },
        { icon: <BadgeDollarSign size={20}/>, label: 'Pagamentos', path: '/admin/pagamentos', roles: ['MASTER', 'VOLUNTARIO'] },
        { icon: <ClipboardList size={20}/>, label: 'Extrato Auditoria', path: '/admin/extrato', roles: ['MASTER', 'VOLUNTARIO'] },
        { icon: <Hospital size={20}/>, label: 'Clínicas', path: '/admin/clinicas', roles: ['MASTER'] }, 
        { icon: <UserCog size={20}/>, label: 'Voluntários', path: '/admin/voluntarios', roles: ['MASTER'] },
        { icon: <Settings2 size={20}/>, label: 'Configurar PIX', path: '/admin/configuracao-pix', roles: ['MASTER'] },
        { icon: <PawPrint size={20}/>, label: 'Fila de Castração', path: '/admin/fila', roles: ['MASTER', 'VOLUNTARIO'] },
        { icon: <CalendarDays size={20}/>, label: 'Agendados', path: '/admin/agendados', roles: ['MASTER', 'VOLUNTARIO'] }, 
        { icon: <Users size={20}/>, label: 'Tutores', path: '/admin/tutores', roles: ['MASTER', 'VOLUNTARIO'] },
        { icon: <Bell size={20}/>, label: 'Alarmes', path: '/admin/alarmes', badge: totalAlarmes, roles: ['MASTER', 'VOLUNTARIO'] },
    ];

    const menusVisiveis = user ? menusCompletos.filter(item => item.roles.includes(user.nivelAcesso)) : [];

    // Função para navegar e fechar o menu no mobile automaticamente
    const handleNav = (path) => {
        navigate(path);
        if (window.innerWidth < 768) setIsCollapsed(true);
    };

    return (
        <aside className={`
            bg-[#0f172a] border-b md:border-r border-slate-800 flex flex-col transition-all duration-300 ease-in-out z-50
            ${isCollapsed ? 'h-16 md:h-screen md:w-20' : 'h-[90vh] md:h-screen md:w-64'} 
            w-full md:sticky top-0
        `}>
            
            {/* HEADER DA SIDEBAR (Sempre visível) */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                    >
                        {isCollapsed ? <Menu size={24} /> : <X size={24} />}
                    </button>
                    
                    <div className={`flex flex-col ${(isCollapsed && window.innerWidth >= 768) ? 'hidden' : 'flex'}`}>
                        <span className="text-blue-500 font-black text-lg tracking-tighter">SISTEMA_ONG</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{user?.nivelAcesso}</span>
                    </div>
                </div>
            </div>

            {/* ÁREA DE LINKS: Só aparece se não estiver colapsado OU se estiver no PC */}
            <div className={`
                flex-1 flex flex-col overflow-hidden transition-all duration-300
                ${isCollapsed ? 'hidden md:flex' : 'flex'}
            `}>
                <nav className="flex-1 p-3 mt-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {menusVisiveis.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <button 
                                key={item.label}
                                onClick={() => handleNav(item.path)}
                                className={`w-full flex items-center p-3 rounded-xl transition-all group relative ${
                                    isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                                }`}
                            >
                                <div className="flex items-center w-full">
                                    <div className="min-w-[20px]">{item.icon}</div>
                                    <span className={`ml-3 font-bold text-sm whitespace-nowrap ${(isCollapsed && window.innerWidth >= 768) ? 'hidden' : 'block'}`}>
                                        {item.label}
                                    </span>
                                </div>
                                {item.badge > 0 && (
                                    <span className="bg-red-500 text-white text-[10px] font-black rounded-full px-2 py-0.5 ml-auto animate-pulse">
                                        {item.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center p-3 rounded-xl text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all"
                    >
                        <LogOut size={20}/>
                        <span className={`ml-3 font-bold text-sm ${(isCollapsed && window.innerWidth >= 768) ? 'hidden' : 'block'}`}>Sair do Painel</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default AdminSidebar;