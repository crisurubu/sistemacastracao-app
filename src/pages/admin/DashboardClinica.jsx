import React, { useState, useEffect } from 'react';
import { Search, PawPrint, CheckCircle, FileText, TrendingUp, Clock, Loader2, ListChecks, ShieldCheck, Hash, User, MessageCircle } from 'lucide-react';
import api from '../../services/api';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { gerarGuiaCastracao } from '../../utils/GeradorPDF';

const DashboardClinica = () => {
    const [agendamentosHoje, setAgendamentosHoje] = useState([]);
    const [stats, setStats] = useState({ totalVidas: 0, medalha: 'BRONZE', nomeClinica: 'Carregando...' });
    const [buscaHash, setBuscaHash] = useState('');
    const [dadosHash, setDadosHash] = useState(null);
    const [loading, setLoading] = useState(true);
    const [erroHash, setErroHash] = useState(false);

    const dadosGraficoImpacto = [
        { name: 'Início', qtd: 0 },
        { name: 'Meta 1', qtd: Math.floor(stats.totalVidas * 0.4) },
        { name: 'Meta 2', qtd: Math.floor(stats.totalVidas * 0.7) },
        { name: 'Hoje', qtd: stats.totalVidas },
    ];

    useEffect(() => { fetchDadosCentral(); }, []);

    const fetchDadosCentral = async () => {
        try {
            const res = await api.get('/clinica/dashboard'); 
            setAgendamentosHoje(res.data.agendamentos || []);
            setStats({
                totalVidas: res.data.totalVidas || 0, 
                medalha: res.data.selo || 'BRONZE',
                nomeClinica: res.data.nomeClinica || 'Clínica Parceira'
            });
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const verificarHash = async () => {
        if (!buscaHash) return;
        try {
            const res = await api.get(`/publico/verificar/${buscaHash}`);
            setDadosHash(res.data);
            setErroHash(false);
        } catch (e) { setDadosHash(null); setErroHash(true); }
    };

    const concluirProcedimento = async (id) => {
        if(!window.confirm("Confirmar a realização desta castração?")) return;
        try {
            await api.patch(`/clinica/agendamentos/${id}/concluir`);
            setAgendamentosHoje(prev => prev.filter(item => item.id !== id));
            setTimeout(() => fetchDadosCentral(), 500);
            alert("Sucesso! Procedimento registrado.");
        } catch (e) { alert("Erro ao concluir."); }
    };

    const getMedalhaDinamica = (selo) => {
        const estilos = {
            'OURO': { icone: '🥇', cor: 'from-yellow-400 to-yellow-600', texto: 'Ouro' },
            'PRATA': { icone: '🥈', cor: 'from-slate-300 to-slate-500', texto: 'Prata' },
            'BRONZE': { icone: '🥉', cor: 'from-orange-400 to-orange-600', texto: 'Bronze' }
        };
        const config = estilos[selo] || estilos['BRONZE'];
        return (
            <div className={`bg-gradient-to-br ${config.cor} p-6 rounded-[2.5rem] shadow-xl flex flex-col items-center text-white border-4 border-white/20`}>
                <span className="text-6xl mb-1">{config.icone}</span>
                <span className="font-black uppercase text-sm italic">{config.texto}</span>
            </div>
        );
    };

    if (loading) return <div className="flex h-screen items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-emerald-500" size={48} /></div>;

    return (
        <div className="p-6 bg-slate-950 min-h-screen space-y-8 font-sans text-slate-200">
            {/* HEADER */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-slate-900/40 p-8 rounded-[3rem] border border-slate-800">
                <div>
                    <h1 className="text-4xl font-black text-white italic tracking-tighter">Olá, <span className="text-emerald-500">{stats.nomeClinica}</span></h1>
                    <p className="text-slate-400">Total de <span className="text-emerald-500 text-2xl font-black">{stats.totalVidas}</span> vidas salvas com a ONG.</p>
                </div>
                {getMedalhaDinamica(stats.medalha)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* BUSCA POR HASH */}
                <div className={`bg-slate-900/60 border ${erroHash ? 'border-red-500' : 'border-slate-800'} p-8 rounded-[3rem]`}>
                    <h2 className="text-lg font-black text-white mb-4 uppercase flex items-center gap-2"><ShieldCheck className="text-emerald-500"/> Validar Comprovante</h2>
                    <div className="flex gap-2">
                        <input type="text" placeholder="Cole o Hash aqui..." value={buscaHash} className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-emerald-500/50" onChange={(e) => setBuscaHash(e.target.value)} />
                        <button onClick={verificarHash} className="bg-emerald-600 hover:bg-emerald-500 p-4 rounded-2xl text-white transition-all"><Search size={24} /></button>
                    </div>
                    {erroHash && <p className="text-red-500 text-xs mt-2 font-bold italic uppercase">Hash não encontrado</p>}
                    {dadosHash && (
                        <div className="mt-4 p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex flex-col gap-3">
                            <h3 className="text-white font-black text-xl uppercase italic">{dadosHash.cadastro?.pet?.nomeAnimal || dadosHash.animal}</h3>
                            <button onClick={() => gerarGuiaCastracao(dadosHash)} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl flex justify-center items-center gap-2 text-sm font-black transition-all shadow-lg"><FileText size={18} /> GERAR GUIA PDF</button>
                        </div>
                    )}
                </div>

                {/* IMPACTO */}
                <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-[3rem]">
                    <h2 className="text-lg font-black text-white mb-4 uppercase flex items-center gap-2"><TrendingUp className="text-emerald-500" /> Evolução do Impacto</h2>
                    <div className="h-28 w-full">
                        <ResponsiveContainer>
                            <AreaChart data={dadosGraficoImpacto}>
                                <Area type="monotone" dataKey="qtd" stroke="#10b981" fill="#10b98133" strokeWidth={4} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* LISTA/FILA DE ATENDIMENTO */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-8">
                <h2 className="text-2xl font-black text-white italic mb-8 flex items-center gap-3"><ListChecks className="text-emerald-500" /> Fila de Atendimento</h2>

                {agendamentosHoje.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {agendamentosHoje.map((item) => {
                            // EXTRAÇÃO DO WHATSAPP DO HISTÓRICO (Conforme seu log de objetos)
                            const whatsappTutor = item.historico?.[0]?.tutor?.whatsapp || item.historico?.[0]?.tutor?.telefone || "";

                            return (
                                <div key={item.id} className="group bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 transition-all p-5 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div className="flex items-center gap-5 w-full md:w-auto">
                                        <div className="bg-emerald-500/20 p-4 rounded-2xl group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                                            <PawPrint size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-black text-lg uppercase tracking-tight leading-tight">{item.animal}</h3>
                                            <div className="flex flex-wrap items-center gap-3 mt-1">
                                                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase">
                                                    <User size={12}/> {item.tutor}
                                                </span>
                                                
                                                {/* BOTÃO WHATSAPP - BUSCANDO A CHAVE 'whatsapp' NO HISTÓRICO */}
                                                {whatsappTutor && (
                                                    <a 
                                                        href={`https://wa.me/55${whatsappTutor.toString().replace(/\D/g, '')}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md hover:bg-emerald-400 hover:text-slate-950 transition-all"
                                                    >
                                                        <MessageCircle size={12} /> {whatsappTutor}
                                                    </a>
                                                )}

                                                <span className="text-slate-700">|</span>
                                                <span className="flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-lg border border-emerald-400/20 uppercase tracking-widest">
                                                    <Hash size={12}/> {item.hash}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                        <div className="text-right min-w-[100px]">
                                            <p className="text-[9px] font-black text-slate-500 uppercase italic">Agendado</p>
                                            <p className="text-white font-bold text-xs uppercase">
                                                {item.dataAgendamento ? new Date(item.dataAgendamento).toLocaleDateString('pt-BR') : '---'}
                                            </p>
                                            <p className="text-emerald-500 font-black text-sm">
                                                {item.dataAgendamento ? new Date(item.dataAgendamento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '---'}
                                            </p>
                                        </div>

                                        <button 
                                            onClick={() => concluirProcedimento(item.id)} 
                                            className="bg-emerald-600 hover:bg-emerald-400 text-slate-950 font-black px-6 py-3 rounded-2xl text-xs uppercase flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/20 hover:scale-105"
                                        >
                                            Concluir <CheckCircle size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-600 bg-slate-950/50 rounded-[2rem] border-2 border-dashed border-slate-800">
                        <Clock size={48} className="mb-4 opacity-20" />
                        <p className="text-xl font-black italic uppercase tracking-widest opacity-30">Nada pendente hoje</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardClinica;

// RESUMO DO CÓDIGO:
// 1. WhatsApp do Histórico: Agora o código mergulha em 'item.historico[0].tutor.whatsapp' para exibir o contato e o botão funcional.
// 2. Fallback de Contato: Caso a chave no seu banco seja 'telefone' em vez de 'whatsapp', o código tenta os dois.
// 3. UI Dinâmica: O link wa.me limpa automaticamente parênteses e traços para não falhar no envio.
// 4. Mapeamento CamelCase: Mantido 'dataAgendamento' e 'animal' conforme o retorno real do seu console.