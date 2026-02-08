import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Search, RefreshCcw, FileText, Loader2, X } from 'lucide-react';
import api from '../../services/api';
import { gerarGuiaCastracao } from '../../utils/GeradorPDF'; // Aquela função que criamos

const Agendados = () => {
    const [agendados, setAgendados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busca, setBusca] = useState('');

    // Estados para Reagendamento
    const [showModal, setShowModal] = useState(false);
    const [selectedAgendamento, setSelectedAgendamento] = useState(null);
    const [novosDados, setNovosDados] = useState({ data: '', hora: '', local: '' });

    useEffect(() => {
        const fetchAgendados = async () => {
            try {
                const response = await api.get('/admin/agendamentos/pendentes');
                setAgendados(response.data);
            } catch (error) {
                console.error("Erro ao carregar agendados:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAgendados();
    }, []);

    const handleReagendar = async () => {
        try {
            const payload = {
                agendamentoId: selectedAgendamento.id,
                dataHora: `${novosDados.data}T${novosDados.hora}`,
                local: novosDados.local
            };

            const response = await api.put(`/admin/agendamentos/reagendar`, payload);

            // Atualiza a lista localmente
            setAgendados(agendados.map(a => a.id === selectedAgendamento.id ? response.data : a));
            setShowModal(false);
            alert("Reagendamento concluído! Novo e-mail enviado ao tutor.");
        } catch (error) {
            alert("Erro ao reagendar.");
        }
    };

    const filtrarAgendados = agendados.filter(a =>
        a.cadastro.pet.nomeAnimal.toLowerCase().includes(busca.toLowerCase()) ||
        a.codigoHash.includes(busca.toUpperCase())
    );

    if (loading) return <div className="p-10 text-center text-slate-500"><Loader2 className="animate-spin mx-auto" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Procedimentos Agendados</h1>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
                    <input
                        type="text" placeholder="Buscar Pet ou Hash..."
                        className="w-full bg-slate-800 border-slate-700 rounded-lg p-2 pl-10 text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                        onChange={(e) => setBusca(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtrarAgendados.map((item) => (
                    <div key={item.id} className="bg-[#1e293b] border border-slate-800 p-5 rounded-2xl hover:border-emerald-500/50 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                                    Hash: {item.codigoHash}
                                </span>
                                <h3 className="text-lg font-bold text-white mt-1">{item.cadastro.pet.nomeAnimal}</h3>
                                <p className="text-slate-400 text-xs">{item.cadastro.tutor.nome}</p>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setSelectedAgendamento(item); setShowModal(true); }} className="p-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-amber-600 hover:text-white" title="Reagendar">
                                    <RefreshCcw size={16} />
                                </button>
                                <button onClick={() => gerarGuiaCastracao(item)} className="p-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-blue-600 hover:text-white" title="Imprimir PDF">
                                    <FileText size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2 border-t border-slate-800 pt-4 mt-4 text-sm text-slate-300">
                            {/* Data Formatada */}
                            <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-emerald-500" />
                                <span>{new Date(item.dataHora).toLocaleDateString('pt-BR')}</span>
                            </div>

                            {/* Hora Formatada (Correção do 2-digit) */}
                            <div className="flex items-center gap-2">
                                <Clock size={14} className="text-emerald-500" />
                                <span>
                                    {new Date(item.dataHora).toLocaleTimeString('pt-BR', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>

                            {/* Local do Procedimento */}
                            <div className="flex items-center gap-2">
                                <MapPin size={14} className="text-emerald-500" />
                                <span className="truncate" title={item.local}>{item.local}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL DE REAGENDAMENTO */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-sm">
                        <div className="flex justify-between mb-4">
                            <h2 className="text-lg font-bold text-white">Reagendar: {selectedAgendamento?.cadastro.pet.nomeAnimal}</h2>
                            <button onClick={() => setShowModal(false)}><X className="text-slate-500 hover:text-white" /></button>
                        </div>
                        <div className="space-y-4">
                            <input type="date" className="w-full bg-slate-800 border-slate-700 p-2 rounded text-white" onChange={(e) => setNovosDados({ ...novosDados, data: e.target.value })} />
                            <input type="time" className="w-full bg-slate-800 border-slate-700 p-2 rounded text-white" onChange={(e) => setNovosDados({ ...novosDados, hora: e.target.value })} />
                            <input type="text" placeholder="Novo Local" className="w-full bg-slate-800 border-slate-700 p-2 rounded text-white" onChange={(e) => setNovosDados({ ...novosDados, local: e.target.value })} />
                            <button onClick={handleReagendar} className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl mt-4">
                                ATUALIZAR AGENDAMENTO
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Agendados;