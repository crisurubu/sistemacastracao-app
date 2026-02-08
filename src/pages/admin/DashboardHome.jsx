import React, { useState, useEffect } from 'react';
import { PawPrint, Users, BadgeDollarSign, Activity, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import api from '../../services/api';

const COLORS = ['#3b82f6', '#10b981'];

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

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center text-slate-500">
                <Loader2 className="animate-spin mr-2" /> Carregando indicadores reais...
            </div>
        );
    }

    // Mapeamento dos KPIs vindos do Java
    const stats = [
        { label: 'Total de Pets', value: data?.totalPets || 0, icon: <PawPrint />, color: 'text-blue-500' },
        { label: 'Tutores Ativos', value: data?.tutoresAtivos || 0, icon: <Users />, color: 'text-purple-500' },
        { label: 'Arrecadação', value: `R$ ${data?.arrecadacaoTotal || 0}`, icon: <BadgeDollarSign />, color: 'text-emerald-500' },
        { label: 'Fila de Espera', value: data?.filaEspera || 0, icon: <Activity />, color: 'text-orange-500' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white">Painel de Monitoramento</h1>
                <p className="text-slate-400 text-sm">Dados consolidados do banco de dados em tempo real.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((item, index) => (
                    <div key={index} className="bg-[#1e293b] border border-slate-800 p-6 rounded-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{item.label}</p>
                                <h3 className="text-3xl font-bold text-white mt-1">{item.value}</h3>
                            </div>
                            <div className={`${item.color} bg-slate-900/50 p-3 rounded-xl`}>
                                {item.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico de Espécies */}
                <div className="bg-[#1e293b] border border-slate-800 p-6 rounded-2xl h-[400px]">
                    <h3 className="text-white font-semibold mb-6">Distribuição por Espécie</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={data?.distribuicaoEspecies || []} innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value">
                                {(data?.distribuicaoEspecies || []).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Gráfico de Fluxo Financeiro */}
                <div className="bg-[#1e293b] border border-slate-800 p-6 rounded-2xl h-[400px]">
                    <h3 className="text-white font-semibold mb-6">Fluxo Financeiro vs. Castrações</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data?.fluxoMensal || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                            <Tooltip 
                                cursor={{fill: '#1e293b'}}
                                contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }} 
                            />
                            <Bar dataKey="arrecadado" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} name="R$ Arrecadado" />
                            <Bar dataKey="castrados" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} name="Pets Castrados" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;