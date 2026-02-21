import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Hospital, MessageCircle, MapPin, Power, PowerOff, Plus, Edit3, Calendar } from 'lucide-react';

const GestaoClinicas = () => {
    const [clinicas, setClinicas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('ATIVAS'); // Estado para o filtro
    const navigate = useNavigate();

    const formatarCNPJ = (cnpj) => {
        if (!cnpj) return "";
        const c = cnpj.replace(/\D/g, "");
        return c.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
    };

    // Nova função para formatar a data de cadastro
    const formatarDataParceria = (data) => {
        if (!data) return "Novo Parceiro";
        const d = new Date(data);
        // Retorna ex: "Jan de 2024"
        return d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
                .replace('.', '')
                .replace(' de ', '/');
    };

    const carregarClinicas = async () => {
        try {
            const response = await api.get('/admin/clinicas');
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

    const alternarStatus = async (id, statusAtual) => {
        const acao = statusAtual ? 'DESATIVAR' : 'ATIVAR';
        if (!window.confirm(`Deseja realmente ${acao} esta clínica?`)) return;

        try {
            await api.patch(`/admin/clinicas/${id}/status`, {});
            carregarClinicas();
        } catch (error) {
            alert("Erro ao alterar status da clínica.");
        }
    };

    const renderMedalha = (clinica) => {
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

    // Lógica de Filtragem
    const clinicasAtivas = clinicas.filter(c => c.administrador?.ativo);
    const clinicasInativas = clinicas.filter(c => !c.administrador?.ativo);
    const listaExibida = filtro === 'ATIVAS' ? clinicasAtivas : clinicasInativas;

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500 mb-4"></div>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest text-center px-4">
                Sincronizando Rede de Clínicas...
            </p>
        </div>
    );

    return (
        <div className="p-6 bg-slate-950 min-h-screen text-slate-200 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Cabeçalho de Ações */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic flex items-center gap-3">
                            <Hospital className="text-blue-500" size={32} />
                            Clínicas Parceiras
                        </h1>
                        <p className="text-slate-400 text-sm mt-1 font-medium italic">Gestão da rede credenciada do Sistema Castração ONG.</p>
                    </div>
                    <button 
                        onClick={() => navigate('/admin/clinicas/novo')}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/40 flex items-center gap-2 active:scale-95 text-xs"
                    >
                        <Plus size={20} /> Nova Clínica
                    </button>
                </div>

                {/* Tabs de Filtro (Igual ao de Voluntários) */}
                <div className="flex gap-2 mb-6 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 w-fit">
                    <button
                        onClick={() => setFiltro('ATIVAS')}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            filtro === 'ATIVAS' 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        Ativas ({clinicasAtivas.length})
                    </button>
                    <button
                        onClick={() => setFiltro('INATIVAS')}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            filtro === 'INATIVAS' 
                            ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' 
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        Inativas ({clinicasInativas.length})
                    </button>
                </div>

                {/* Tabela de Gestão */}
                <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full border-separate border-spacing-0">
                            <thead>
                                <tr className="bg-slate-800/30">
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Mérito & Vidas</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Identificação</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Parceria desde</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Contato & Localização</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-5 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Gestão</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {listaExibida.length > 0 ? (
                                    listaExibida.map((clinica) => {
                                        const isAtiva = clinica.administrador?.ativo;
                                        
                                        const enderecoLinha1 = clinica.logradouro 
                                            ? `${clinica.logradouro}, ${clinica.numero || 'S/N'}` 
                                            : "Endereço não informado";
                                        
                                        const enderecoLinha2 = clinica.cidade 
                                            ? `${clinica.bairro || ''} - ${clinica.cidade}/${clinica.estado || ''}`
                                            : "";

                                        return (
                                            <tr key={clinica.id} className="hover:bg-blue-500/5 transition-colors group">
                                                {/* Mérito */}
                                                <td className="px-6 py-6 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        {renderMedalha(clinica)}
                                                        <div className="flex flex-col">
                                                            <span className="text-lg font-black text-white leading-none">
                                                                {clinica.totalCastracoes || 0}
                                                            </span>
                                                            <span className="text-[9px] font-bold uppercase text-emerald-500 tracking-tighter">Vidas Salvas</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                
                                                {/* Nome e CNPJ */}
                                                <td className="px-6 py-6 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <div className="text-sm font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">
                                                            {clinica.nome}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md border border-slate-700 font-mono">
                                                                {formatarCNPJ(clinica.cnpj)}
                                                            </span>
                                                            <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md">
                                                                {clinica.crmvResponsavel || 'CRMV N/I'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Parceria Desde */}
                                                <td className="px-6 py-6 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-1.5 text-slate-300 font-bold text-xs uppercase tracking-tighter">
                                                            <Calendar size={12} className="text-blue-500" />
                                                            {formatarDataParceria(clinica.dataCadastro)}
                                                        </div>
                                                        <span className="text-[9px] font-black text-slate-600 uppercase italic ml-[1.1rem]">
                                                            Membro da Rede
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Contato e Endereço Detalhado */}
                                                <td className="px-6 py-6 whitespace-nowrap">
                                                    <div className="flex flex-col gap-1">
                                                        <a 
                                                            href={`https://wa.me/55${clinica.telefone?.replace(/\D/g, '')}`} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="flex items-center text-emerald-400 text-xs font-bold hover:text-emerald-300 transition-colors mb-1"
                                                        >
                                                            <MessageCircle size={14} className="mr-1.5" />
                                                            {clinica.telefone || 'Sem WhatsApp'}
                                                        </a>
                                                        <div className="flex flex-col text-slate-500">
                                                            <div className="flex items-center text-[11px] font-medium text-slate-300">
                                                                <MapPin size={12} className="mr-1.5 shrink-0 text-blue-500" />
                                                                {enderecoLinha1}
                                                            </div>
                                                            <div className="text-[10px] ml-[1.1rem] text-slate-500 uppercase font-bold">
                                                                {enderecoLinha2}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-6 whitespace-nowrap">
                                                    <div className={`inline-flex items-center px-3 py-1 rounded-full border ${
                                                        isAtiva 
                                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                                                        : 'bg-red-500/10 border-red-500/20 text-red-500'
                                                    }`}>
                                                        <div className={`h-1.5 w-1.5 rounded-full mr-2 ${isAtiva ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest">
                                                            {isAtiva ? 'Ativa' : 'Inativa'}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Botões de Ação */}
                                                <td className="px-6 py-6 whitespace-nowrap text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button 
                                                            onClick={() => navigate('/admin/clinicas/novo', { state: { clinica, modoEdicao: true } })}
                                                            className="p-2.5 bg-slate-800 hover:bg-blue-600 rounded-xl text-slate-400 hover:text-white transition-all border border-slate-700 hover:border-blue-500 shadow-lg shadow-black/20"
                                                            title="Editar Clínica"
                                                        >
                                                            <Edit3 size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={() => alternarStatus(clinica.id, isAtiva)}
                                                            className={`p-2.5 rounded-xl transition-all border shadow-lg shadow-black/20 ${
                                                                isAtiva 
                                                                ? 'bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white border-red-500/30' 
                                                                : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-600 hover:text-white border-emerald-500/30'
                                                            }`}
                                                            title={isAtiva ? "Bloquear Acesso" : "Reativar Acesso"}
                                                        >
                                                            {isAtiva ? <PowerOff size={18} /> : <Power size={18} />}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500 italic text-sm">
                                            Nenhuma clínica {filtro === 'ATIVAS' ? 'ativa' : 'inativa'} encontrada na rede.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Legenda de Selos */}
                <div className="mt-8 flex flex-wrap items-center gap-8 justify-center p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🥇</span> 
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ouro (+50)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🥈</span> 
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Prata (+20)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🥉</span> 
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Bronze (+1)</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GestaoClinicas;