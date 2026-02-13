import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Search, RefreshCcw, FileText, Loader2, X, Hash, User, PawPrint, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import { gerarGuiaCastracao } from '../../utils/GeradorPDF';

const Agendados = () => {
    const [agendados, setAgendados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busca, setBusca] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedAgendamento, setSelectedAgendamento] = useState(null);
    const [novosDados, setNovosDados] = useState({ data: '', hora: '', clinicaId: '' });
    const [clinicas, setClinicas] = useState([]);

    useEffect(() => { fetchAgendados(); }, []);

    const fetchAgendados = async () => {
        try {
            const response = await api.get('/admin/agendamentos/pendentes');
            setAgendados(response.data);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const carregarClinicas = async () => {
        try {
            const response = await api.get('/admin/clinicas');
            setClinicas(response.data.filter(c => c.administrador?.ativo));
        } catch (error) { console.error(error); }
    };

    const abrirReagendamento = (item) => {
        setSelectedAgendamento(item);
        setNovosDados({ data: '', hora: '', clinicaId: item.clinica?.id || '' });
        setShowModal(true);
        carregarClinicas();
    };

    const handleReagendar = async () => {
        try {
            const payload = {
                agendamentoId: selectedAgendamento.id,
                dataHora: `${novosDados.data}T${novosDados.hora}`,
                clinicaId: novosDados.clinicaId
            };
            const response = await api.put(`/admin/agendamentos/reagendar`, payload);
            setAgendados(agendados.map(a => a.id === selectedAgendamento.id ? response.data : a));
            setShowModal(false);
            alert("Sucesso! Novo e-mail de agendamento enviado.");
        } catch (error) { alert("Erro ao reagendar."); }
    };

    const filtrarAgendados = agendados.filter(a =>
        a.cadastro.pet.nomeAnimal.toLowerCase().includes(busca.toLowerCase()) ||
        a.codigoHash.includes(busca.toUpperCase())
    );

    if (loading) return (
        <div className="flex h-screen flex-col items-center justify-center bg-slate-950">
            <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
            <p className="text-slate-400 font-medium">Carregando cronograma de cirurgias...</p>
        </div>
    );

    return (
        <div className="p-6 bg-slate-950 min-h-screen space-y-8">
            {/* Cabeçalho */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Cronograma de <span className="text-emerald-500">Procedimentos</span></h1>
                    <p className="text-slate-400">Gerencie as castrações confirmadas e reagendamentos.</p>
                </div>
                <div className="relative group w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                    <input
                        type="text" placeholder="Buscar por Pet ou Código Hash..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-inner"
                        onChange={(e) => setBusca(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid de Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtrarAgendados.map((item) => (
                    <div key={item.id} className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-6 hover:border-emerald-500/30 transition-all group relative overflow-hidden backdrop-blur-sm">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-3xl rounded-full -mr-12 -mt-12"></div>
                        
                        <div className="flex justify-between items-start mb-6 relative">
                            <div className="flex items-center gap-3">
                                <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner border border-emerald-500/20">
                                    <PawPrint size={28} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-lg font-black tracking-widest border border-slate-700">#{item.codigoHash}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white leading-tight">{item.cadastro.pet.nomeAnimal}</h3>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button onClick={() => abrirReagendamento(item)} className="p-2.5 bg-slate-800 text-slate-400 rounded-xl hover:bg-amber-500/20 hover:text-amber-500 transition-all border border-slate-700" title="Reagendar">
                                    <RefreshCcw size={18} />
                                </button>
                                <button onClick={() => gerarGuiaCastracao(item)} className="p-2.5 bg-slate-800 text-slate-400 rounded-xl hover:bg-blue-500/20 hover:text-blue-500 transition-all border border-slate-700" title="Imprimir Guia">
                                    <FileText size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3 relative bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50">
                            <div className="flex items-center gap-3 text-slate-300">
                                <User size={16} className="text-emerald-500" />
                                <span className="text-sm font-medium">{item.cadastro.tutor.nome}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-300">
                                <Calendar size={16} className="text-emerald-500" />
                                <span className="text-sm font-medium">{new Date(item.dataHora).toLocaleDateString('pt-BR')} às {new Date(item.dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-300">
                                <MapPin size={16} className="text-emerald-500" />
                                <span className="text-sm font-medium truncate">{item.local || "Clínica Parceira"}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL DE REAGENDAMENTO PREMIUM */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in duration-200">
                    <div className="bg-slate-900 border border-slate-700 p-8 rounded-[3rem] w-full max-w-md shadow-2xl relative">
                        <button onClick={() => setShowModal(false)} className="absolute right-6 top-6 text-slate-500 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                        
                        <div className="text-center mb-8">
                            <div className="mx-auto w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 mb-4 border border-amber-500/20">
                                <RefreshCcw size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-white italic">Reagendamento</h2>
                            <p className="text-slate-400 text-sm mt-1">Alterando data para: <span className="text-white font-bold">{selectedAgendamento?.cadastro.pet.nomeAnimal}</span></p>
                        </div>

                        <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Nova Data</label>
                                    <input type="date" className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                                        onChange={(e) => setNovosDados({ ...novosDados, data: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Novo Horário</label>
                                    <input type="time" className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                                        onChange={(e) => setNovosDados({ ...novosDados, hora: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Clínica Executora</label>
                                <select 
                                    value={novosDados.clinicaId}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 text-white focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
                                    onChange={(e) => setNovosDados({ ...novosDados, clinicaId: e.target.value })}
                                >
                                    <option value="">Manter Clínica...</option>
                                    {clinicas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                                </select>
                            </div>

                            <button onClick={handleReagendar} className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black py-4 rounded-2xl mt-4 transition-all shadow-lg shadow-amber-900/20 flex items-center justify-center gap-3">
                                <CheckCircle size={20} />
                                ATUALIZAR E NOTIFICAR TUTOR
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Agendados;