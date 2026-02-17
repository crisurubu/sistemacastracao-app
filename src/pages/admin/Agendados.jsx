import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Search, RefreshCcw, FileText, Loader2, X, User, PawPrint, CheckCircle, MessageCircle, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { gerarGuiaCastracao } from '../../utils/GeradorPDF';

// --- SERVICE DE MENSAGENS PARA O TUTOR ---
const messagesService = {
    gerarLinkReagendamento: (dados) => {
        const dataFormatada = new Date(dados.dataHora + 'Z').toLocaleDateString('pt-BR', {timeZone: 'UTC'});
        const horaFormatada = new Date(dados.dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const texto = `Olá *${dados.tutorNome}*! 👋\n\nConfirmamos o reagendamento para a castração do(a) *${dados.petNome}*.\n\n📅 *DATA:* ${dataFormatada}\n⏰ *HORA:* ${horaFormatada}\n🏥 *CLÍNICA:* ${dados.clinicaNome}\n\n_Por favor, leve a Guia de Castração e siga as orientações de jejum._`;
        return `https://wa.me/55${dados.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(texto)}`;
    },
    gerarLinkLembrete: (item) => {
        const horaFormatada = new Date(item.dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const texto = `Olá *${item.cadastro.tutor.nome}*! 🐾\n\nLembrete da castração do(a) *${item.cadastro.pet.nomeAnimal}* AMANHÃ!\n\n⏰ *HORÁRIO:* ${horaFormatada}\n🏥 *LOCAL:* ${item.clinica?.nome}\n\n⚠️ *IMPORTANTE:* O animal deve estar em JEJUM TOTAL (água e comida) por 8 a 12 horas.`;
        return `https://wa.me/55${item.cadastro.tutor.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(texto)}`;
    }
};

const Agendados = () => {
    const [agendados, setAgendados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [busca, setBusca] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedAgendamento, setSelectedAgendamento] = useState(null);
    const [novosDados, setNovosDados] = useState({ data: '', hora: '', clinicaId: '' });
    const [clinicas, setClinicas] = useState([]);
    const [showSucesso, setShowSucesso] = useState(false);
    const [linkWhats, setLinkWhats] = useState(null);

    useEffect(() => { fetchAgendados(); }, []);

    const fetchAgendados = async () => {
        try {
            const response = await api.get('/admin/agendamentos/pendentes');
            setAgendados(response.data);
        } catch (error) { console.error("Erro ao buscar agendados:", error); } 
        finally { setLoading(false); }
    };

    const carregarClinicas = async () => {
        try {
            const response = await api.get('/admin/clinicas');
            setClinicas(response.data.filter(c => c.administrador?.ativo));
        } catch (error) { console.error(error); }
    };

    const ehAmanha = (dataIso) => {
        const amanha = new Date();
        amanha.setDate(amanha.getDate() + 1);
        const dataAgend = new Date(dataIso);
        return dataAgend.toDateString() === amanha.toDateString();
    };

    const abrirReagendamento = (item) => {
        setSelectedAgendamento(item);
        setNovosDados({ data: '', hora: '', clinicaId: item.clinica?.id || '' });
        setShowSucesso(false);
        setLinkWhats(null);
        setShowModal(true);
        carregarClinicas();
    };

    const handleReagendar = async () => {
        if (!novosDados.data || !novosDados.hora) return alert("Preencha data e hora.");
        setActionLoading(true);
        try {
            const dataHoraIso = `${novosDados.data}T${novosDados.hora}`;
            const payload = {
                agendamentoId: selectedAgendamento.id,
                dataHora: dataHoraIso,
                clinicaId: novosDados.clinicaId
            };
            const response = await api.put(`/admin/agendamentos/reagendar`, payload);
            
            // Atualiza lista local
            setAgendados(agendados.map(a => a.id === selectedAgendamento.id ? response.data : a));
            
            const clinicaSelec = clinicas.find(c => c.id === parseInt(novosDados.clinicaId)) || selectedAgendamento.clinica;
            const link = messagesService.gerarLinkReagendamento({
                tutorNome: selectedAgendamento.cadastro.tutor.nome,
                petNome: selectedAgendamento.cadastro.pet.nomeAnimal,
                whatsapp: selectedAgendamento.cadastro.tutor.whatsapp,
                dataHora: dataHoraIso,
                clinicaNome: clinicaSelec.nome
            });
            
            setLinkWhats(link);
            setShowSucesso(true);
        } catch (error) { 
            alert(error.response?.data?.message || "Erro ao reagendar."); 
        } finally { setActionLoading(false); }
    };

    const filtrarAgendados = agendados.filter(a =>
        a.cadastro.pet.nomeAnimal.toLowerCase().includes(busca.toLowerCase()) ||
        a.codigoHash.includes(busca.toUpperCase())
    );

    if (loading) return (
        <div className="flex h-screen flex-col items-center justify-center bg-slate-950">
            <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
            <p className="text-slate-400 font-black italic uppercase tracking-widest text-xs">Sincronizando Cronograma...</p>
        </div>
    );

    return (
        <div className="p-6 bg-slate-950 min-h-screen space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">
                        Cronograma de <span className="text-emerald-500">Procedimentos</span>
                    </h1>
                    <p className="text-slate-400 text-sm italic">Gestão de castrações agendadas e alertas de jejum.</p>
                </div>
                <div className="relative group w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input
                        type="text" placeholder="Buscar Pet ou Código..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-emerald-500/50"
                        onChange={(e) => setBusca(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtrarAgendados.map((item) => {
                    const alertaVespera = ehAmanha(item.dataHora);
                    return (
                        <div key={item.id} className={`bg-slate-900/50 border rounded-[2rem] p-6 transition-all relative overflow-hidden ${alertaVespera ? 'border-emerald-500/50 shadow-lg shadow-emerald-900/10' : 'border-slate-800'}`}>
                            
                            {alertaVespera && (
                                <div className="absolute top-0 right-0 bg-emerald-500 text-[9px] font-black px-3 py-1 rounded-bl-xl text-slate-950 animate-pulse">
                                    <AlertCircle size={10} className="inline mr-1" /> PROCEDIMENTO AMANHÃ
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-14 w-14 rounded-2xl flex items-center justify-center border bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                        <PawPrint size={28} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-lg font-black tracking-widest border border-slate-700">#{item.codigoHash}</span>
                                        <h3 className="text-xl font-bold text-white leading-tight">{item.cadastro.pet.nomeAnimal}</h3>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button onClick={() => abrirReagendamento(item)} className="p-2 bg-slate-800 text-slate-400 rounded-lg hover:text-amber-500 transition-colors border border-slate-700">
                                        <RefreshCcw size={18} />
                                    </button>
                                    <a href={messagesService.gerarLinkLembrete(item)} target="_blank" rel="noreferrer" 
                                       className={`p-2 rounded-lg border transition-all flex items-center justify-center ${alertaVespera ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                                        <MessageCircle size={18} />
                                    </a>
                                    <button onClick={() => gerarGuiaCastracao(item)} className="p-2 bg-slate-800 text-slate-400 rounded-lg hover:text-blue-500 transition-colors border border-slate-700">
                                        <FileText size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50">
                                <div className="flex items-center gap-3 text-slate-300">
                                    <User size={16} className="text-emerald-500" />
                                    <span className="text-sm">{item.cadastro.tutor.nome}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-300">
                                    <Calendar size={16} className="text-emerald-500" />
                                    <span className={`text-sm font-bold ${alertaVespera ? 'text-emerald-400' : ''}`}>
                                        {new Date(item.dataHora).toLocaleDateString('pt-BR')} às {new Date(item.dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-300">
                                    <MapPin size={16} className="text-emerald-500" />
                                    <span className="text-sm truncate">{item.clinica?.nome || "Clínica Parceira"}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* MODAL SIMPLIFICADO */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-700 p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl relative">
                        <button onClick={() => setShowModal(false)} className="absolute right-6 top-6 text-slate-500"><X size={24} /></button>
                        
                        {!showSucesso ? (
                            <div className="space-y-5">
                                <h2 className="text-2xl font-black text-white italic uppercase text-center">Reagendar</h2>
                                <input type="date" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white"
                                       onChange={(e) => setNovosDados({ ...novosDados, data: e.target.value })} />
                                <input type="time" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white"
                                       onChange={(e) => setNovosDados({ ...novosDados, hora: e.target.value })} />
                                <select className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white"
                                        value={novosDados.clinicaId} onChange={(e) => setNovosDados({ ...novosDados, clinicaId: e.target.value })}>
                                    <option value="">Manter Clínica...</option>
                                    {clinicas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                                </select>
                                <button onClick={handleReagendar} disabled={actionLoading} className="w-full bg-emerald-600 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2">
                                    {actionLoading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />} CONFIRMAR
                                </button>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500"><CheckCircle size={32} /></div>
                                <h2 className="text-xl font-black text-white uppercase mb-6">Reagendado!</h2>
                                <a href={linkWhats} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 bg-emerald-600 text-white py-4 rounded-xl font-black no-underline">
                                    <MessageCircle size={24} /> AVISAR TUTOR
                                </a>
                                <button onClick={() => setShowModal(false)} className="mt-6 text-slate-500 text-xs font-bold uppercase tracking-widest">Fechar</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Agendados;

/**
 * RESUMO DO CÓDIGO:
 * - Filtro de Véspera: Detecta agendamentos de amanhã e ativa alerta de jejum.
 * - WhatsApp Inteligente: Links dinâmicos para avisar sobre reagendamentos ou lembretes de jejum.
 * - Gestão de Clínica: Permite trocar a clínica responsável durante o reagendamento.
 * - UX Visual: Cards com blur e bordas animadas para itens urgentes.
 */