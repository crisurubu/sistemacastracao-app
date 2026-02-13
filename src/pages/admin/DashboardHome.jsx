import React, { useState, useEffect } from 'react';
import { PawPrint, Users, BadgeDollarSign, Activity, Loader2, Award, Medal, TrendingUp, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import api from '../../services/api';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const DashboardHome = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get('/admin/dashboard-summary');
                setData(response.data);
            } catch (error) {
                console.error("Erro ao carregar dashboard:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

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

    // DADOS OPERACIONAIS DA TABELA CADASTROS
    const dadosOperacao = [
        { name: 'Pgto Pendente', value: Number(data?.totalAguardandoPagamento || 0) },
        { name: 'Na Fila', value: Number(data?.totalNaFila || 0) },
        { name: 'Agendados', value: Number(data?.totalAgendados || 0) },
        { name: 'Concluídos', value: Number(data?.totalConcluidos || 0) }
    ];

    const stats = [
        { label: 'Total de Pets', value: data?.totalPets || 0, icon: <PawPrint />, color: 'text-blue-500' },
        { label: 'Tutores Ativos', value: data?.tutoresAtivos || 0, icon: <Users />, color: 'text-purple-500' },
        { label: 'Arrecadação', value: `R$ ${data?.arrecadacaoTotal || 0}`, icon: <BadgeDollarSign />, color: 'text-emerald-500' },
        { label: 'Fila de Espera', value: data?.totalNaFila || 0, icon: <Activity />, color: 'text-orange-500' },
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
            <div>
                <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Painel de Monitoramento</h1>
                <p className="text-slate-400 text-sm font-medium">Gestão financeira e operacional - Sistema Castração ONG.</p>
            </div>

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

                {/* STATUS DA OPERAÇÃO COM VERMELHO NO PENDENTE */}
                <div className="bg-[#1e293b] border border-slate-800 p-8 rounded-[2.5rem]">
                    <h3 className="text-white font-black italic uppercase text-sm mb-6 flex items-center gap-2">
                        <Activity className="text-orange-500" size={18}/> Ciclo de Vida do Pet (Tabela Cadastros)
                    </h3>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={dadosOperacao} 
                                    innerRadius={70} 
                                    outerRadius={90} 
                                    paddingAngle={8} 
                                    dataKey="value"
                                >
                                    <Cell fill="#ef4444" name="Pgto Pendente" />
                                    <Cell fill="#f59e0b" name="Na Fila" />
                                    <Cell fill="#3b82f6" name="Agendados" />
                                    <Cell fill="#10b981" name="Concluídos" />
                                </Pie>
                                <Tooltip contentStyle={darkTooltipStyle} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-[#1e293b] border border-slate-800 p-8 rounded-[2.5rem]">
                    <h3 className="text-white font-black italic uppercase text-sm mb-6 flex items-center gap-2">
                        <BarChart3 className="text-purple-500" size={18}/> Perfil dos Pacientes
                    </h3>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={data?.distribuicaoEspecies || []} innerRadius={0} outerRadius={80} dataKey="value" label>
                                    {(data?.distribuicaoEspecies || []).map((_, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={darkTooltipStyle} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

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
 * - Ajuste Cromático: O status 'Pgto Pendente' agora usa Vermelho (#ef4444) para alerta visual imediato.
 * - Ciclo de Vida: Mantém os 4 estados da tabela Cadastros mapeados corretamente.
 * - Layout Preservado: Ranking e Eficiência das clínicas continuam ativos e funcionais.
 */