import React, { useState, useEffect } from 'react';
import { CheckCircle2, Phone, Calendar, Loader2, X, MapPin, Clock, User, PawPrint, Search, Mail } from 'lucide-react';
import api from '../../services/api';

const FilaCastracao = () => {
    const [fila, setFila] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [dadosAgendamento, setDadosAgendamento] = useState({ data: '', hora: '', clinicaId: '' });
    const [submitting, setSubmitting] = useState(false);
    const [clinicas, setClinicas] = useState([]);
    const [filtro, setFiltro] = useState("");

    useEffect(() => { fetchFila(); }, []);

    const fetchFila = async () => {
        try {
            const response = await api.get('/admin/fila-espera');
            setFila(response.data);
        } catch (error) { 
            console.error("Erro ao buscar fila:", error); 
        } finally { 
            setLoading(false); 
        }
    };

    const filaFiltrada = fila.filter(item => {
        const termo = filtro.toLowerCase();
        const nomePet = (item.pet?.nomeAnimal || "").toLowerCase();
        const nomeTutor = (item.tutor?.nome || "").toLowerCase();
        return nomePet.includes(termo) || nomeTutor.includes(termo);
    });

    const carregarClinicas = async () => {
        try {
            const response = await api.get('/admin/clinicas');
            // Filtra apenas clínicas ativas
            setClinicas(response.data.filter(c => c.administrador?.ativo));
        } catch (error) { 
            console.error("Erro ao carregar clínicas:", error); 
        }
    };

    const handleAbrirAgendamento = (item) => {
        setSelectedItem(item);
        setDadosAgendamento({ data: '', hora: '', clinicaId: '' });
        setShowModal(true);
        carregarClinicas();
    };

    const confirmarAgendamento = async () => {
        if (!dadosAgendamento.data || !dadosAgendamento.hora || !dadosAgendamento.clinicaId) {
            alert("Preencha todos os campos do agendamento!"); 
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                cadastroId: selectedItem.id,
                dataHora: `${dadosAgendamento.data}T${dadosAgendamento.hora}`,
                clinicaId: dadosAgendamento.clinicaId
            };
            
            const response = await api.post('/admin/agendamentos', payload);
            const agendamento = response.data;

            const hashReal = agendamento.codigoHash;
            const localAgendamento = agendamento.local;

            if (!hashReal) {
                throw new Error("O servidor não gerou o código HASH necessário para a clínica.");
            }

            const [ano, mes, dia] = dadosAgendamento.data.split('-');
            const dataHoraFormatada = `${dia}/${mes}/${ano} às ${dadosAgendamento.hora}`;

            // Mensagem personalizada incluindo os dados da ONG salvos nas instruções
            const corpoEmail = 
                `*AGENDAMENTO DE CASTRAÇÃO - SISTEMA CASTRACAO ONG*\n\n` +
                `Olá, ${selectedItem.tutor?.nome}!\n` +
                `O agendamento para o(a) *${selectedItem.pet?.nomeAnimal}* foi confirmado.\n\n` +
                `📅 *DATA/HORA:* ${dataHoraFormatada}\n` +
                `📍 *LOCAL:* ${localAgendamento}\n` +
                `🔑 *CÓDIGO HASH (Apresentar na clínica):* ${hashReal}\n\n` +
                `_Dúvidas? Entre em contato: sistemacastracao@gmail.com_\n` +
                `Até breve!`;
            
            const linkWhatsapp = `https://wa.me/55${selectedItem.tutor?.whatsapp?.replace(/\D/g, '')}?text=${encodeURIComponent(corpoEmail)}`;

            // Remove da fila local apenas após sucesso
            setFila(fila.filter(f => f.id !== selectedItem.id));
            setShowModal(false);
            
            window.open(linkWhatsapp, '_blank');
            alert("Agendamento realizado com sucesso! O Hash de validação foi gerado.");
            
        } catch (error) { 
            console.error("Erro no fluxo de agendamento:", error);
            alert(error.response?.data?.message || error.message || "Erro ao processar agendamento."); 
        } finally { 
            setSubmitting(false); 
        }
    };

    const getMedalha = (selo) => {
        switch(selo) {
            case 'OURO': return '🥇';
            case 'PRATA': return '🥈';
            case 'BRONZE': return '🥉';
            default: return '🎖️';
        }
    };

    if (loading) return (
        <div className="flex h-screen flex-col items-center justify-center bg-slate-950">
            <div className="relative">
                <div className="h-16 w-16 rounded-full border-t-4 border-blue-500 animate-spin"></div>
                <PawPrint className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500" size={20} />
            </div>
            <p className="mt-4 text-slate-400 font-medium animate-pulse">Sincronizando fila de espera...</p>
        </div>
    );

    return (
        <div className="p-6 bg-slate-950 min-h-screen space-y-8 font-sans text-slate-200">
            {/* Cabeçalho e Busca */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-800 pb-8">
                <div className="flex-1 w-full">
                    <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
                        Fila de Castração <span className="text-blue-500 text-sm bg-blue-500/10 px-3 py-1 rounded-full uppercase tracking-widest">Master</span>
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium mb-6">Controle de animais prontos para encaminhamento.</p>
                    
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                        <input 
                            type="text"
                            placeholder="Buscar por pet ou tutor..."
                            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-2xl border border-slate-800 shadow-inner h-fit">
                    <div className="bg-emerald-500/20 p-3 rounded-xl">
                        <CheckCircle2 className="text-emerald-400" size={24} />
                    </div>
                    <div className="pr-4">
                        <span className="block text-2xl font-bold text-white leading-none">{filaFiltrada.length}</span>
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Na Lista</span>
                    </div>
                </div>
            </div>

            {/* Tabela de Fila */}
            <div className="bg-slate-900/50 rounded-3xl border border-slate-800 overflow-hidden backdrop-blur-md shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800/30">
                                <th className="p-5 text-xs font-bold text-slate-500 uppercase">Informações do Pet</th>
                                <th className="p-5 text-xs font-bold text-slate-500 uppercase">Responsável (Tutor)</th>
                                <th className="p-5 text-xs font-bold text-slate-500 uppercase">Data do Cadastro</th>
                                <th className="p-5 text-xs font-bold text-slate-500 uppercase text-center">Gestão</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {filaFiltrada.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-20 text-center text-slate-500 italic">
                                        Nenhum registro encontrado na fila de espera.
                                    </td>
                                </tr>
                            ) : filaFiltrada.map((item) => (
                                <tr key={item.id} className="hover:bg-blue-500/[0.02] transition-all group">
                                    <td className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg
                                                ${item.pet?.especie?.toUpperCase() === 'GATO' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                {item.pet?.nomeAnimal?.charAt(0) || 'P'}
                                            </div>
                                            <div>
                                                <div className="text-white font-bold text-lg group-hover:text-blue-400 transition-colors">{item.pet?.nomeAnimal}</div>
                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider
                                                    ${item.pet?.especie?.toUpperCase() === 'GATO' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                                    {item.pet?.especie}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5 text-slate-300">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-slate-800 p-2 rounded-lg text-slate-500"><User size={18} /></div>
                                            <div>
                                                <div className="font-semibold text-slate-200">{item.tutor?.nome}</div>
                                                <div className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Phone size={10} /> {item.tutor?.whatsapp}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="inline-flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-xl border border-slate-700/50 text-slate-400 text-sm">
                                            <Clock size={14} className="text-blue-500" />
                                            {item.dataSolicitacao ? new Date(item.dataSolicitacao).toLocaleDateString('pt-BR') : 'Hoje'}
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex gap-2 justify-center">
                                            {item.tutor?.whatsapp && (
                                                <a href={`https://wa.me/55${item.tutor.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                                                   className="p-3 bg-slate-800 text-slate-400 rounded-xl hover:bg-emerald-500 hover:text-white hover:scale-110 transition-all shadow-lg border border-slate-700">
                                                    <Phone size={18} />
                                                </a>
                                            )}
                                            <button onClick={() => handleAbrirAgendamento(item)}
                                                className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 hover:scale-110 transition-all shadow-lg shadow-blue-900/40 border border-blue-400/20">
                                                <Calendar size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Agendamento */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-slate-700/50 p-8 rounded-[2.5rem] w-full max-w-md shadow-[0_0_50px_-12px_rgba(59,130,246,0.5)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl -mr-16 -mt-16 rounded-full"></div>

                        <div className="flex justify-between items-start mb-8 relative">
                            <div>
                                <h2 className="text-2xl font-black text-white leading-tight">Agendar Procedimento</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <PawPrint size={14} className="text-blue-500" />
                                    <p className="text-slate-400 text-sm font-bold">{selectedItem?.pet?.nomeAnimal}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} className="bg-slate-800 p-2 rounded-full text-slate-400 hover:text-white hover:bg-red-500/20 transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="space-y-6 relative">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Data</label>
                                    <input type="date" className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        value={dadosAgendamento.data}
                                        onChange={(e) => setDadosAgendamento({...dadosAgendamento, data: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Horário</label>
                                    <input type="time" className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        value={dadosAgendamento.hora}
                                        onChange={(e) => setDadosAgendamento({...dadosAgendamento, hora: e.target.value})} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Clínica Executora (Parceria)</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                                    <select 
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-4 pl-12 text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer font-medium"
                                        value={dadosAgendamento.clinicaId}
                                        onChange={(e) => setDadosAgendamento({...dadosAgendamento, clinicaId: e.target.value})}
                                    >
                                        <option value="">Selecione a parceira...</option>
                                        {clinicas.map(c => (
                                            <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                                                {getMedalha(c.selo)} {c.nome}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button 
                            disabled={submitting}
                            onClick={confirmarAgendamento}
                            className="w-full mt-10 bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-blue-900/40"
                        >
                            {submitting ? <Loader2 className="animate-spin" size={20} /> : (
                                <>
                                    <span>FINALIZAR ENCAMINHAMENTO</span>
                                    <CheckCircle2 size={20} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilaCastracao;