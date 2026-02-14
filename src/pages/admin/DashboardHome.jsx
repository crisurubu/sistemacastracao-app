import React, { useState, useEffect } from 'react';
import { PawPrint, Users, BadgeDollarSign, Activity, Loader2, Award, Medal, TrendingUp, BarChart3, Power } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import api from '../../services/api';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const DashboardHome = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // --- NOVOS ESTADOS PARA O INTERRUPTOR ---
    const [vagasAbertas, setVagasAbertas] = useState(false);
    const [toggleLoading, setToggleLoading] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Busca os dados do resumo e o status do sistema ao mesmo tempo
                const [response, statusRes] = await Promise.all([
                    api.get('/admin/dashboard-summary'),
                    api.get('/sistema/status')
                ]);
                
                setData(response.data);
                setVagasAbertas(statusRes.data.cadastroAberto);
            } catch (error) {
                console.error("Erro ao carregar dashboard:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    // --- FUNÇÃO PARA VIRAR A CHAVE ---
    const handleToggleVagas = async () => {
        setToggleLoading(true);
        try {
            const novoStatus = !vagasAbertas;
            await api.patch('/sistema/admin/toggle', { aberto: novoStatus });
            setVagasAbertas(novoStatus);
        } catch (err) {
            alert("Erro ao alterar status das inscrições.");
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

    // TRATAMENTO DE DADOS CLÍNICAS
    const clinicasTratadas = data?.topClinicas?.map(c => ({
        ...c,
        nome: c.nome || "Clínica",
        totalCastracoes: Number(c.totalRealizados || 0), 
        agendados: Number(c.totalAgendados || 0)
    })) || [];

    // FLUXO FINANCEIRO
    const fluxoTratado = data?.fluxoFinanceiro?.map(f => ({
        mes: f.mes,
        confirmados: Number(f.confirmados || 0),
        pendentes: Number(f.rejeitados || 0) 
    })) || [];

    // DADOS OPERACIONAIS (PETS)
    const dadosOperacao = [
        { name: 'Pgto Pendente', value: Number(data?.totalAguardandoPagamento || 0) },
        { name: 'Na Fila', value: Number(data?.totalNaFila || 0) },
        { name: 'Agendados', value: Number(data?.totalAgendados || 0) },
        { name: 'Concluídos', value: Number(data?.totalConcluidos || 0) }
    ];

    // DADOS VOLUNTÁRIOS
    const dadosVoluntarios = [
        { name: 'Ativos', value: Number(data?.totalVoluntariosAtivos || 0) },
        { name: 'Inativos', value: Number(data?.totalVoluntariosInativos || 0) }
    ];

    const stats = [
        { label: 'Total de Pets', value: data?.totalPets || 0, icon: <PawPrint />, color: 'text-blue-500' },
        { label: 'Tutores Ativos', value: data?.tutoresAtivos || 0, icon: <Users />, color: 'text-purple-500' },
        { label: 'Arrecadação', value: `R$ ${data?.arrecadacaoTotal || 0}`, icon: <BadgeDollarSign />, color: 'text-emerald-500' },
        { label: 'Voluntários', value: data?.totalVoluntariosAtivos || 0, icon: <Users />, color: 'text-orange-500' },
    ];

    const darkTooltipStyle = {
        backgroundColor: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '12px',
        padding: '10px',
        color: '#fff'
    };

    return (
        <div className="space-y-8 p-2">
            {/* HEADER COM O NOVO INTERRUPTOR MASTER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Painel de Monitoramento</h1>
                    <p className="text-slate-400 text-sm font-medium">Gestão financeira e operacional - Sistema Castração ONG.</p>
                </div>

                {/* MÓDULO DE CONTROLE DE VAGAS */}
                <div className={`flex items-center gap-4 p-2 pr-6 rounded-[2.5rem] border transition-all duration-700 ${
                    vagasAbertas ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-900 border-slate-800'
                }`}>
                    <button 
                        onClick={handleToggleVagas}
                        disabled={toggleLoading}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-2xl ${
                            vagasAbertas 
                                ? 'bg-emerald-500 text-slate-950 scale-100' 
                                : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}
                    >
                        {toggleLoading ? <Loader2 className="animate-spin" /> : <Power size={24} />}
                    </button>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-tight">Inscrições Públicas</p>
                        <p className={`text-sm font-black italic tracking-tighter ${vagasAbertas ? 'text-emerald-500' : 'text-slate-400'}`}>
                            {vagasAbertas ? 'PORTAS ABERTAS' : 'SISTEMA PAUSADO'}
                        </p>
                    </div>
                </div>
            </div>

            {/* CARDS DE ESTATÍSTICAS RÁPIDAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((item, index) => (
                    <div key={index} className="bg-[#1e293b] border border-slate-800 p-6 rounded-[2rem] shadow-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{item.label}</p>
                                <h3 className="text-3xl font-black text-white mt-1">{item.value}</h3>
                            </div>
                            <div className={`${item.color} bg-slate-950/50 p-4 rounded-2xl`}>
                                {item.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* GRÁFICOS DE BARRAS (FINANCEIRO E CLÍNICAS) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#1e293b] border border-slate-800 p-8 rounded-[2.5rem]">
                    <h3 className="text-white font-black italic uppercase text-sm mb-6 flex items-center gap-2">
                        <BadgeDollarSign className="text-emerald-500" size={18}/> Fluxo de Arrecadação
                    </h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={fluxoTratado}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} contentStyle={darkTooltipStyle} />
                                <Legend iconType="circle" verticalAlign="top" align="right" />
                                <Bar dataKey="confirmados" name="Confirmado (R$)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                                <Bar dataKey="pendentes" name="Aguardando (R$)" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-[#1e293b] border border-slate-800 p-8 rounded-[2.5rem]">
                    <h3 className="text-white font-black italic uppercase text-sm mb-6 flex items-center gap-2">
                        <TrendingUp className="text-blue-500" size={18}/> Eficiência por Clínica
                    </h3>
                    <div className="h-[300px] w-full"> 
                        <ResponsiveContainer width="99%" height="100%">
                            <BarChart layout="vertical" data={clinicasTratadas} margin={{ left: 40, right: 30 }}>
                                <XAxis type="number" hide domain={[0, 'dataMax + 1']} />
                                <YAxis dataKey="nome" type="category" tick={{fill: '#fff', fontSize: 10, fontWeight: 'bold'}} width={140} axisLine={false} />
                                <Tooltip contentStyle={darkTooltipStyle} cursor={{fill: 'transparent'}} />
                                <Legend verticalAlign="top" align="right" />
                                <Bar dataKey="agendados" name="Agendados" fill="#334155" radius={[0, 4, 4, 0]} barSize={15} />
                                <Bar dataKey="totalCastracoes" name="Castrados" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={15} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* SEÇÃO DE GRÁFICOS DE ROSCA (DONUTS) - 3 COLUNAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                
                {/* CICLO DE VIDA DO PET */}
                <div className="bg-[#1e293b] border border-slate-800 p-8 rounded-[2.5rem]">
                    <h3 className="text-white font-black italic uppercase text-sm mb-6 flex items-center gap-2">
                        <Activity className="text-orange-500" size={18}/> Ciclo de Vida do Pet
                    </h3>
                    <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={dadosOperacao} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    <Cell fill="#ef4444" name="Pgto Pendente" />
                                    <Cell fill="#f59e0b" name="Na Fila" />
                                    <Cell fill="#3b82f6" name="Agendados" />
                                    <Cell fill="#10b981" name="Concluídos" />
                                </Pie>
                                <Tooltip contentStyle={darkTooltipStyle} />
                                <Legend wrapperStyle={{fontSize: '10px'}} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* STATUS DOS VOLUNTÁRIOS */}
                <div className="bg-[#1e293b] border border-slate-800 p-8 rounded-[2.5rem]">
                    <h3 className="text-white font-black italic uppercase text-sm mb-6 flex items-center gap-2">
                        <Users className="text-emerald-500" size={18}/> Equipe de Voluntários
                    </h3>
                    <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={dadosVoluntarios} innerRadius={60} outerRadius={80} paddingAngle={10} dataKey="value">
                                    <Cell fill="#10b981" name="Ativos" />
                                    <Cell fill="#ef4444" name="Inativos" />
                                </Pie>
                                <Tooltip contentStyle={darkTooltipStyle} />
                                <Legend wrapperStyle={{fontSize: '10px'}} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* PERFIL DOS PACIENTES (ESPÉCIES) */}
                <div className="bg-[#1e293b] border border-slate-800 p-8 rounded-[2.5rem]">
                    <h3 className="text-white font-black italic uppercase text-sm mb-6 flex items-center gap-2">
                        <BarChart3 className="text-purple-500" size={18}/> Perfil dos Pacientes
                    </h3>
                    <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={data?.distribuicaoEspecies || []} innerRadius={0} outerRadius={80} dataKey="value">
                                    {(data?.distribuicaoEspecies || []).map((_, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={darkTooltipStyle} />
                                <Legend wrapperStyle={{fontSize: '10px'}} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* RANKING DE CLÍNICAS */}
            <div className="bg-[#1e293b] border border-slate-800 p-8 rounded-[3rem]">
                <div className="flex items-center gap-3 mb-8">
                    <Award className="text-blue-500" size={24} />
                    <h3 className="text-white text-xl font-black italic uppercase">Ranking de Impacto</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clinicasTratadas.map((clinica, index) => (
                        <div key={index} className="flex items-center p-5 bg-slate-950/40 border border-slate-800 rounded-[1.5rem]">
                            <div className="mr-4">{getBadgeIcon(index)}</div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-white truncate italic uppercase tracking-tighter">{clinica.nome}</p>
                            </div>
                            <div className="text-right">
                                <span className="block text-2xl font-black text-blue-500 leading-none">{clinica.totalCastracoes}</span>
                                <span className="block text-[8px] text-slate-500 font-black uppercase mt-1">Realizadas</span>
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
 * - Controle Ativo: Adicionado o interruptor Master no topo do dashboard, permitindo ao administrador abrir ou pausar o formulário público instantaneamente.
 * - Sincronização Dupla: O useEffect agora carrega simultaneamente as métricas do dashboard e o status real do sistema.
 * - UI Preservada: Todos os gráficos de barras, roscas e o ranking de clínicas foram mantidos com o layout original intacto.
 */