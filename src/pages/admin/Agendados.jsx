import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Search, RefreshCcw, FileText, Loader2, X, User, PawPrint, CheckCircle, MessageCircle, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { gerarGuiaCastracao } from '../../utils/GeradorPDF';

// A importação correta para o arquivo que você acabou de criar:
import { messagesService } from '../../services/whatsappService';

const Agendados = () => {
    // ... restante do componente
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
            // HIGIENIZAÇÃO: Remove 'Z' ou offsets para manter o horário local da ONG
            const dadosLimpos = response.data.map(item => ({
                ...item,
                dataHora: item.dataHora.replace(/Z$|[+-]\d{2}:\d{2}$/, '').split('.')[0]
            }));
            setAgendados(dadosLimpos);
        } catch (error) { 
            console.error("Erro ao buscar agendados:", error); 
        } finally { setLoading(false); }
    };

    const carregarClinicas = async () => {
        try {
            const response = await api.get('/admin/clinicas');
            setClinicas(response.data.filter(c => c.administrador?.ativo));
        } catch (error) { console.error(error); }
    };

    const abrirReagendamento = (item) => {
        setSelectedAgendamento(item);
        const [data, hora] = item.dataHora.split('T');
        setNovosDados({
            data: data,
            hora: hora.substring(0, 5),
            clinicaId: item.clinica?.id || ''
        });
        setShowSucesso(false);
        setLinkWhats(null);
        carregarClinicas();
        setShowModal(true);
    };

    const ehAmanha = (dataIso) => {
        if (!dataIso) return false;
        const dataAgendamento = dataIso.split('T')[0];
        const amanhaObj = new Date();
        amanhaObj.setDate(amanhaObj.getDate() + 1);
        const amanhaString = amanhaObj.toISOString().split('T')[0];
        return dataAgendamento === amanhaString;
    };

    const handleReagendar = async () => {
        if (!novosDados.data || !novosDados.hora) return alert("Preencha data e hora.");
        
        setActionLoading(true);
        try {
            const dataHoraIso = `${novosDados.data}T${novosDados.hora}:00`;
            const payload = {
                agendamentoId: String(selectedAgendamento.id),
                dataHora: dataHoraIso,
                clinicaId: String(novosDados.clinicaId)
            };

            const response = await api.put(`/admin/agendamentos/reagendar`, payload);
            
            const itemAtualizado = {
                ...response.data,
                dataHora: response.data.dataHora.replace(/Z$|[+-]\d{2}:\d{2}$/, '').split('.')[0]
            };
            
            setAgendados(agendados.map(a => a.id === selectedAgendamento.id ? itemAtualizado : a));
            
            // USANDO O SERVICE V2: Gera o link de reagendamento centralizado
            const clinicaSelec = clinicas.find(c => c.id === parseInt(novosDados.clinicaId)) || selectedAgendamento.clinica;
            const link = messagesService.gerarLinkReagendamento({
                tutorNome: selectedAgendamento.cadastro.tutor.nome,
                petNome: selectedAgendamento.cadastro.pet.nomeAnimal,
                whatsapp: selectedAgendamento.cadastro.tutor.whatsapp,
                dataHora: dataHoraIso,
                clinicaNome: clinicaSelec?.nome || "Clínica Parceira"
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

    return (
        <div className="p-6 bg-slate-950 min-h-screen space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">
                        Cronograma de <span className="text-emerald-500">Procedimentos</span>
                    </h1>
                    <p className="text-slate-400 text-sm italic">V2 - Gestão de castrações agendadas e alertas de jejum.</p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input
                        type="text" placeholder="Buscar Pet ou Código..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-emerald-500/50"
                        onChange={(e) => setBusca(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid de Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtrarAgendados.map((item) => {
                    const alertaVespera = ehAmanha(item.dataHora);
                    const [dataCard, horaCard] = item.dataHora.split('T');
                    const dataFormatadaCard = dataCard.split('-').reverse().join('/');
                    const horaFormatadaCard = horaCard.substring(0, 5);

                    return (
                        <div key={item.id} className={`bg-slate-900/50 border rounded-[2rem] p-6 transition-all relative overflow-hidden ${alertaVespera ? 'border-emerald-500 shadow-lg shadow-emerald-900/20' : 'border-slate-800'}`}>
                            {alertaVespera && (
                                <div className="absolute top-0 right-0 bg-emerald-500 text-[10px] font-black px-4 py-1.5 rounded-bl-2xl text-slate-950 flex items-center gap-1 z-10">
                                    <AlertCircle size={12} strokeWidth={3} /> AMANHÃ
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center border ${alertaVespera ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                                        <PawPrint size={28} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-lg font-black tracking-widest border border-slate-700">#{item.codigoHash}</span>
                                        <h3 className="text-xl font-bold text-white leading-tight">{item.cadastro.pet.nomeAnimal}</h3>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button onClick={() => abrirReagendamento(item)} title="Reagendar" className="p-2 bg-slate-800 text-slate-400 rounded-lg hover:text-amber-500 transition-colors border border-slate-700">
                                        <RefreshCcw size={18} />
                                    </button>
                                    {/* USANDO O SERVICE V2 PARA O LEMBRETE */}
                                    <a href={messagesService.gerarLinkLembrete(item)} target="_blank" rel="noreferrer" title="Enviar Lembrete de Jejum"
                                       className={`p-2 rounded-lg border transition-all flex items-center justify-center ${alertaVespera ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-emerald-500'}`}>
                                        <MessageCircle size={18} />
                                    </a>
                                    <button onClick={() => gerarGuiaCastracao(item)} title="Gerar PDF" className="p-2 bg-slate-800 text-slate-400 rounded-lg hover:text-blue-500 transition-colors border border-slate-700">
                                        <FileText size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className={`space-y-3 p-4 rounded-2xl border transition-colors ${alertaVespera ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-slate-950/40 border-slate-800/50'}`}>
                                <div className="flex items-center gap-3 text-slate-300">
                                    <User size={16} className="text-emerald-500" />
                                    <span className="text-sm font-medium">{item.cadastro.tutor.nome}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-300">
                                    <Calendar size={16} className="text-emerald-500" />
                                    <span className={`text-sm font-bold ${alertaVespera ? 'text-emerald-400' : ''}`}>
                                        {dataFormatadaCard} às {horaFormatadaCard}
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

            {/* MODAL DE REAGENDAMENTO */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-700 p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
                        <button onClick={() => setShowModal(false)} className="absolute right-6 top-6 text-slate-500 hover:text-white"><X size={24} /></button>
                        {!showSucesso ? (
                            <div className="space-y-5">
                                <div className="text-center mb-2">
                                    <RefreshCcw className="mx-auto text-amber-500 mb-2" size={32} />
                                    <h2 className="text-2xl font-black text-white italic uppercase">Reagendar</h2>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-2">Nova Data</label>
                                    <input type="date" value={novosDados.data} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white mt-1 focus:border-emerald-500 outline-none"
                                           onChange={(e) => setNovosDados({ ...novosDados, data: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-2">Nova Hora</label>
                                    <input type="time" value={novosDados.hora} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white mt-1 focus:border-emerald-500 outline-none"
                                           onChange={(e) => setNovosDados({ ...novosDados, hora: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-2">Clínica</label>
                                    <select className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white mt-1 focus:border-emerald-500 outline-none"
                                            value={novosDados.clinicaId} onChange={(e) => setNovosDados({ ...novosDados, clinicaId: e.target.value })}>
                                        <option value="">Manter Clínica...</option>
                                        {clinicas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                                    </select>
                                </div>
                                <button onClick={handleReagendar} disabled={actionLoading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-900/20">
                                    {actionLoading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />} SALVAR ALTERAÇÃO
                                </button>
                            </div>
                        ) : (
                            <div className="text-center animate-in zoom-in duration-300">
                                <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/50">
                                    <CheckCircle size={40} />
                                </div>
                                <h2 className="text-2xl font-black text-white uppercase mb-2">Agenda Atualizada!</h2>
                                <p className="text-slate-400 text-sm mb-8">O novo horário foi registrado com sucesso.</p>
                                <a href={linkWhats} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-black no-underline transition-all shadow-lg shadow-emerald-900/20 active:scale-95">
                                    <MessageCircle size={24} /> ENVIAR NOVO HORÁRIO
                                </a>
                                <button onClick={() => setShowModal(false)} className="mt-8 text-slate-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">Voltar ao Cronograma</button>
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
 * RESUMO DO CÓDIGO (V2 ADAPTADA):
 * - Integração V2: Importa 'messagesService' de arquivo externo para gerenciar textos de WhatsApp.
 * - Limpeza: Removida a declaração local de mensagens, deixando o componente focado apenas em UI e API.
 * - UX: Mantida a lógica de "Amanhã" com selo visual e botão de lembrete em destaque (Verde).
 * - Fuso Horário: Sanitização de data (ISO sem Z) para evitar que o tutor receba o horário errado por conta do servidor.
 */