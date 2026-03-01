import React, { useEffect, useState } from 'react';
import api from "../../services/api"; 
import { CheckCircle, Clock, User, PawPrint, MessageCircle } from 'lucide-react';

const AgendaClinica = () => {
    const [agendamentos, setAgendamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [clinicaInfo, setClinicaInfo] = useState(null);

    const carregarAgenda = async () => {
        try {
            // A instância 'api' já injeta o Token e a URL base automaticamente
            const response = await api.get('/clinica/meus-agendamentos');
            
            setAgendamentos(response.data.agendamentos);
            setClinicaInfo(response.data.clinica);
        } catch (error) {
            console.error("Erro ao carregar agenda", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarAgenda();
    }, []);

    const finalizarProcedimento = async (id) => {
        if (!window.confirm("Confirmar a realização deste procedimento?")) return;

        try {
            // Chamada PATCH para atualizar o status do agendamento
            await api.patch(`/clinica/concluir-procedimento/${id}`, {});
            
            alert("Procedimento registrado com sucesso!");
            carregarAgenda(); // Recarrega para atualizar o contador de mérito e a lista
        } catch (error) {
            alert("Erro ao registrar conclusão.");
        }
    };

    if (loading) return <div className="p-10 text-center text-white italic">Carregando agenda da clínica...</div>;

    return (
        <div className="p-6 space-y-6">
            {/* CABEÇALHO COM MÉRITO (Selo de Parceiro) */}
            <div className="bg-[#1e293b] border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Olá, {clinicaInfo?.nome}!</h1>
                    <p className="text-slate-400">Gerencie as castrações agendadas para sua unidade.</p>
                </div>
                <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                    <div className="text-right">
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-tighter">Selo de Parceiro</p>
                        <p className="text-blue-400 font-bold">
                            {clinicaInfo?.totalCastracoes >= 100 ? 'OURO' : clinicaInfo?.totalCastracoes >= 50 ? 'PRATA' : 'BRONZE'}
                        </p>
                    </div>
                    <div className="text-3xl">
                        {clinicaInfo?.totalCastracoes >= 100 ? '🥇' : clinicaInfo?.totalCastracoes >= 50 ? '🥈' : '🥉'}
                    </div>
                    <div className="border-l border-slate-700 pl-4 text-center">
                        <p className="text-2xl font-black text-white">{clinicaInfo?.totalCastracoes || 0}</p>
                        <p className="text-[10px] text-slate-500 uppercase">Realizadas</p>
                    </div>
                </div>
            </div>

            {/* LISTA DE AGENDAMENTOS EM GRID */}
            <div className="grid grid-cols-1 gap-4">
                {agendamentos.length > 0 ? (
                    agendamentos.map((ag) => (
                        <div key={ag.id} className="bg-[#1e293b] border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center hover:border-blue-500/50 transition-all group">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="bg-blue-500/10 p-3 rounded-full text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                    <PawPrint size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white uppercase">{ag.nomePet}</h3>
                                    <div className="flex flex-wrap gap-3 mt-1">
                                        <span className="flex items-center gap-1 text-sm text-slate-400"><User size={14}/> {ag.nomeTutor}</span>
                                        <span className="flex items-center gap-1 text-sm text-slate-400"><MessageCircle size={14} className="text-emerald-500"/> {ag.whatsappTutor}</span>
                                        <span className="flex items-center gap-1 text-sm text-orange-400 font-medium"><Clock size={14}/> {ag.horario}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 md:mt-0 w-full md:w-auto">
                                <button 
                                    onClick={() => finalizarProcedimento(ag.id)}
                                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg hover:scale-105 active:scale-95"
                                >
                                    <CheckCircle size={18} /> Confirmar Realização
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-[#1e293b] border border-slate-800 p-12 rounded-2xl text-center">
                        <p className="text-slate-500 italic">Nenhum pet pendente de castração em sua lista.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgendaClinica;