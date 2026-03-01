import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Power, ArrowRight, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const GlobalMonitor = () => {
    const navigate = useNavigate();
    const isMounted = useRef(false);

    // --- ALERTA DE JEJUM (Pets de Amanhã) ---
    const verificarJejum = async () => {
        try {
            const res = await api.get('/admin/agendamentos/pendentes');
            const amanhaStr = new Date(Date.now() + 86400000).toLocaleDateString('en-CA');

            const pendentes = res.data.filter(item => 
                item.dataHora?.split('T')[0] === amanhaStr && !item.realizado
            );

            if (pendentes.length > 0) {
                toast.custom((t) => (
                    <div className={`${t.visible ? 'animate-in fade-in slide-in-from-top-4' : 'animate-out fade-out opacity-0'} max-w-md w-full bg-[#1e293b] border border-amber-500/40 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                        <div className="flex-1 w-0 p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 pt-0.5">
                                    <div className="bg-amber-500/20 p-2 rounded-full text-amber-500">
                                        <Bell size={20} className="animate-bounce" />
                                    </div>
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-black text-white uppercase italic tracking-tight">Alerta de Jejum</p>
                                    <p className="mt-1 text-xs text-slate-400">
                                        <b>{pendentes.length}</b> pets agendados para amanhã. O aviso de jejum precisa ser validado.
                                    </p>
                                    <button 
                                        onClick={() => { navigate('/admin/agendados'); toast.dismiss(t.id); }}
                                        className="mt-3 flex items-center gap-1 text-[10px] font-black text-amber-500 hover:text-amber-400 uppercase transition-colors"
                                    >
                                        Ver listagem agora <ArrowRight size={12} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="flex border-l border-slate-800">
                            <button onClick={() => toast.dismiss(t.id)} className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-slate-500 hover:text-slate-400 focus:outline-none">
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                ), { id: 'jejum-global', duration: 10000 });
            }
        } catch (err) { console.error("Monitor Jejum:", err); }
    };

    // --- ALERTA STATUS SISTEMA ---
    const verificarStatusSistema = async () => {
        try {
            const res = await api.get('/sistema/status');
            const aberto = res.data.cadastroAberto;

            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-in zoom-in-95' : 'animate-out zoom-out-95'} flex items-center gap-3 bg-slate-900 border border-slate-800 p-3 px-4 rounded-full shadow-xl`}>
                    <div className={`p-1.5 rounded-full ${aberto ? 'bg-emerald-500 text-slate-950' : 'bg-red-500 text-white'}`}>
                        <Power size={14} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-500 uppercase leading-none">Status Inscrições</span>
                        <span className={`text-[11px] font-bold uppercase ${aberto ? 'text-emerald-500' : 'text-red-500'}`}>
                            {aberto ? 'Portas Abertas' : 'Sistema Pausado'}
                        </span>
                    </div>
                    <button onClick={() => toast.dismiss(t.id)} className="ml-2 text-slate-600 hover:text-slate-400">
                        <X size={14} />
                    </button>
                </div>
            ), { id: 'status-global', duration: 6000 });
        } catch (err) { console.error("Monitor Status:", err); }
    };

    useEffect(() => {
        if (isMounted.current) return;
        isMounted.current = true;

        verificarJejum();
        setTimeout(verificarStatusSistema, 1000); // Delayzinho pra não subir tudo junto

        const interval = setInterval(verificarJejum, 20 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return null;
};

export default GlobalMonitor;

/**
 * RESUMO DO CÓDIGO:
 * - UI Customizada: Uso de 'toast.custom' para criar alertas que não parecem mensagens de erro padrão, mas parte da interface.
 * - Animações Tailwind: Utiliza classes de animação para uma entrada suave (fade-in, slide-in).
 * - Inteligência de Navegação: O botão dentro do toast usa o 'navigate' do React Router para levar o voluntário ao lugar certo.
 * - Controle de ID: O uso de IDs fixos ('jejum-global') impede que o sistema empilhe 10 toasts iguais se o voluntário ficar dando F5.
 */