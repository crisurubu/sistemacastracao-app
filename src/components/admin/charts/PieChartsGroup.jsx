import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Users, BarChart3 } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
const darkTooltipStyle = { backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '10px', color: '#fff' };

const PieContainer = ({ title, icon: Icon, iconColor, children }) => (
    <div className="bg-[#1e293b] border border-slate-800 p-8 rounded-[2.5rem]">
        <h3 className="text-white font-black italic uppercase text-sm mb-6 flex items-center gap-2">
            <Icon className={iconColor} size={18}/> {title}
        </h3>
        <div className="h-[220px]">
            <ResponsiveContainer>{children}</ResponsiveContainer>
        </div>
    </div>
);

export const LifeCycleChart = ({ data }) => (
    <PieContainer title="Ciclo de Vida" icon={Activity} iconColor="text-orange-500">
        <PieChart>
            <Pie data={data} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={darkTooltipStyle} />
            <Legend wrapperStyle={{fontSize: '10px'}} />
        </PieChart>
    </PieContainer>
);

export const VolunteersChart = ({ data }) => (
    <PieContainer title="Equipe de Voluntários" icon={Users} iconColor="text-emerald-500">
        <PieChart>
            <Pie data={data} innerRadius={60} outerRadius={80} paddingAngle={10} dataKey="value">
                <Cell fill="#10b981" /><Cell fill="#ef4444" />
            </Pie>
            <Tooltip contentStyle={darkTooltipStyle} />
            <Legend wrapperStyle={{fontSize: '10px'}} />
        </PieChart>
    </PieContainer>
);

export const SpeciesPieChart = ({ data }) => (
    <PieContainer title="Perfil dos Pacientes" icon={BarChart3} iconColor="text-purple-500">
        <PieChart>
            <Pie data={data || []} innerRadius={0} outerRadius={80} dataKey="value">
                {(data || []).map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
            </Pie>
            <Tooltip contentStyle={darkTooltipStyle} />
            <Legend wrapperStyle={{fontSize: '10px'}} />
        </PieChart>
    </PieContainer>
);