import React, { useState, useEffect, useMemo } from 'react';
import { Eye, CheckCircle, XCircle, Clock, Loader2, Search } from 'lucide-react';
import api from '../../services/api';
import { enviarWhatsApp } from '../../services/whatsappService';

const PagamentosPendentes = () => {
    const [pendentes, setPendentes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processandoId, setProcessandoId] = useState(null);
    const [filtro, setFiltro] = useState("");

    const fetchPagamentos = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/pagamentos/pendentes');
            setPendentes(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Erro ao buscar pagamentos:", error);
            setPendentes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPagamentos(); }, []);

    const isUrgente = (data) => {
        if (!data) return false;
        const diff = Math.abs(new Date() - new Date(data)) / 36e5;
        return diff <= 24;
    };

    const pagamentosFiltrados = useMemo(() => {
        const termo = filtro.toLowerCase();
        return pendentes.filter(pago => {
            const nomePet = (pago.cadastro?.pet?.nomeAnimal || "").toLowerCase();
            const nomeTutor = (pago.cadastro?.tutor?.nome || "").toLowerCase();
            return nomePet.includes(termo) || nomeTutor.includes(termo);
        });
    }, [pendentes, filtro]);

    const handleAprovar = async (pago) => {
        try {
            setProcessandoId(pago.id);
            await api.patch(`/admin/pagamentos/${pago.id}/aprovar`);
            setPendentes(prev => prev.filter(p => p.id !== pago.id));
            
            // Chama o serviço centralizado
            enviarWhatsApp(pago.cadastro?.tutor?.whatsapp, 'APROVADO', {
                tutor: pago.cadastro?.tutor?.nome,
                pet: pago.cadastro?.pet?.nomeAnimal
            });
        } catch (err) { alert("Erro ao aprovar."); } 
        finally { setProcessandoId(null); }
    };

    const handleRejeitar = async (pago) => {
        if (!window.confirm("REJEITAR e EXCLUIR permanentemente?")) return;
        try {
            setProcessandoId(pago.id);
            await api.patch(`/admin/pagamentos/${pago.id}/rejeitar`);
            setPendentes(prev => prev.filter(p => p.id !== pago.id));
            
            // Chama o serviço centralizado
            enviarWhatsApp(pago.cadastro?.tutor?.whatsapp, 'REJEITADO', {
                tutor: pago.cadastro?.tutor?.nome
            });
        } catch (err) { alert("Erro ao rejeitar."); } 
        finally { setProcessandoId(null); }
    };

    return (
        <div className="space-y-6 p-2 animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Fluxo de <span className="text-blue-500">Pagamentos</span></h1>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Auditória de contribuições sociais</p>
                </div>

                <div className="flex items-center gap-4 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-80 text-white">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar pet ou tutor..."
                            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 outline-none text-sm font-medium focus:border-blue-500"
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                        />
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-2xl hidden sm:block">
                        <span className="text-emerald-500 text-[10px] font-black uppercase block tracking-tighter text-center">Em Análise</span>
                        <span className="text-white font-mono font-black text-lg italic">
                            R$ {pagamentosFiltrados.reduce((acc, curr) => acc + (Number(curr.valorContribuicao) || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-sm">
                {loading ? (
                    <div className="p-32 flex flex-col items-center justify-center text-slate-600">
                        <Loader2 className="animate-spin mb-6 text-blue-500" size={48} />
                        <p className="font-black uppercase tracking-[0.3em] text-sm">Sincronizando Auditoria...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800">
                                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Data / Status</th>
                                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Paciente / Tutor</th>
                                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Taxa Social</th>
                                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Comprovante</th>
                                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {pagamentosFiltrados.map((pago) => (
                                    <tr key={pago.id} className={`group hover:bg-slate-800/40 transition-all ${processandoId === pago.id ? 'opacity-30' : ''}`}>
                                        <td className="p-6">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-slate-300 font-mono text-sm font-bold">
                                                    <Clock size={14} className={isUrgente(pago.cadastro?.dataSolicitacao) ? "text-emerald-500" : "text-orange-500"} />
                                                    {pago.cadastro?.dataSolicitacao ? new Date(pago.cadastro.dataSolicitacao).toLocaleDateString('pt-BR') : '---'}
                                                </div>
                                                {isUrgente(pago.cadastro?.dataSolicitacao) && (
                                                    <span className="text-[9px] text-emerald-500 font-black uppercase animate-pulse">● Pix Recente</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col">
                                                <span className="text-white font-black text-base uppercase tracking-tighter">{pago.cadastro?.pet?.nomeAnimal}</span>
                                                <span className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">{pago.cadastro?.tutor?.nome}</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <span className="text-emerald-400 font-mono font-black text-xl">
                                                R$ {Number(pago.valorContribuicao || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <button onClick={() => window.open(pago.comprovanteUrl, '_blank')} className="bg-slate-800 hover:bg-blue-600 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl transition-all shadow-lg flex items-center gap-2">
                                                <Eye size={14} /> Analisar
                                            </button>
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className="flex justify-center gap-3">
                                                {processandoId === pago.id ? (
                                                    <Loader2 className="animate-spin text-blue-500" size={24} />
                                                ) : (
                                                    <>
                                                        <button onClick={() => handleAprovar(pago)} className="p-3 bg-slate-800 text-emerald-500 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all">
                                                            <CheckCircle size={20} />
                                                        </button>
                                                        <button onClick={() => handleRejeitar(pago)} className="p-3 bg-slate-800 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all">
                                                            <XCircle size={20} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PagamentosPendentes;

/**
 * RESUMO DO CÓDIGO:
 * - Centralização de Mensagens: A lógica de textos de WhatsApp foi movida para o service/whatsappService.js.
 * - Limpeza de UI: A página foca apenas na exibição e na lógica de estado da tabela.
 * - Fluxo de Auditoria: Mantido o sistema de 24h (Pix que some) com alertas visuais.
 * - Organização Profissional: O componente chama apenas enviarWhatsApp passando os dados necessários.
 */