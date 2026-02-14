import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { UserPlus, Search, Settings2, MessageCircle, ShieldCheck, ShieldAlert, Users, UserMinus } from 'lucide-react';

const GestaoVoluntarios = () => {
    const navigate = useNavigate();
    const [voluntarios, setVoluntarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busca, setBusca] = useState('');
    const [abaAtiva, setAbaAtiva] = useState('ativos'); // Filtro inicial: ativos

    useEffect(() => {
        carregarVoluntarios();
    }, []);

    const carregarVoluntarios = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await api.get('/admin/voluntarios', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVoluntarios(response.data);
        } catch (err) {
            console.error("Erro ao carregar voluntários", err);
        } finally {
            setLoading(false);
        }
    };

    // Lógica de filtragem: Primeiro pelo Status (Aba), depois pela Busca (Input)
    const voluntariosFiltrados = voluntarios.filter(v => {
        const correspondeStatus = (abaAtiva === 'ativos' ? v.ativo : !v.ativo);
        const correspondeBusca = v.nome.toLowerCase().includes(busca.toLowerCase()) || 
                                 v.cpf.includes(busca.replace(/\D/g, ''));
        return correspondeStatus && correspondeBusca;
    });

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter italic text-white flex items-center gap-2">
                        <Users className="text-emerald-500" size={28} /> Gestão de Voluntários
                    </h1>
                    <p className="text-slate-400 text-sm">Administre a equipe do Sistema Castração ONG.</p>
                </div>

                <button 
                    onClick={() => navigate('novo')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20"
                >
                    <UserPlus size={20} /> Novo Voluntário
                </button>
            </div>

            {/* SELETOR DE ABAS (FILTRO DE STATUS) */}
            <div className="flex gap-2 p-1 bg-slate-900 w-fit rounded-2xl mb-6 border border-slate-800">
                <button 
                    onClick={() => setAbaAtiva('ativos')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold text-xs uppercase transition-all ${abaAtiva === 'ativos' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <ShieldCheck size={16} /> Ativos ({voluntarios.filter(v => v.ativo).length})
                </button>
                <button 
                    onClick={() => setAbaAtiva('inativos')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold text-xs uppercase transition-all ${abaAtiva === 'inativos' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <UserMinus size={16} /> Inativos ({voluntarios.filter(v => !v.ativo).length})
                </button>
            </div>

            {/* BARRA DE BUSCA */}
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input 
                    type="text"
                    placeholder={`Buscar em ${abaAtiva}...`}
                    className="w-full bg-slate-900 border border-slate-800 p-4 pl-12 rounded-2xl text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                />
            </div>

            {/* LISTAGEM */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="text-center py-12 text-slate-500 animate-pulse font-bold uppercase tracking-widest">Sincronizando equipe...</div>
                ) : voluntariosFiltrados.length > 0 ? (
                    voluntariosFiltrados.map((v) => (
                        <div key={v.id} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 hover:border-slate-700 transition-colors group">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${v.ativo ? 'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white' : 'bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white'}`}>
                                    {v.ativo ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white uppercase text-sm tracking-tight">{v.nome}</h3>
                                    <p className="text-slate-500 text-xs font-mono">{v.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                                <button 
                                    onClick={() => navigate(`${v.id}`)}
                                    className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all flex items-center gap-2 px-4 font-bold text-xs uppercase"
                                >
                                    <Settings2 size={18} /> Gerenciar
                                </button>
                                
                                {v.ativo && (
                                    <a 
                                        href={`https://wa.me/55${v.whatsapp.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-3 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white rounded-xl transition-all"
                                    >
                                        <MessageCircle size={18} />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800 text-slate-500">
                        Nenhum voluntário {abaAtiva} encontrado.
                    </div>
                )}
            </div>
        </div>
    );
};

export default GestaoVoluntarios;