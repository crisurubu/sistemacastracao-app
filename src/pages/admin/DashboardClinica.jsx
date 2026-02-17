import React, { useState, useEffect } from 'react';
import { Search, PawPrint, CheckCircle, FileText, TrendingUp, Clock, Loader2, ListChecks, ShieldCheck, Hash, User, MessageCircle, Settings, BarChart3 } from 'lucide-react';
import api from '../../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { gerarGuiaCastracao } from '../../utils/GeradorPDF';
import ModalAlterarSenha from './ModalAlterarSenha';

const DashboardClinica = () => {
    const [agendamentosHoje, setAgendamentosHoje] = useState([]);
    const [stats, setStats] = useState({ totalVidas: 0, medalha: 'INICIANTE', nomeClinica: 'Carregando...' });
    const [buscaHash, setBuscaHash] = useState('');
    const [dadosHash, setDadosHash] = useState(null);
    const [loading, setLoading] = useState(true);
    const [erroHash, setErroHash] = useState(false);
    const [modalSenhaAberto, setModalSenhaAberto] = useState(false);

    // ESTADO DO GRÁFICO REALISTA - COMEÇA NO CHÃO (ZERO)
    const [dadosGraficoImpacto, setDadosGraficoImpacto] = useState([
        { name: 'Jan', qtd: 0 },
        { name: 'Fev', qtd: 0 },
        { name: 'Mar', qtd: 0 },
        { name: 'Abr', qtd: 0 },
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
                nomeClinica: res.data.nomeClinica || 'Clínica Parceira'
            });

            // Lógica para preencher o gráfico com dados reais do banco
            if (res.data.pontosGrafico && res.data.pontosGrafico.length > 0) {
                setDadosGraficoImpacto(res.data.pontosGrafico);
            } else {
                // Se o banco não enviar o histórico, ele mapeia o totalVidas apenas para o mês atual
                const mesAtual = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date()).replace('.', '');
                setDadosGraficoImpacto(prev => prev.map(p => 
                    p.name.toLowerCase() === mesAtual.toLowerCase() 
                    ? { ...p, qtd: res.data.totalVidas || 0 } 
                    : p
                ));
            }
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
            <div className={`bg-gradient-to-br ${config.cor} p-6 rounded-[2.5rem] ${config.shadow} shadow-2xl flex flex-col items-center text-white border-4 border-white/20 transition-all hover:scale-105`}>
                <span className="text-6xl mb-1 drop-shadow-lg">{config.icone}</span>
                <span className="font-black uppercase text-[10px] tracking-widest opacity-80 italic">{config.sub}</span>
                <span className="font-black uppercase text-xl italic tracking-tighter">{config.texto}</span>
            </div>
        );
    };

    if (loading) return <div className="flex h-screen items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-emerald-500" size={48} /></div>;

    return (
        <div className="p-6 bg-slate-950 min-h-screen space-y-8 font-sans text-slate-200">
            {/* HEADER */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-slate-900/40 p-8 rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden">
                <div className="flex-1">
                    <div className="flex items-center gap-4">
                        <h1 className="text-4xl font-black text-white italic tracking-tighter">
                            Olá, <span className="text-emerald-500">{stats.nomeClinica}</span>
                        </h1>
                        <button onClick={() => setModalSenhaAberto(true)} className="bg-slate-950 p-2 rounded-full border border-slate-800 text-slate-500 hover:text-emerald-500 hover:border-emerald-500/30 transition-all group shadow-lg">
                            <Settings size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                        </button>
                    </div>
                    <p className="text-slate-400 mt-2">
                        Total de <span className="text-emerald-500 text-3xl font-black px-1">{stats.totalVidas}</span> 
                        vidas salvas com a <span className="text-white font-bold italic underline decoration-emerald-500">ONG Sistema Castração</span>.
                    </p>
                </div>
                <div className="shrink-0 z-10">
                    {renderMedalhaBD(stats.medalha)}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* BUSCA POR HASH */}
                <div className={`bg-slate-900/60 border ${erroHash ? 'border-red-500' : 'border-slate-800'} p-8 rounded-[3rem] shadow-xl`}>
                    <h2 className="text-lg font-black text-white mb-4 uppercase flex items-center gap-2"><ShieldCheck className="text-emerald-500"/> Validar Comprovante</h2>
                    <div className="flex gap-2">
                        <input type="text" placeholder="Cole o Hash aqui..." value={buscaHash} className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-emerald-500/50" onChange={(e) => setBuscaHash(e.target.value)} />
                        <button onClick={verificarHash} className="bg-emerald-600 hover:bg-emerald-500 p-4 rounded-2xl text-white transition-all"><Search size={24} /></button>
                    </div>
                    {erroHash && <p className="text-red-500 text-[10px] mt-2 font-bold italic uppercase ml-2">Hash não encontrado</p>}
                    {dadosHash && (
                        <div className="mt-4 p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl flex flex-col gap-3">
                            <h3 className="text-white font-black text-2xl uppercase italic">{dadosHash.cadastro?.pet?.nomeAnimal || dadosHash.animal}</h3>
                            <button onClick={() => gerarGuiaCastracao(dadosHash)} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl flex justify-center items-center gap-3 text-sm font-black transition-all shadow-xl"><FileText size={20} /> GERAR GUIA PDF</button>
                        </div>
                    )}
                </div>

                {/* GRÁFICO REALISTA - TIPO SETA/DEGRAU */}
                <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-[3rem] shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-black text-white uppercase flex items-center gap-2">
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
                                <Area 
                                    type="stepAfter" // Mostra a subida real como uma escada/seta
                                    dataKey="qtd" 
                                    stroke="#10b981" 
                                    strokeWidth={4} 
                                    fillOpacity={1} 
                                    fill="url(#colorReal)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* FILA DE ATENDIMENTO */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-8 shadow-2xl">
                <h2 className="text-2xl font-black text-white italic mb-8 flex items-center gap-3"><ListChecks className="text-emerald-500" /> Fila de Atendimento</h2>
                {agendamentosHoje.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {agendamentosHoje.map((item) => {
                            const whatsappTutor = item.historico?.[0]?.tutor?.whatsapp || item.historico?.[0]?.tutor?.telefone || "";
                            return (
                                <div key={item.id} className="group bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 transition-all p-5 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div className="flex items-center gap-5 w-full md:w-auto">
                                        <div className="bg-emerald-500/20 p-4 rounded-2xl group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors shadow-inner"><PawPrint size={28} /></div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-white font-black text-xl uppercase tracking-tight">{item.animal}</h3>
                                                {item.historico?.length > 1 && <span className="bg-amber-500/20 text-amber-500 text-[8px] font-black px-2 py-0.5 rounded-full uppercase border border-amber-500/20 animate-pulse">Retorno</span>}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3 mt-1">
                                                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase"><User size={12}/> {item.tutor}</span>
                                                {whatsappTutor && (
                                                    <a href={`https://wa.me/55${whatsappTutor.toString().replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md hover:bg-emerald-400 hover:text-slate-950 transition-all"><MessageCircle size={12} /> WHATSAPP</a>
                                                )}
                                                <span className="flex items-center gap-1 text-[10px] font-black text-emerald-400/60 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800 uppercase tracking-widest"><Hash size={12}/> {item.hash}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                        <div className="text-right min-w-[100px]">
                                            <p className="text-[9px] font-black text-slate-500 uppercase italic">Horário</p>
                                            <p className="text-emerald-500 font-black text-lg leading-none">{item.dataAgendamento ? new Date(item.dataAgendamento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</p>
                                        </div>
                                        <button onClick={() => concluirProcedimento(item.id)} className="bg-emerald-600 hover:bg-emerald-400 text-slate-950 font-black px-8 py-4 rounded-2xl text-xs uppercase flex items-center gap-2 transition-all shadow-lg hover:scale-105">Concluir <CheckCircle size={18} /></button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-700 bg-slate-950/50 rounded-[3rem] border-2 border-dashed border-slate-800">
                        <Clock size={60} className="mb-4 opacity-10" />
                        <p className="text-xl font-black italic uppercase tracking-[0.3em] opacity-20 text-center">Nenhum agendamento</p>
                    </div>
                )}
            </div>

            <ModalAlterarSenha isOpen={modalSenhaAberto} onClose={() => setModalSenhaAberto(false)} />
        </div>
    );
};

export default DashboardClinica;