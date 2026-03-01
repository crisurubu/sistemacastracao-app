import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

const darkTooltipStyle = { 
    backgroundColor: '#0f172a', 
    border: '1px solid #334155', 
    borderRadius: '12px', 
    padding: '10px', 
    color: '#fff' 
};

const ClinicsChart = ({ data }) => (
    <div className="bg-[#1e293b] border border-slate-800 p-8 rounded-[2.5rem]">
        <h3 className="text-white font-black italic uppercase text-sm mb-6 flex items-center gap-2">
            <TrendingUp className="text-blue-500" size={18}/> Eficiência por Clínica
        </h3>
        <div className="h-[300px] w-full"> 
            <ResponsiveContainer>
                <BarChart layout="vertical" data={data} margin={{ left: 40, right: 30 }}>
                    <XAxis type="number" hide />
                    <YAxis 
                        dataKey="nome" 
                        type="category" 
                        tick={{fill: '#fff', fontSize: 10, fontWeight: 'bold'}} 
                        width={140} 
                        axisLine={false} 
                    />
                    
                    {/* O SEGREDO ESTÁ AQUI: Cursor customizado para o tema Dark */}
                    <Tooltip 
                        contentStyle={darkTooltipStyle} 
                        cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} 
                    />
                    
                    <Bar dataKey="agendados" name="Agendados" fill="#334155" radius={[0, 4, 4, 0]} barSize={15} />
                    <Bar dataKey="totalCastracoes" name="Castrados" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={15} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
);

export default ClinicsChart;