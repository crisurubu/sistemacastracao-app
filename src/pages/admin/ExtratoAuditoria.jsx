import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, BarChart3, Clock, Wallet, ShieldCheck, PawPrint, CalendarDays, Eye } from 'lucide-react';
import api from '../../services/api';

const ExtratoAuditoria = () => {
    const [extrato, setExtrato] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState("");
    const [filtroData, setFiltroData] = useState("");

    const carregarExtrato = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/pagamentos/extrato');
            setExtrato(res.data);
        } catch (err) {
            console.error("Erro ao carregar auditoria:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { carregarExtrato(); }, []);

    // FUNÇÃO PARA FORMATAR A URL (IGUAL AO COMPONENTE DE PENDENTES)
    const formatarUrlComprovante = (url) => {
        if (!url) return "#";
        if (url.startsWith('http')) return url;
        const baseUrl = api.defaults.baseURL.replace('/api', '');
        return `${baseUrl}/uploads/${url}`;
    };

    // LÓGICA DE FILTRAGEM (TEXTO + DATA)
    const extratoFiltrado = extrato.filter(p => {
        const termo = filtro.toLowerCase();
        const dataPagamento = p.dataConfirmacao ? new Date(p.dataConfirmacao).toISOString().split('T')[0] : "";
        
        const nomePet = (p.cadastro?.pet?.nomeAnimal || "").toLowerCase();
        const nomeAprovador = (p.aprovadorNome || "").toLowerCase();
        const banco = (p.contaDestino?.banco || "").toLowerCase();
        
        const bateTexto = nomePet.includes(termo) || nomeAprovador.includes(termo) || banco.includes(termo);
        const bateData = filtroData === "" || dataPagamento === filtroData;

        return bateTexto && bateData;
    });

    if (loading && extrato.length === 0) return (
        <div className="p-10 text-center">
            <RefreshCw className="animate-spin mx-auto text-blue-500 mb-4" size={32} />
            <p className="text-slate-400 font-medium animate-pulse">Sincronizando registros financeiros...</p>
        </div>
    );

    return (
        <div className="mt-8 overflow-hidden rounded-3xl border border-slate-800 bg-[#0f172a] shadow-2xl">
            {/* Header com Filtros de Texto e Data */}
            <div className="bg-slate-800/30 p-6 border-b border-slate-800 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 shadow-inner">
                        <BarChart3 size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tight">Auditoria Financeira</h3>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Fluxo de Caixa ONG</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row w-full xl:w-auto gap-3">
                    {/* FILTRO POR DATA */}
                    <div className="relative group">
                        <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                        <input 
                            type="date"
                            className="w-full md:w-44 bg-slate-950/50 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none"
                            value={filtroData}
                            onChange={(e) => setFiltroData(e.target.value)}
                        />
                    </div>

                    {/* FILTRO POR TEXTO */}
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input 
                            type="text"
                            placeholder="Buscar pet, voluntário..."
                            className="w-full md:w-56 bg-slate-950/50 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                        />
                    </div>
                    
                    <button 
                        onClick={() => { setFiltro(""); setFiltroData(""); carregarExtrato(); }} 
                        className="flex items-center justify-center gap-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl border border-slate-700 transition-all active:scale-95"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                        LIMPAR
                    </button>
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-900/80 text-slate-500 text-[10px] uppercase tracking-[0.2em] font-black">
                            <th className="px-6 py-4">📅 Data/Hora</th>
                            <th className="px-6 py-4">🐾 Pet & Registro</th>
                            <th className="px-6 py-4">💰 Valor</th>
                            <th className="px-6 py-4">🛡️ Auditoria</th>
                            <th className="px-6 py-4">🏦 Destino</th>
                            <th className="px-6 py-4">📄 Comprovante</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 text-sm">
                        {extratoFiltrado.length > 0 ? (
                            extratoFiltrado.map(p => (
                                <tr key={p.id} className="hover:bg-blue-500/[0.02] transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-slate-200 font-bold">
                                            {new Date(p.dataConfirmacao).toLocaleDateString('pt-BR')}
                                        </div>
                                        <div className="text-[10px] text-emerald-500 font-mono mt-0.5 flex items-center gap-1">
                                            <Clock size={10} />
                                            {new Date(p.dataConfirmacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-white font-bold group-hover:text-blue-400 transition-colors">
                                            <PawPrint size={14} className="text-slate-600" />
                                            {p.cadastro?.pet?.nomeAnimal || '---'}
                                        </div>
                                        <div className="text-[10px] text-slate-500 font-mono mt-0.5 ml-5">ID: #{p.cadastro?.id}</div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-emerald-400 font-black text-base">
                                                R$ {p.valorContribuicao?.toFixed(2)}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5">
                                                <ShieldCheck size={14} className={!p.aprovadoPor ? "text-amber-500" : "text-blue-500"} />
                                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                                                    !p.aprovadoPor ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                                                }`}>
                                                    {!p.aprovadoPor ? 'SISTEMA' : 'VOLUNTÁRIO'}
                                                </span>
                                            </div>
                                            <span className="text-slate-200 font-semibold text-xs">
                                                {p.aprovadorNome || 'Admin Central'}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="text-slate-300 font-bold text-xs uppercase tracking-tight">{p.contaDestino?.banco || '---'}</div>
                                        <div className="text-[10px] text-slate-600 font-mono truncate max-w-[120px] mt-0.5">
                                            {p.contaDestino?.chave}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <a
                                            href={formatarUrlComprovante(p.comprovanteUrl)}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-2 text-[10px] font-black bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition-all active:scale-95 shadow-sm"
                                        >
                                            <Eye size={14} className="text-blue-400" /> VER DOC
                                        </a>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-20 text-center">
                                    <div className="text-slate-600 italic flex flex-col items-center gap-2">
                                        <Search size={32} className="opacity-10" />
                                        Nenhum registro encontrado para estes filtros.
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ExtratoAuditoria;