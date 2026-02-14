import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ExtratoAuditoria = () => {
    const [extrato, setExtrato] = useState([]);
    const [loading, setLoading] = useState(true);

    const carregarExtrato = async () => {
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

    if (loading) return <div className="p-5 text-center text-slate-400 animate-pulse">Carregando histórico de auditoria...</div>;

    return (
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-[#0f172a] shadow-2xl">
            {/* Header do Extrato */}
            <div className="bg-slate-800/50 p-6 border-b border-slate-700 flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        <span className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">📊</span>
                        Extrato de Auditoria Financeira
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">Histórico de aprovações e destino das contribuições</p>
                </div>
                <button onClick={carregarExtrato} className="text-sm bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition-all">
                    Atualizar Dados
                </button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                            <th className="px-6 py-4">📅 Data e Hora</th>
                            <th className="px-6 py-4">🐾 Pet / Cadastro</th>
                            <th className="px-6 py-4">💰 Valor</th>
                            <th className="px-6 py-4">👤 Responsável (Auditoria)</th>
                            <th className="px-6 py-4">🏦 Destino Bancário</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-sm">
                        {extrato.length > 0 ? (
                            extrato.map(p => (
                                <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                                    {/* COLUNA DATA E HORA AJUSTADA */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-slate-200 font-medium">
                                            {new Date(p.dataConfirmacao).toLocaleDateString('pt-BR')}
                                        </div>
                                        <div className="text-[11px] text-emerald-500/80 font-mono mt-0.5">
                                            {new Date(p.dataConfirmacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </div>
                                    </td>
                                    
                                    <td className="px-6 py-4">
                                        <div className="text-white font-medium">{p.cadastro?.pet?.nomeAnimal || '---'}</div>
                                        <div className="text-xs text-slate-500">ID: #{p.cadastro?.id}</div>
                                    </td>

                                    <td className="px-6 py-4 font-mono">
                                        <span className="text-emerald-400 font-bold bg-emerald-400/10 px-2 py-1 rounded">
                                            R$ {p.valorContribuicao?.toFixed(2)}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full w-fit ${
                                                !p.aprovadoPor ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                                            }`}>
                                                {!p.aprovadoPor ? 'SISTEMA CENTRAL' : 'VOLUNTÁRIO'}
                                            </span>
                                            
                                            <span className="text-white font-medium">
                                                {p.aprovadorNome || 'Admin Desconhecido'}
                                            </span>

                                            {p.aprovadoPor && (
                                                <span className="text-[10px] text-slate-500">CPF: {p.aprovadoPor.cpf}</span>
                                            )}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="text-slate-300 font-medium">{p.contaDestino?.banco || 'Não Informado'}</div>
                                        <div className="text-[10px] text-slate-500 font-mono truncate max-w-[150px]">
                                            {p.contaDestino?.chave}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-slate-500 italic">
                                    Nenhum registro de auditoria disponível.
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