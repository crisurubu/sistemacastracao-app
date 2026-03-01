import React, { useState, useEffect, useMemo } from 'react';
import { Eye, CheckCircle, XCircle, Clock, Loader2, DollarSign, Search, MessageCircle } from 'lucide-react';
import api from '../../services/api';

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

    useEffect(() => {
        fetchPagamentos();
    }, []);

    // LÓGICA DE FILTRO OTIMIZADA COM USEMEMO
    const pagamentosFiltrados = useMemo(() => {
        const termo = filtro.toLowerCase();
        return pendentes.filter(pago => {
            const nomePet = (pago.cadastro?.pet?.nomeAnimal || "").toLowerCase();
            const nomeTutor = (pago.cadastro?.tutor?.nome || "").toLowerCase();
            const dataSolicitacao = pago.cadastro?.dataSolicitacao
                ? new Date(pago.cadastro.dataSolicitacao).toLocaleDateString('pt-BR')
                : "";

            return nomePet.includes(termo) || nomeTutor.includes(termo) || dataSolicitacao.includes(termo);
        });
    }, [pendentes, filtro]);

    const formatarUrlComprovante = (url) => {
        if (!url) return "#";
        if (url.startsWith('http')) return url;
        const baseUrl = api.defaults.baseURL.replace('/api', '');
        return `${baseUrl}/uploads/${url}`;
    };

    const handleAprovar = async (pago) => {
        const tutor = pago.cadastro?.tutor;
        const pet = pago.cadastro?.pet;
        const whatsappLimpo = (tutor?.whatsapp || "").replace(/\D/g, '');

        try {
            setProcessandoId(pago.id);
            await api.patch(`/admin/pagamentos/${pago.id}/aprovar`);

            const mensagem =
                `Olá ${tutor?.nome}! Seu pagamento para a castração do(a) *${pet?.nomeAnimal}* foi CONFIRMADO! ✅\n\n` +
                `*Próximos Passos:*\n` +
                `1. Seu cadastro entrou na fila de agendamento oficial.\n` +
                `2. Aguarde nosso contato via WhatsApp/E-mail com a data e local da cirurgia.\n\n` +
                `Obrigado por contribuir com o projeto! 🐾`;

            const urlWa = `https://wa.me/55${whatsappLimpo}?text=${encodeURIComponent(mensagem)}`;

            setPendentes(prev => prev.filter(p => p.id !== pago.id));

            if (whatsappLimpo && window.confirm("Pagamento aprovado! Deseja enviar o comprovante de confirmação via WhatsApp?")) {
                window.open(urlWa, '_blank');
            }
        } catch (error) {
            alert(error.response?.data?.message || "Erro ao aprovar.");
        } finally {
            setProcessandoId(null);
        }
    };

    const handleRejeitar = async (pago) => {
        const tutor = pago.cadastro?.tutor;
        const pet = pago.cadastro?.pet;
        const whatsappLimpo = (tutor?.whatsapp || "").replace(/\D/g, '');

        if (!window.confirm(`ATENÇÃO: Deseja REJEITAR e EXCLUIR permanentemente os dados do pet ${pet?.nomeAnimal}?`)) return;

        try {
            setProcessandoId(pago.id);
            const mensagem =
                `Olá ${tutor?.nome}, o comprovante do pet *${pet?.nomeAnimal}* não pôde ser validado. ❌\n\n` +
                `*Motivos comuns:* Valor incorreto, imagem ilegível ou documento inválido.\n\n` +
                `Por favor, realize um novo cadastro ou entre em contato: sistemacastracao@gmail.com`;

            const urlWa = `https://wa.me/55${whatsappLimpo}?text=${encodeURIComponent(mensagem)}`;

            await api.patch(`/admin/pagamentos/${pago.id}/rejeitar`);
            setPendentes(prev => prev.filter(p => p.id !== pago.id));

            if (whatsappLimpo && window.confirm("Dados removidos. Notificar tutor sobre a rejeição?")) {
                window.open(urlWa, '_blank');
            }
        } catch (error) {
            alert("Erro ao processar a exclusão.");
        } finally {
            setProcessandoId(null);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
                        Fluxo de <span className="text-blue-500">Pagamentos</span>
                    </h1>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Auditória de contribuições sociais</p>
                </div>

                <div className="flex items-center gap-4 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar pet, tutor ou data..."
                            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-white focus:border-blue-500 transition-all outline-none text-sm font-medium"
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                        />
                    </div>
                    
                    <div className="bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-2xl hidden sm:block">
                        <span className="text-emerald-500 text-[10px] font-black uppercase block tracking-tighter text-center">Volume em Análise</span>
                        <span className="text-white font-mono font-black text-lg">
                            R$ {pagamentosFiltrados.reduce((acc, curr) => acc + (curr.valorContribuicao || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-sm">
                {loading ? (
                    <div className="p-32 flex flex-col items-center justify-center text-slate-600">
                        <Loader2 className="animate-spin mb-6 text-blue-500" size={48} />
                        <p className="font-black uppercase tracking-[0.3em] text-sm animate-pulse">Sincronizando Banco de Dados...</p>
                    </div>
                ) : pagamentosFiltrados.length === 0 ? (
                    <div className="p-32 text-center">
                        <CheckCircle className="mx-auto text-slate-800 mb-4" size={50} />
                        <p className="text-slate-500 font-bold italic">Tudo limpo! Nenhum pagamento pendente no momento.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800">
                                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Data Registro</th>
                                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Paciente / Tutor</th>
                                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Taxa Social</th>
                                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Documentação</th>
                                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Ações de Auditoria</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {pagamentosFiltrados.map((pago) => (
                                    <tr key={pago.id} className={`group hover:bg-slate-800/40 transition-all ${processandoId === pago.id ? 'opacity-30' : ''}`}>
                                        <td className="p-6">
                                            <div className="flex items-center gap-3 text-slate-300 font-mono text-sm">
                                                <Clock size={16} className="text-orange-500" />
                                                {pago.cadastro?.dataSolicitacao ? new Date(pago.cadastro.dataSolicitacao).toLocaleDateString('pt-BR') : '---'}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col">
                                                <span className="text-white font-black text-base uppercase tracking-tighter">{pago.cadastro?.pet?.nomeAnimal}</span>
                                                <span className="text-slate-500 text-[11px] font-bold flex items-center gap-1 uppercase tracking-widest">
                                                    <span className="w-1 h-1 bg-slate-700 rounded-full" /> {pago.cadastro?.tutor?.nome}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-emerald-500/20 p-1.5 rounded-lg text-emerald-500">
                                                    <DollarSign size={16} />
                                                </div>
                                                <span className="text-emerald-400 font-mono font-black text-xl tracking-tighter">
                                                    {Number(pago.valorContribuicao || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <a
                                                href={formatarUrlComprovante(pago.comprovanteUrl)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-blue-600 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl transition-all shadow-lg"
                                            >
                                                <Eye size={14} /> Analisar Pix
                                            </a>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex justify-center gap-4">
                                                {processandoId === pago.id ? (
                                                    <Loader2 className="animate-spin text-blue-500" size={24} />
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleAprovar(pago)}
                                                            className="p-3 bg-slate-800 text-emerald-500 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all hover:scale-110 shadow-xl border border-emerald-500/10"
                                                            title="Confirmar Pagamento"
                                                        >
                                                            <CheckCircle size={22} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleRejeitar(pago)} 
                                                            className="p-3 bg-slate-800 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all hover:scale-110 shadow-xl border border-red-500/10"
                                                            title="Rejeitar e Excluir"
                                                        >
                                                            <XCircle size={22} />
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