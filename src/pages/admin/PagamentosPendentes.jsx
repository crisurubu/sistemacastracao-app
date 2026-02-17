import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle, XCircle, Clock, Loader2, DollarSign, Search } from 'lucide-react';
import api from '../../services/api';

const PagamentosPendentes = () => {
    const [pendentes, setPendentes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processandoId, setProcessandoId] = useState(null);
    const [filtro, setFiltro] = useState(""); // Estado para o campo de busca

    const fetchPagamentos = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/pagamentos/pendentes');
            const data = Array.isArray(response.data) ? response.data : [];
            setPendentes(data);
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

    // LÓGICA DE FILTRO (Pet ou Data)
    const pagamentosFiltrados = pendentes.filter(pago => {
        const termo = filtro.toLowerCase();
        const nomePet = (pago.cadastro?.pet?.nomeAnimal || "").toLowerCase();
        const dataSolicitacao = pago.cadastro?.dataSolicitacao
            ? new Date(pago.cadastro.dataSolicitacao).toLocaleDateString('pt-BR')
            : "";

        return nomePet.includes(termo) || dataSolicitacao.includes(termo);
    });

    const formatarUrlComprovante = (url) => {
        if (!url) return "#";
        if (url.startsWith('http')) return url;
        const baseUrl = api.defaults.baseURL.replace('/api', '');
        return `${baseUrl}/uploads/${url}`;
    };

    const handleAprovar = async (pago) => { // Recebe o objeto completo
        const id = pago.id; // Extrai o ID para a URL
        const tutor = pago.cadastro?.tutor;
        const pet = pago.cadastro?.pet;
        const whatsappLimpo = (tutor?.whatsapp || "").replace(/\D/g, '');

        try {
            setProcessandoId(id);
            // Agora a URL terá o ID correto
            await api.patch(`/admin/pagamentos/${id}/aprovar`);

            const mensagem =
                `Olá ${tutor?.nome}! Seu pagamento para a castração do(a) *${pet?.nomeAnimal}* foi CONFIRMADO! ✅\n\n` +
                `*Próximos Passos:*\n` +
                `1. Seu cadastro entrou na fila de agendamento oficial.\n` +
                `2. Aguarde nosso contato via WhatsApp/E-mail com a data e local da cirurgia.\n` +
                `3. Prepare o jejum de 8h apenas quando receber a data confirmada.\n\n` +
                `Obrigado por contribuir com o projeto! 🐾`;

            const urlWa = `https://wa.me/55${whatsappLimpo}?text=${encodeURIComponent(mensagem)}`;

            setPendentes(prev => prev.filter(p => p.id !== id));

            if (whatsappLimpo && window.confirm("Pagamento aprovado! Deseja enviar as instruções de agendamento pelo WhatsApp?")) {
                window.open(urlWa, '_blank');
            } else {
                alert("Pagamento aprovado com sucesso!");
            }
        } catch (error) {
            const msg = error.response?.data?.message || "Erro ao aprovar pagamento.";
            alert(msg);
        } finally {
            setProcessandoId(null);
        }
    };

    const handleRejeitar = async (pago) => {
        const tutor = pago.cadastro?.tutor;
        const pet = pago.cadastro?.pet;
        const whatsappLimpo = (tutor?.whatsapp || "").replace(/\D/g, '');

        if (!window.confirm(`Deseja REJEITAR o comprovante e EXCLUIR os dados do pet ${pet?.nomeAnimal}?`)) return;

        try {
            setProcessandoId(pago.id);

            // --- MENSAGEM DE ERRO/REJEIÇÃO ---
            const mensagem =
                `Olá ${tutor?.nome}, informamos que o comprovante enviado para o pet *${pet?.nomeAnimal}* não foi aceito. ❌\n\n` +
                `*Motivos prováveis:*\n` +
                `- Imagem do comprovante ilegível ou cortada.\n` +
                `- Valor da taxa social incorreto.\n` +
                `- Comprovante não pertence a esta castração.\n\n` +
                `*O que fazer?*\n` +
                `Seus dados foram removidos para segurança. Por favor, realize um novo cadastro com os dados corretos ou entre em contato via e-mail: *sistemacastracao@gmail.com*`;

            const urlWa = `https://wa.me/55${whatsappLimpo}?text=${encodeURIComponent(mensagem)}`;

            await api.patch(`/admin/pagamentos/${pago.id}/rejeitar`);
            setPendentes(prev => prev.filter(p => p.id !== pago.id));

            if (whatsappLimpo && window.confirm("Dados excluídos! Deseja avisar o tutor sobre o erro no comprovante?")) {
                window.open(urlWa, '_blank');
            } else {
                alert("Dados excluídos!");
            }
        } catch (error) {
            console.error("Erro na rejeição:", error);
            alert("Erro ao processar a exclusão.");
        } finally {
            setProcessandoId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div className="flex-1 w-full">
                    <h1 className="text-2xl font-bold text-white">Aprovação de Pagamentos</h1>
                    <p className="text-slate-400 text-sm mb-4">Valide as contribuições sociais dinâmicas configuradas no sistema.</p>

                    {/* CAMPO DE BUSCA */}
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Filtrar por nome do pet ou data (ex: 15/02)..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl h-fit">
                    <span className="text-emerald-500 text-xs font-bold uppercase block">Total em Análise</span>
                    <span className="text-white font-mono font-bold">
                        R$ {pagamentosFiltrados.reduce((acc, curr) => acc + (curr.valorContribuicao || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                </div>
            </div>

            <div className="bg-[#1e293b] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                {loading ? (
                    <div className="p-20 flex flex-col items-center text-slate-500">
                        <Loader2 className="animate-spin mb-4" size={40} />
                        <p>Carregando dados da fila...</p>
                    </div>
                ) : pagamentosFiltrados.length === 0 ? (
                    <div className="p-20 text-center text-slate-500 italic">
                        {filtro ? "Nenhum resultado encontrado para a busca." : "Nenhum pagamento aguardando aprovação."}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-900/50 border-b border-slate-800">
                                    <th className="p-4 text-xs font-bold text-slate-400 uppercase">Data</th>
                                    <th className="p-4 text-xs font-bold text-slate-400 uppercase">Pet / Tutor</th>
                                    <th className="p-4 text-xs font-bold text-slate-400 uppercase">Valor da Taxa</th>
                                    <th className="p-4 text-xs font-bold text-slate-400 uppercase">Comprovante</th>
                                    <th className="p-4 text-xs font-bold text-slate-400 uppercase text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {pagamentosFiltrados.map((pago) => (
                                    <tr key={pago.id} className={`hover:bg-slate-800/30 transition-colors ${processandoId === pago.id ? 'opacity-50 pointer-events-none' : ''}`}>
                                        <td className="p-4 text-slate-400 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Clock size={14} className="text-orange-500" />
                                                {pago.cadastro?.dataSolicitacao
                                                    ? new Date(pago.cadastro.dataSolicitacao).toLocaleDateString('pt-BR')
                                                    : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-white font-bold">{pago.cadastro?.pet?.nomeAnimal || 'Pet'}</span>
                                                <span className="text-slate-500 text-xs">{pago.cadastro?.tutor?.nome || 'Tutor'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1.5">
                                                <DollarSign size={14} className="text-emerald-500" />
                                                <span className="text-emerald-400 font-mono font-bold text-lg">
                                                    {(pago.valorContribuicao || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Taxa Social</span>
                                        </td>
                                        <td className="p-4">
                                            <a
                                                href={formatarUrlComprovante(pago.comprovanteUrl)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-2 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                <Eye size={14} /> Ver Doc
                                            </a>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex justify-center gap-3">
                                                {processandoId === pago.id ? (
                                                    <Loader2 className="animate-spin text-blue-400" size={20} />
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleAprovar(pago)}
                                                            title="Aprovar Pagamento"
                                                            className="p-2 bg-emerald-600/20 text-emerald-500 rounded-full hover:bg-emerald-600 hover:text-white transition-all"
                                                        >
                                                            <CheckCircle size={20} />
                                                        </button>
                                                        <button onClick={() => handleRejeitar(pago)} title="Rejeitar e Excluir" className="p-2 bg-red-600/20 text-red-500 rounded-full hover:bg-red-600 hover:text-white transition-all">
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