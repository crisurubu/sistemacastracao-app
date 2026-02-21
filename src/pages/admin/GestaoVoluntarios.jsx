import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { UserPlus, Search, Settings2, MessageCircle, ShieldCheck, ShieldAlert, Users, UserMinus, Loader2 } from 'lucide-react';

const GestaoVoluntarios = () => {
    const navigate = useNavigate();
    const [voluntarios, setVoluntarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busca, setBusca] = useState('');
    const [abaAtiva, setAbaAtiva] = useState('ativos');

    useEffect(() => {
        carregarVoluntarios();
    }, []);

    const carregarVoluntarios = async () => {
        try {
            // Removido localStorage e headers manuais. 
            // O axios com withCredentials agora assume o controle.
            const response = await api.get('/admin/voluntarios');
            setVoluntarios(response.data);
        } catch (err) {
            console.error("Erro ao carregar voluntários", err);
        } finally {
            setLoading(false);
        }
    };

    const voluntariosFiltrados = voluntarios.filter(v => {
        const correspondeStatus = (abaAtiva === 'ativos' ? v.ativo : !v.ativo);
        const correspondeBusca = v.nome.toLowerCase().includes(busca.toLowerCase()) || 
                                 v.cpf.includes(busca.replace(/\D/g, ''));
        return correspondeStatus && correspondeBusca;
    });

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
            <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em]">Sincronizando Equipe...</p>
        </div>
    );

    return (
        <div className="p-6 bg-slate-950 min-h-screen">
            <div className="max-w-6xl mx-auto">
                {/* Header Dinâmico */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter italic text-white flex items-center gap-3">
                            <Users className="text-emerald-500" size={32} /> Gestão de Voluntários
                        </h1>
                        <p className="text-slate-400 text-sm font-medium mt-1">Controle de acesso e equipe do Sistema Castração ONG.</p>
                    </div>

                    <button 
                        onClick={() => navigate('novo')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
                    >
                        <UserPlus size={18} /> Novo Voluntário
                    </button>
                </div>

                {/* Filtros e Busca */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                    <div className="lg:col-span-1 flex gap-2 p-1.5 bg-slate-900 rounded-2xl border border-slate-800">
                        <button 
                            onClick={() => setAbaAtiva('ativos')}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${abaAtiva === 'ativos' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <ShieldCheck size={14} /> Ativos ({voluntarios.filter(v => v.ativo).length})
                        </button>
                        <button 
                            onClick={() => setAbaAtiva('inativos')}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${abaAtiva === 'inativos' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <UserMinus size={14} /> Inativos ({voluntarios.filter(v => !v.ativo).length})
                        </button>
                    </div>

                    <div className="lg:col-span-2 relative">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="text"
                            placeholder={`Pesquisar voluntário por nome ou CPF...`}
                            className="w-full bg-slate-900 border border-slate-800 p-4 pl-14 rounded-2xl text-white text-sm outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-600 font-medium"
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                        />
                    </div>
                </div>

                {/* Grid de Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {voluntariosFiltrados.length > 0 ? (
                        voluntariosFiltrados.map((v) => (
                            <div key={v.id} className="bg-slate-900 border border-slate-800 p-5 rounded-[2rem] flex items-center justify-between gap-4 hover:border-slate-700 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${v.ativo ? 'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white' : 'bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white'}`}>
                                        {v.ativo ? <ShieldCheck size={28} /> : <ShieldAlert size={28} />}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-white uppercase text-sm tracking-tight group-hover:text-emerald-400 transition-colors">{v.nome}</h3>
                                        <p className="text-slate-500 text-[11px] font-mono mt-0.5">
                                            {v.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => navigate(`${v.id}`)}
                                        className="p-3 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-xl transition-all flex items-center gap-2 px-4 font-black text-[10px] uppercase tracking-widest"
                                        title="Configurações de Acesso"
                                    >
                                        <Settings2 size={16} /> 
                                        <span className="hidden sm:inline">Gerenciar</span>
                                    </button>
                                    
                                    {v.ativo && v.whatsapp && (
                                        <a 
                                            href={`https://wa.me/55${v.whatsapp.replace(/\D/g, '')}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-3 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white rounded-xl transition-all shadow-sm"
                                            title="Contato via WhatsApp"
                                        >
                                            <MessageCircle size={18} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="md:col-span-2 text-center py-20 bg-slate-900/30 rounded-[3rem] border-2 border-dashed border-slate-800/50">
                            <Users className="mx-auto text-slate-800 mb-4" size={48} />
                            <p className="text-slate-600 font-black uppercase text-xs tracking-widest">
                                Nenhum voluntário {abaAtiva} encontrado para "{busca}"
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GestaoVoluntarios;