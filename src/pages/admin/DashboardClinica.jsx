import React, { useState, useEffect } from 'react';
import { Search, PawPrint, CheckCircle, FileText, TrendingUp, Clock, Loader2, ListChecks, ShieldCheck, Hash, User, MessageCircle, Settings, Calendar } from 'lucide-react';
import api from '../../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { gerarGuiaCastracao } from '../../utils/GeradorPDF';
import ModalAlterarSenha from './ModalAlterarSenha';

const DashboardClinica = () => {
    const [agendamentosHoje, setAgendamentosHoje] = useState([]);
    const [stats, setStats] = useState({ 
        totalVidas: 0, 
        medalha: 'INICIANTE', 
        nomeClinica: 'Carregando...',
        dataCadastro: null // Novo campo para auditoria
    });
    const [buscaHash, setBuscaHash] = useState('');
    const [dadosHash, setDadosHash] = useState(null);
    const [loading, setLoading] = useState(true);
    const [erroHash, setErroHash] = useState(false);
    const [modalSenhaAberto, setModalSenhaAberto] = useState(false);

    const [dadosGraficoImpacto, setDadosGraficoImpacto] = useState([
        { name: 'Jan', qtd: 0 }, { name: 'Fev', qtd: 0 },
        { name: 'Mar', qtd: 0 }, { name: 'Abr', qtd: 0 },
    ]);

    const metaSuperior = stats.totalVidas < 10 ? 10 : stats.totalVidas + 5;

    useEffect(() => { fetchDadosCentral(); }, []);

    const fetchDadosCentral = async () => {
        try {
            const res = await api.get('/clinica/dashboard'); 
            setAgendamentosHoje(res.data.agendamentos || []);
            setStats({
                totalVidas: res.data.totalVidas || 0, 
                medalha: res.data.selo || 'INICIANTE',
                nomeClinica: res.data.nomeClinica || 'Clínica Parceira',
                dataCadastro: res.data.dataCadastro // Certifique-se que o backend envia este campo
            });

            if (res.data.pontosGrafico && res.data.pontosGrafico.length > 0) {
                setDadosGraficoImpacto(res.data.pontosGrafico);
            }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const formatarDataParceria = (dataISO) => {
        if (!dataISO) return "---";
        return new Date(dataISO).toLocaleDateString('pt-BR', {
            month: 'long',
            year: 'numeric'
        });
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

    const renderMedalhaBD = (seloBD) => {
        const selo = seloBD ? seloBD.toUpperCase() : 'INICIANTE';
        const configMedalhas = {
            'INICIANTE': { icone: '🌱', cor: 'from-slate-600 to-slate-800', texto: 'Iniciante', shadow: 'shadow-slate-900/40', sub: 'Rumo ao Bronze' },
            'BRONZE': { icone: '🥉', cor: 'from-orange-400 to-orange-600', texto: 'Bronze', shadow: 'shadow-orange-500/30', sub: 'Parceiro Ativo' },
            'PRATA': { icone: '🥈', cor: 'from-slate-300 to-slate-500', texto: 'Prata', shadow: 'shadow-slate-400/30', sub: 'Impacto Alto' },
            'OURO': { icone: '🥇', cor: 'from-yellow-400 to-yellow-600', texto: 'Ouro', shadow: 'shadow-yellow-500/30', sub: 'Elite da ONG' }
        };
        const config = configMedalhas[selo] || configMedalhas['INICIANTE'];
        return (
            <div className={`bg-gradient-to-br ${config.cor} p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] ${config.shadow} shadow-2xl flex flex-col items-center text-white border-4 border-white/20 transition-all hover:scale-105`}>
                <span className="text-4xl md:text-6xl mb-1 drop-shadow-lg">{config.icone}</span>
                <span className="font-black uppercase text-[8px] md:text-[10px] tracking-widest opacity-80 italic">{config.sub}</span>
                <span className="font-black uppercase text-lg md:text-xl italic tracking-tighter">{config.texto}</span>
            </div>
        );
    };

    if (loading) return <div className="flex h-screen items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-emerald-500" size={48} /></div>;

    return (
        <div className="p-3 md:p-6 bg-slate-950 min-h-screen space-y-4 md:space-y-8 font-sans text-slate-200">
            {/* HEADER - BOAS VINDAS E DATA DE CADASTRO */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-slate-900/40 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden relative">
                
                {/* Badge Flutuante de Data de Cadastro */}
                <div className="absolute top-0 right-0 bg-emerald-500/10 border-b border-l border-slate-800 px-6 py-2 rounded-bl-3xl hidden lg:flex items-center gap-2">
                    <Calendar size={12} className="text-emerald-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Ajudando desde <span className="text-emerald-500">{formatarDataParceria(stats.dataCadastro)}</span>
                    </span>
                </div>

                <div className="flex-1 w-full text-center lg:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-4 justify-center lg:justify-start">
                        <h1 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter">
                            Olá, <span className="text-emerald-500">{stats.nomeClinica}</span>
                        </h1>
                        <button onClick={() => setModalSenhaAberto(true)} className="bg-slate-950 p-2 rounded-full border border-slate-800 text-slate-500 hover:text-emerald-500 hover:border-emerald-500/30 transition-all group shadow-lg">
                            <Settings size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                        </button>
                    </div>
                    <p className="text-slate-400 mt-2 text-sm md:text-base">
                        Total de <span className="text-emerald-500 text-2xl md:text-3xl font-black px-1">{stats.totalVidas}</span> 
                        vidas salvas com a <span className="text-white font-bold italic underline decoration-emerald-500 uppercase">Sistema Castração ONG</span>.
                    </p>
                    
                    {/* Exibição Mobile da Data */}
                    <div className="lg:hidden mt-4 flex items-center gap-2 bg-slate-950/50 w-fit mx-auto lg:mx-0 px-4 py-1 rounded-full border border-slate-800">
                        <Calendar size={12} className="text-emerald-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase">Parceiro desde {formatarDataParceria(stats.dataCadastro)}</span>
                    </div>
                </div>
                <div className="shrink-0 z-10 w-full md:w-auto">
                    {renderMedalhaBD(stats.medalha)}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                {/* VALIDADOR DE HASH */}
                <div className={`bg-slate-900/60 border ${erroHash ? 'border-red-500' : 'border-slate-800'} p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-xl`}>
                    <h2 className="text-base md:text-lg font-black text-white mb-4 uppercase flex items-center gap-2"><ShieldCheck className="text-emerald-500"/> Validar Comprovante</h2>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input type="text" placeholder="Cole o Hash aqui..." value={buscaHash} className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm" onChange={(e) => setBuscaHash(e.target.value)} />
                        <button onClick={verificarHash} className="bg-emerald-600 hover:bg-emerald-500 p-4 rounded-2xl text-white transition-all flex justify-center"><Search size={24} /></button>
                    </div>
                    {erroHash && <p className="text-red-500 text-[10px] mt-2 font-bold italic uppercase ml-2">Hash não encontrado</p>}
                    {dadosHash && (
                        <div className="mt-4 p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl flex flex-col gap-3">
                            <h3 className="text-white font-black text-xl md:text-2xl uppercase italic text-center md:text-left">{dadosHash.cadastro?.pet?.nomeAnimal || dadosHash.animal}</h3>
                            <button onClick={() => gerarGuiaCastracao(dadosHash)} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl flex justify-center items-center gap-3 text-sm font-black transition-all shadow-xl"><FileText size={20} /> GERAR GUIA PDF</button>
                        </div>
                    )}
                </div>

                {/* GRÁFICO DE IMPACTO */}
                <div className="bg-slate-900/60 border border-slate-800 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-xl">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
                        <h2 className="text-base md:text-lg font-black text-white uppercase flex items-center gap-2">
                            <TrendingUp className="text-emerald-500" /> Ritmo de Castração
                        </h2>
                        <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-tighter">Meta: {metaSuperior} Vidas</span>
                    </div>
                    <div className="h-40 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dadosGraficoImpacto} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 'bold'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '15px', border: '1px solid #334155', color: '#fff' }} />
                                <Area type="stepAfter" dataKey="qtd" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorReal)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* FILA DE ATENDIMENTO DO DIA */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 shadow-2xl">
                <h2 className="text-xl md:text-2xl font-black text-white italic mb-8 flex items-center gap-3"><ListChecks className="text-emerald-500" /> Fila de Atendimento</h2>
                {agendamentosHoje.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {agendamentosHoje.map((item) => {
                            const whatsappTutor = item.historico?.[0]?.tutor?.whatsapp || item.historico?.[0]?.tutor?.telefone || "";
                            return (
                                <div key={item.id} className="group bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 transition-all p-5 rounded-[1.5rem] md:rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div className="flex items-center gap-4 md:gap-5 w-full md:w-auto">
                                        <div className="bg-emerald-500/20 p-3 md:p-4 rounded-xl md:rounded-2xl group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors shadow-inner shrink-0"><PawPrint size={24} className="md:w-7 md:h-7" /></div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-white font-black text-lg md:text-xl uppercase tracking-tight truncate">{item.animal}</h3>
                                                {item.historico?.length > 1 && <span className="bg-amber-500/20 text-amber-500 text-[7px] md:text-[8px] font-black px-2 py-0.5 rounded-full uppercase border border-amber-500/20 animate-pulse shrink-0">Retorno</span>}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1">
                                                <span className="flex items-center gap-1 text-[9px] md:text-[10px] font-bold text-slate-500 uppercase truncate max-w-[100px]"><User size={10}/> {item.tutor}</span>
                                                {whatsappTutor && (
                                                    <a href={`https://wa.me/55${whatsappTutor.toString().replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[9px] md:text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md hover:bg-emerald-400 hover:text-slate-950 transition-all shrink-0"><MessageCircle size={10} /> WHATSAPP</a>
                                                )}
                                                <span className="flex items-center gap-1 text-[9px] md:text-[10px] font-black text-emerald-400/60 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800 uppercase tracking-widest shrink-0"><Hash size={10}/> {item.hash}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto justify-between md:justify-end border-t border-slate-800 md:border-none pt-4 md:pt-0">
                                        <div className="text-left md:text-right">
                                            <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase italic">Horário</p>
                                            <p className="text-emerald-500 font-black text-base md:text-lg leading-none">{item.dataAgendamento ? new Date(item.dataAgendamento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</p>
                                        </div>
                                        <button onClick={() => concluirProcedimento(item.id)} className="bg-emerald-600 hover:bg-emerald-400 text-slate-950 font-black px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl text-[10px] md:text-xs uppercase flex items-center gap-2 transition-all shadow-lg hover:scale-105">Concluir <CheckCircle size={16} /></button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 md:py-20 text-slate-700 bg-slate-950/50 rounded-[2rem] md:rounded-[3rem] border-2 border-dashed border-slate-800">
                        <Clock size={48} className="md:w-[60px] md:h-[60px] mb-4 opacity-10" />
                        <p className="text-sm md:text-xl font-black italic uppercase tracking-[0.2em] md:tracking-[0.3em] opacity-20 text-center">Nenhum agendamento</p>
                    </div>
                )}
            </div>

            <ModalAlterarSenha isOpen={modalSenhaAberto} onClose={() => setModalSenhaAberto(false)} />
        </div>
    );
};

export default DashboardClinica;