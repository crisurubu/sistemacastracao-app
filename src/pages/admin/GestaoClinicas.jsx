import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Hospital, MessageCircle, MapPin, Power, PowerOff, Plus, Trophy } from 'lucide-react';

const GestaoClinicas = () => {
    const [clinicas, setClinicas] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const formatarCNPJ = (cnpj) => {
        if (!cnpj) return "";
        const c = cnpj.replace(/\D/g, "");
        return c.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
    };

    const carregarClinicas = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await api.get('/admin/clinicas', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClinicas(response.data);
        } catch (error) {
            console.error("Erro ao carregar clínicas", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarClinicas();
    }, []);

    const alternarStatus = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await api.patch(`/admin/clinicas/${id}/status`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            carregarClinicas();
        } catch (error) {
            alert("Erro ao alterar status da clínica.");
        }
    };

    const renderMedalha = (clinica) => {
    // Priorizamos o selo que vem do banco (calculado pelo Java)
    const selo = clinica.selo;

    switch (selo) {
        case 'OURO':
            return <span title="Ouro: +50 Castrações" className="text-2xl drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]">🥇</span>;
        case 'PRATA':
            return <span title="Prata: +20 Castrações" className="text-2xl drop-shadow-[0_0_10px_rgba(148,163,184,0.8)]">🥈</span>;
        case 'BRONZE':
            return <span title="Bronze: Já iniciou" className="text-2xl drop-shadow-[0_0_10px_rgba(180,83,9,0.8)]">🥉</span>;
        default:
            return <span title="Aguardando primeira castração" className="opacity-20 grayscale text-2xl">🎖️</span>;
    }
};

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    return (
        <div className="p-6 bg-slate-950 min-h-screen text-slate-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic flex items-center gap-3">
                        <Hospital className="text-blue-500" size={32} />
                        Clínicas Parceiras
                    </h1>
                    <p className="text-slate-400 text-sm mt-1 font-medium">Gestão de rede credenciada e impacto social.</p>
                </div>
                <button 
                    onClick={() => navigate('/admin/clinicas/novo')}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/40 flex items-center gap-2 active:scale-95 text-sm"
                >
                    <Plus size={20} /> Nova Clínica
                </button>
            </div>

            <div className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-slate-800/50">
                                <th className="px-6 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Mérito & Vidas</th>
                                <th className="px-6 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Identificação da Clínica</th>
                                <th className="px-6 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Contato & Local</th>
                                <th className="px-6 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-5 text-center text-xs font-black text-slate-500 uppercase tracking-widest">Gestão</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {clinicas.map((clinica) => (
                                <tr key={clinica.id} className="hover:bg-blue-500/5 transition-colors group">
                                    {/* COLUNA 1: MEDALHA E CONTAGEM (DESTAQUE PRIORITÁRIO) */}
                                    <td className="px-6 py-6 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            {renderMedalha(clinica)}
                                            <div className="flex flex-col">
                                                <span className="text-lg font-black text-white leading-none">
                                                    {clinica.totalCastracoes || 0}
                                                </span>
                                                <span className="text-[9px] font-bold uppercase text-emerald-500 tracking-tighter">
                                                    Vidas Salvas
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    {/* COLUNA 2: NOME E DOCUMENTOS */}
                                    <td className="px-6 py-6 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <div className="text-sm font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">
                                                {clinica.nome}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md border border-slate-700">
                                                    {formatarCNPJ(clinica.cnpj)}
                                                </span>
                                                <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md">
                                                    {clinica.crmvResponsavel || 'CRMV NÃO INF.'}
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* COLUNA 3: WHATSAPP E ENDEREÇO */}
                                    <td className="px-6 py-6 whitespace-nowrap">
                                        <div className="flex flex-col gap-1">
                                            <a 
                                                href={`https://wa.me/55${clinica.telefone?.replace(/\D/g, '')}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center text-emerald-400 text-xs font-bold hover:text-emerald-300 transition-colors"
                                            >
                                                <MessageCircle size={14} className="mr-1.5" />
                                                {clinica.telefone || 'Sem WhatsApp'}
                                            </a>
                                            <div className="flex items-center text-slate-500 text-[11px] max-w-[200px] overflow-hidden">
                                                <MapPin size={12} className="mr-1.5 shrink-0" />
                                                <span className="truncate" title={clinica.endereco}>
                                                    {clinica.endereco || 'Endereço não informado'}
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* COLUNA 4: STATUS */}
                                    <td className="px-6 py-6 whitespace-nowrap">
                                        <div className={`inline-flex items-center px-3 py-1 rounded-full border ${
                                            clinica.administrador?.ativo 
                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                                            : 'bg-red-500/10 border-red-500/20 text-red-500'
                                        }`}>
                                            <div className={`h-1.5 w-1.5 rounded-full mr-2 ${clinica.administrador?.ativo ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                                            <span className="text-[10px] font-black uppercase tracking-widest">
                                                {clinica.administrador?.ativo ? 'Ativa' : 'Inativa'}
                                            </span>
                                        </div>
                                    </td>

                                    {/* COLUNA 5: AÇÕES */}
                                    <td className="px-6 py-6 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => navigate('/admin/clinicas/novo', { state: { clinica } })}
                                                className="p-2.5 hover:bg-blue-500/20 rounded-xl text-blue-400 hover:text-blue-300 transition-all border border-slate-800 hover:border-blue-500/40"
                                                title="Editar Clínica"
                                            >
                                                <Hospital size={18} />
                                            </button>
                                            <button 
                                                onClick={() => alternarStatus(clinica.id)}
                                                className={`p-2.5 rounded-xl transition-all border ${
                                                    clinica.administrador?.ativo 
                                                    ? 'text-red-500 hover:bg-red-500/10 border-slate-800 hover:border-red-500/30' 
                                                    : 'text-emerald-500 hover:bg-emerald-400/10 border-slate-800 hover:border-emerald-500/30'
                                                }`}
                                                title={clinica.administrador?.ativo ? "Desativar" : "Ativar"}
                                            >
                                                {clinica.administrador?.ativo ? <PowerOff size={18} /> : <Power size={18} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* LEGENDA DE MÉRITO */}
            <div className="mt-8 flex flex-wrap items-center gap-8 justify-center p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50">
                <div className="flex items-center gap-2">
                    <span className="text-xl">🥇</span> 
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Parceiro Ouro (+50)</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xl">🥈</span> 
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Parceiro Prata (+20)</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xl">🥉</span> 
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Parceiro Bronze (+1)</span>
                </div>
            </div>
        </div>
    );
};

export default GestaoClinicas;