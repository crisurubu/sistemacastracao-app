import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const GestaoClinicas = () => {
    const [clinicas, setClinicas] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // --- FUNÇÃO PARA FORMATAR CNPJ NA TABELA ---
    const formatarCNPJ = (cnpj) => {
        if (!cnpj) return "";
        return cnpj
            .replace(/\D/g, "")
            .replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
    };

    const carregarClinicas = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/admin/clinicas', {
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
            await axios.patch(`http://localhost:8080/api/admin/clinicas/${id}/status`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            carregarClinicas();
        } catch (error) {
            alert("Erro ao alterar status da clínica.");
        }
    };

    const renderMedalha = (selo) => {
        switch(selo) {
            case 'OURO': return <span title="Parceiro Ouro" className="text-2xl drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]">🥇</span>;
            case 'PRATA': return <span title="Parceiro Prata" className="text-2xl drop-shadow-[0_0_8px_rgba(148,163,184,0.5)]">🥈</span>;
            case 'BRONZE': return <span title="Parceiro Bronze" className="text-2xl drop-shadow-[0_0_8px_rgba(180,83,9,0.5)]">🥉</span>;
            default: return <span title="Novo Parceiro" className="opacity-20 grayscale text-2xl">🎖️</span>;
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
                    <h1 className="text-3xl font-bold text-white tracking-tight">Clínicas Parceiras</h1>
                    <p className="text-slate-400 text-sm mt-1">Gerencie as clínicas credenciadas e seus selos de mérito.</p>
                </div>
                <button 
                    onClick={() => navigate('/admin/clinicas/novo')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2 active:scale-95"
                >
                    <span className="text-xl">+</span> Cadastrar Clínica
                </button>
            </div>

            <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-slate-800/50">
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Mérito</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Clínica / Responsável</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Documento</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Gestão</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {clinicas.map((clinica) => (
                                <tr key={clinica.id} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        {renderMedalha(clinica.selo)}
                                    </td>
                                    
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-2">
                                                {clinica.nome}
                                                <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">
                                                    {clinica.totalCastracoes || 0} castrações
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-500 mt-0.5">{clinica.administrador?.email}</div>
                                        </div>
                                    </td>

                                    {/* COLUNA DOCUMENTO COM MÁSCARA APLICADA */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded border border-slate-700">
                                            {formatarCNPJ(clinica.cnpj)}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className={`h-2 w-2 rounded-full mr-2 ${clinica.administrador?.ativo ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                            <span className={`text-xs font-bold uppercase ${clinica.administrador?.ativo ? 'text-green-500' : 'text-red-500'}`}>
                                                {clinica.administrador?.ativo ? 'Operacional' : 'Suspenso'}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <button 
                                            onClick={() => alternarStatus(clinica.id)}
                                            className={`px-4 py-2 rounded-lg font-bold transition-all ${
                                                clinica.administrador?.ativo 
                                                ? 'text-red-400 hover:bg-red-400/10 border border-red-400/20' 
                                                : 'text-emerald-400 hover:bg-emerald-400/10 border border-emerald-400/20'
                                            }`}
                                        >
                                            {clinica.administrador?.ativo ? 'Inativar' : 'Ativar Acesso'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {clinicas.length === 0 && (
                    <div className="p-20 text-center">
                        <div className="text-5xl mb-4">🏥</div>
                        <p className="text-slate-500 italic">Nenhuma clínica parceira encontrada no sistema.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GestaoClinicas;