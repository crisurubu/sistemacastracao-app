import React, { useState, useEffect } from 'react';
import { CheckCircle2, Phone, Calendar, Loader2, X, MapPin } from 'lucide-react';
import api from '../../services/api';

const FilaCastracao = () => {
    const [fila, setFila] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- NOVOS ESTADOS PARA O AGENDAMENTO ---
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [dadosAgendamento, setDadosAgendamento] = useState({ data: '', hora: '', local: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchFila = async () => {
            try {
                const response = await api.get('/admin/fila-espera');
                console.log("DADOS RECEBIDOS NA FILA:", response.data);
                setFila(response.data);
            } catch (error) {
                console.error("Erro ao buscar fila de castração:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFila();
    }, []);

    // --- FUNÇÃO PARA ABRIR O MODAL ---
    const handleAbrirAgendamento = (item) => {
        setSelectedItem(item);
        setShowModal(true);
    };

    // --- FUNÇÃO PARA SALVAR NA NOVA TABELA ---
    const confirmarAgendamento = async () => {
        if (!dadosAgendamento.data || !dadosAgendamento.hora || !dadosAgendamento.local) {
            alert("Por favor, preencha todos os campos do agendamento.");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                cadastroId: selectedItem.id,
                dataHora: `${dadosAgendamento.data}T${dadosAgendamento.hora}`,
                local: dadosAgendamento.local
            };

            // Envia para o novo endpoint que criaremos no Java
            await api.post('/admin/agendamentos', payload);
            
            // Remove da fila visualmente após sucesso
            setFila(fila.filter(f => f.id !== selectedItem.id));
            setShowModal(false);
            alert("Agendamento realizado com sucesso! O pet saiu da fila.");
        } catch (error) {
            console.error("Erro ao agendar:", error);
            alert("Erro ao salvar agendamento no servidor.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-96 flex-col items-center justify-center text-slate-500">
                <Loader2 className="animate-spin mb-4" size={40} />
                <p>Acessando fila de espera real...</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-white">Fila de Castração</h1>
                    <p className="text-slate-400 text-sm">Pets com pagamento confirmado prontos para agendamento.</p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 size={16} /> {fila.length} PETS PRONTOS
                </div>
            </div>

            <div className="bg-[#1e293b] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                {fila.length === 0 ? (
                    <div className="p-20 text-center text-slate-500 italic">
                        Nenhum animal com status 'NA_FILA' encontrado.
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/50 border-b border-slate-800">
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Pet / Espécie</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Tutor</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Data Cadastro</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {fila.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="text-white font-bold">{item.pet?.nomeAnimal || 'Sem Nome'}</span>
                                            <span className="text-slate-500 text-xs">{item.pet?.especie || '---'}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-300 text-sm">
                                        <div className="flex flex-col">
                                            <span className="font-medium">{item.tutor?.nome || 'Não vinculado'}</span>
                                            <span className="text-slate-500 text-[10px]">{item.tutor?.whatsapp || 'Sem contato'}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-400 text-sm">
                                        {item.dataSolicitacao ? new Date(item.dataSolicitacao).toLocaleDateString('pt-BR') : 'Recente'}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2 justify-center">
                                            {item.tutor?.whatsapp && (
                                                <a
                                                    href={`https://wa.me/55${item.tutor.whatsapp.replace(/\D/g, '')}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="p-2 bg-blue-600/10 text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                                                    title="Chamar no WhatsApp"
                                                >
                                                    <Phone size={16} />
                                                </a>
                                            )}
                                            {/* BOTÃO QUE ABRE O MODAL */}
                                            <button
                                                onClick={() => handleAbrirAgendamento(item)}
                                                className="p-2 bg-emerald-600/10 text-emerald-400 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"
                                                title="Marcar Agendamento"
                                            >
                                                <Calendar size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* MODAL DE AGENDAMENTO (SOBREPOSTO) */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-white">Agendar Castração</h2>
                                <p className="text-slate-400 text-xs italic">Pet: {selectedItem?.pet?.nomeAnimal}</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block">Data do Procedimento</label>
                                <input type="date" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                    onChange={(e) => setDadosAgendamento({...dadosAgendamento, data: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block">Horário</label>
                                <input type="time" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                    onChange={(e) => setDadosAgendamento({...dadosAgendamento, hora: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block">Local / Clínica</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 text-slate-500" size={16} />
                                    <input type="text" placeholder="Ex: Clínica Amigo Pet" 
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 pl-10 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                        onChange={(e) => setDadosAgendamento({...dadosAgendamento, local: e.target.value})} />
                                </div>
                            </div>
                        </div>

                        <button 
                            disabled={submitting}
                            onClick={confirmarAgendamento}
                            className="w-full mt-8 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {submitting ? <Loader2 className="animate-spin" size={20} /> : "FINALIZAR AGENDAMENTO"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilaCastracao;