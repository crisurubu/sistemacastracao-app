import React, { useState, useEffect, useRef } from 'react';
import { PawPrint, Users, BadgeDollarSign, Activity, Loader2, Award, Medal, TrendingUp, BarChart3, Power, Bell, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const DashboardHome = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [vagasAbertas, setVagasAbertas] = useState(false);
    const [toggleLoading, setToggleLoading] = useState(false);

    const storageUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isMounted = useRef(false);

    /**
     * VERIFICAÇÃO DE ALERTAS:
     * Ajustado para usar a data local do navegador (en-CA gera YYYY-MM-DD),
     * evitando que o fuso horário do servidor da nuvem (geralmente UTC) 
     * mostre alertas no dia errado.
     */
    const verificarAlertasVespera = async () => {
        try {
            const resAgendados = await api.get('/admin/agendamentos/pendentes');
            const lista = resAgendados.data;

            const amanha = new Date();
            amanha.setDate(amanha.getDate() + 1);
            const amanhaString = amanha.toLocaleDateString('en-CA');

            const pendentesDeAlerta = lista.filter(item => {
                const dataAgendamento = item.dataHora ? item.dataHora.split('T')[0] : "";
                return dataAgendamento === amanhaString && item.realizado === false;
            });

            if (pendentesDeAlerta.length > 0) {
                exibirToastAviso(pendentesDeAlerta.length);
            }
        } catch (err) {
            console.error("Erro ao verificar alertas:", err);
        }
    };

    const exibirToastAviso = (qtd) => {
        toast((t) => (
            <div className="flex items-center gap-4 text-left">
                <div className="bg-amber-500/20 p-2 rounded-full text-amber-500">
                    <Bell size={20} className="animate-bounce" />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-black text-amber-500 uppercase italic tracking-tighter">Atenção Equipe!</span>
                    <p className="text-xs text-slate-300">Há <b>{qtd}</b> {qtd === 1 ? 'pet' : 'pets'} para amanhã.<br />Envie o alerta de jejum!</p>
                    <button
                        onClick={() => { toast.dismiss(t.id); navigate('/admin/agendados'); }}
                        className="mt-3 flex items-center justify-center gap-2 text-[10px] font-bold bg-emerald-600 text-white py-2 px-3 rounded-lg hover:bg-emerald-500 transition-all uppercase"
                    >
                        Ver Agendamentos <ArrowRight size={12} />
                    </button>
                </div>
            </div>
        ), { id: 'alerta-jejum', duration: 10000 });
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (isMounted.current) return;
            isMounted.current = true;

            try {
                // api.get deve estar configurado no seu services/api com a URL da nuvem
                const [response, statusRes] = await Promise.all([
                    api.get('/admin/dashboard-summary'),
                    api.get('/sistema/status')
                ]);
                

                setData(response.data);
                setVagasAbertas(statusRes.data.cadastroAberto);
                verificarAlertasVespera();
            } catch (error) {
                console.error("Erro ao carregar dashboard:", error);
                toast.error("Erro na comunicação com o servidor.");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const handleToggleVagas = async () => {
        if (toggleLoading) return;
        setToggleLoading(true);
        try {
            const novoStatus = !vagasAbertas;
            await api.patch('/sistema/admin/toggle', { aberto: novoStatus });
            setVagasAbertas(novoStatus);
            toast.success(`Inscrições ${novoStatus ? 'Abertas' : 'Pausadas'}`, { id: 'toggle-toast' });
        } catch (err) {
            toast.error("Erro ao alterar status.");
        } finally {
            setToggleLoading(false);
        }
    };

    const getBadgeIcon = (index) => {
        if (index === 0) return <Medal className="text-yellow-400" size={24} />;
        if (index === 1) return <Medal className="text-slate-300" size={24} />;
        if (index === 2) return <Medal className="text-orange-400" size={24} />;
        return <Award className="text-slate-500" size={20} />;
    };

    if (loading) return (
        <div className="flex h-96 items-center justify-center text-emerald-500 font-bold italic">
            <Loader2 className="animate-spin mr-2" /> Sincronizando dados reais...
        </div>
    );

    const clinicasTratadas = data?.topClinicas?.map(c => ({
        ...c,
        nome: c.nome || "Clínica",
        totalCastracoes: Number(c.totalRealizados || 0),
        agendados: Number(c.totalAgendamentos || 0)
    })) || [];

    const fluxoTratado = data?.fluxoFinanceiro?.map(f => ({
        mes: f.mes,
        confirmados: Number(f.confirmados || 0),
        pendentes: Number(f.rejeitados || 0)
    })) || [];

    const stats = [
        { label: 'Total de Pets', value: data?.totalPets || 0, icon: <PawPrint />, color: 'text-blue-500' },
        { label: 'Tutores Ativos', value: data?.tutoresAtivos || 0, icon: <Users />, color: 'text-purple-500' },
        { label: 'Arrecadação', value: `R$ ${data?.arrecadacaoTotal || '0,00'}`, icon: <BadgeDollarSign />, color: 'text-emerald-500' },
        { label: 'Voluntários Ativos', value: data?.totalVoluntariosAtivos || 0, icon: <Users />, color: 'text-orange-500' },
    ];

    const darkTooltipStyle = { backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '10px', color: '#fff' };

    return (
        <div className="space-y-8 p-2">
            {/* CABEÇALHO */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="text-left">
                    <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Painel de Monitoramento</h1>
                    <p className="text-slate-400 text-sm font-medium">Gestão operacional - {storageUser.nome || 'Sistema Castração'}.</p>
                </div>

                <div className={`flex items-center gap-4 p-2 pr-6 rounded-[2.5rem] border transition-all duration-700 ${vagasAbertas ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-900 border-slate-800'}`}>
                    <button onClick={handleToggleVagas} disabled={toggleLoading} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-2xl ${vagasAbertas ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                        {toggleLoading ? <Loader2 className="animate-spin" /> : <Power size={24} />}
                    </button>
                    <div className="text-left">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-tight">Inscrições Públicas</p>
                        <p className={`text-sm font-black italic tracking-tighter ${vagasAbertas ? 'text-emerald-500' : 'text-slate-400'}`}>
                            {vagasAbertas ? 'PORTAS ABERTAS' : 'SISTEMA PAUSADO'}
                        </p>
                    </div>
                </div>
            </div>

            {/* CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((item, index) => (
                    <div key={index} className="bg-[#1e293b] border border-slate-800 p-6 rounded-[2rem] shadow-xl">
                        <div className="flex items-center justify-between text-left">
                            <div>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{item.label}</p>
                                <h3 className="text-3xl font-black text-white mt-1">{item.value}</h3>
                            </div>
                            <div className={`${item.color} bg-slate-950/50 p-4 rounded-2xl`}>{item.icon}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* GRÁFICOS DE BARRA */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Gráfico 1: Arrecadação (Mantido) */}
                <div className="bg-[#1e293b] border border-slate-800 p-8 rounded-[2.5rem]">
                    <h3 className="text-white font-black italic uppercase text-sm mb-6 flex items-center gap-2">
                        <BadgeDollarSign className="text-emerald-500" size={18} /> Fluxo de Arrecadação
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer>
                            <BarChart data={fluxoTratado}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="mes" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }} // Remove o fundo branco no hover
                                    contentStyle={darkTooltipStyle}
                                />
                                <Legend iconType="circle" verticalAlign="top" align="right" />
                                <Bar dataKey="confirmados" name="Confirmado (R$)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                                <Bar dataKey="pendentes" name="Aguardando (R$)" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Gráfico 2: Eficiência por Clínica (Ajustado com suas novas cores e correção de fundo) */}
                <div className="bg-[#1e293b] border border-slate-800 p-8 rounded-[2.5rem]">
                    <h3 className="text-white font-black italic uppercase text-sm mb-6 flex items-center gap-2">
                        <TrendingUp className="text-blue-500" size={18} /> Eficiência por Clínica
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer>
                            <BarChart layout="vertical" data={clinicasTratadas} margin={{ left: 40, right: 30 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="nome" type="category" tick={{ fill: '#fff', fontSize: 10, fontWeight: 'bold' }} width={140} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }} // Fundo de hover quase invisível
                                    contentStyle={darkTooltipStyle}
                                />
                                <Legend iconType="circle" verticalAlign="top" align="right" />
                                <Bar dataKey="agendados" name="Agendados" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={15} /> {/* AZUL */}
                                <Bar dataKey="totalCastracoes" name="Castrados" fill="#10b981" radius={[0, 4, 4, 0]} barSize={15} /> {/* VERDE */}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            {/* GRÁFICOS PIZZA */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-[#1e293b] border border-slate-800 p-8 rounded-[2.5rem]">
                    <h3 className="text-white font-black italic uppercase text-sm mb-6 flex items-center gap-2"><Activity className="text-orange-500" size={18} /> Ciclo de Vida do Pet</h3>
                    <div className="h-[220px]">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={[
                                    { name: 'Pgto Pendente', value: Number(data?.totalAguardandoPagamento || 0) },
                                    { name: 'Na Fila', value: Number(data?.totalNaFila || 0) },
                                    { name: 'Agendados', value: Number(data?.totalAgendados || 0) },
                                    { name: 'Concluídos', value: Number(data?.totalConcluidos || 0) }
                                ]} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    <Cell fill="#ef4444" /><Cell fill="#f59e0b" /><Cell fill="#3b82f6" /><Cell fill="#10b981" />
                                </Pie>
                                <Tooltip contentStyle={darkTooltipStyle} />
                                <Legend wrapperStyle={{ fontSize: '10px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-[#1e293b] border border-slate-800 p-8 rounded-[2.5rem]">
                    <h3 className="text-white font-black italic uppercase text-sm mb-6 flex items-center gap-2"><Users className="text-emerald-500" size={18} /> Equipe de Voluntários</h3>
                    <div className="h-[220px]">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={[
                                    { name: 'Ativos', value: Number(data?.totalVoluntariosAtivos || 0) },
                                    { name: 'Inativos', value: Number(data?.totalVoluntariosInativos || 0) }
                                ]} innerRadius={60} outerRadius={80} paddingAngle={10} dataKey="value">
                                    <Cell fill="#10b981" /><Cell fill="#ef4444" />
                                </Pie>
                                <Tooltip contentStyle={darkTooltipStyle} />
                                <Legend wrapperStyle={{ fontSize: '10px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-[#1e293b] border border-slate-800 p-8 rounded-[2.5rem]">
                    <h3 className="text-white font-black italic uppercase text-sm mb-6 flex items-center gap-2"><BarChart3 className="text-purple-500" size={18} /> Perfil dos Pacientes</h3>
                    <div className="h-[220px]">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={data?.distribuicaoEspecies || []} innerRadius={0} outerRadius={80} dataKey="value">
                                    {(data?.distribuicaoEspecies || []).map((_, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={darkTooltipStyle} />
                                <Legend wrapperStyle={{ fontSize: '10px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* RANKING DE IMPACTO */}
            <div className="bg-[#1e293b] border border-slate-800 p-8 rounded-[3rem]">
                <div className="flex items-center gap-3 mb-8">
                    <Award className="text-blue-500" size={24} />
                    <h3 className="text-white text-xl font-black italic uppercase text-left">Ranking de Impacto</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clinicasTratadas.map((clinica, index) => (
                        <div key={index} className="flex items-center p-5 bg-slate-950/40 border border-slate-800 rounded-[1.5rem]">
                            <div className="mr-4">{getBadgeIcon(index)}</div>
                            <div className="flex-1 min-w-0 text-left">
                                <p className="text-sm font-black text-white truncate italic uppercase tracking-tighter">{clinica.nome}</p>
                            </div>
                            <div className="text-right">
                                <span className="block text-2xl font-black text-blue-500">{clinica.totalCastracoes}</span>
                                <span className="block text-[8px] text-slate-500 font-black uppercase">Realizadas</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;

/**
 * RESUMO DO CÓDIGO:
 * - Correção de URL Base: O código agora depende inteiramente da instância centralizada do axios (`api`), que deve apontar para o domínio da nuvem via variável de ambiente.
 * - Blindagem de Datas: A comparação de "agendamentos de amanhã" agora usa a data local do dispositivo do voluntário, evitando que fusos horários de servidores (UTC) desativem o alerta de jejum prematuramente.
 * - Integridade Visual: Preservada toda a estrutura de gráficos do Recharts e estilização Tailwind, garantindo que o ranking e as métricas financeiras permaneçam legíveis e responsivas.
 * - Estabilidade no Ciclo de Vida: O useRef `isMounted` continua prevenindo chamadas duplas à API em ambientes de desenvolvimento e produção, economizando recursos de hospedagem gratuita.
 */