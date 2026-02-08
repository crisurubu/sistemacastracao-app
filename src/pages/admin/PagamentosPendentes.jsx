import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import api from '../../services/api';

const PagamentosPendentes = () => {
    const [pendentes, setPendentes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processandoId, setProcessandoId] = useState(null);

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

    // FUNÇÃO QUE RESOLVE O SEU ERRO: Trata se a URL é Nuvem ou Local
    const formatarUrlComprovante = (url) => {
        if (!url) return "#";
        // Se a url já tiver "http", ela vem do Cloudinary. Retornamos ela pura.
        if (url.startsWith('http')) {
            return url;
        }
        // Se não tiver "http", é um arquivo antigo que estava no seu PC
        return `http://localhost:8080/uploads/${url}`;
    };

    const handleAprovar = async (id) => {
        try {
            setProcessandoId(id);
            await api.patch(`/admin/pagamentos/${id}/aprovar`);
            setPendentes(prev => prev.filter(pago => pago.id !== id));
        } catch (error) {
            alert("Erro ao aprovar. Verifique a conexão com o servidor.");
        } finally {
            setProcessandoId(null);
        }
    };

    const handleRejeitar = async (pago) => {
        const tutor = pago.cadastro?.tutor;
        const pet = pago.cadastro?.pet;
        const whatsappLimpo = (tutor?.whatsapp || "").replace(/\D/g, '');

        if (!whatsappLimpo) {
            alert("⚠️ Atenção: Este tutor não tem um número de WhatsApp cadastrado.");
        }

        if (!window.confirm(`Deseja REJEITAR e APAGAR os dados do pet ${pet?.nomeAnimal || 'este pet'}?`)) return;

        try {
            setProcessandoId(pago.id);
            const mensagem = `Olá ${tutor?.nome || 'Tutor(a)'}, aqui é da equipe de Castração. 🐾%0A%0AInformamos que o comprovante enviado para o pet *${pet?.nomeAnimal || 'seu pet'}* não foi validado.%0A%0A*O que fazer?*%0A1. Refaça o cadastro no site enviando o comprovante correto.%0A2. Se preferir, venha até a sede da ONG pessoalmente.`;
            const urlWa = `https://wa.me/55${whatsappLimpo}?text=${mensagem}`;

            await api.patch(`/admin/pagamentos/${pago.id}/rejeitar`);
            setPendentes(prev => prev.filter(p => p.id !== pago.id));

            if (whatsappLimpo) {
                if (window.confirm("✅ Dados excluídos! Deseja abrir o WhatsApp para avisar o tutor?")) {
                    window.open(urlWa, '_blank');
                }
            } else {
                alert("✅ Dados excluídos!");
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
            <div>
                <h1 className="text-2xl font-bold text-white">Aprovação de Pagamentos</h1>
                <p className="text-slate-400 text-sm">Gerencie os comprovantes enviados pela nuvem (Cloudinary).</p>
            </div>

            <div className="bg-[#1e293b] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                {loading ? (
                    <div className="p-20 flex flex-col items-center text-slate-500">
                        <Loader2 className="animate-spin mb-4" size={40} />
                        <p>Carregando dados da fila...</p>
                    </div>
                ) : pendentes.length === 0 ? (
                    <div className="p-20 text-center text-slate-500 italic">
                        Nenhum pagamento aguardando aprovação.
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-900/50 border-b border-slate-800">
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase">Data</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase">Pet / Tutor</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase">Valor</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase">Comprovante</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {pendentes.map((pago) => (
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
                                    <td className="p-4 text-emerald-400 font-mono font-bold">
                                        R$ {pago.valorContribuicao?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="p-4">
                                        {/* AQUI ESTÁ A CORREÇÃO: Usando a função inteligente */}
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
                                                    <button onClick={() => handleAprovar(pago.id)} className="p-2 bg-emerald-600/20 text-emerald-500 rounded-full hover:bg-emerald-600 hover:text-white transition-all">
                                                        <CheckCircle size={20} />
                                                    </button>
                                                    <button onClick={() => handleRejeitar(pago)} className="p-2 bg-red-600/20 text-red-500 rounded-full hover:bg-red-600 hover:text-white transition-all">
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
                )}
            </div>
        </div>
    );
};

export default PagamentosPendentes;