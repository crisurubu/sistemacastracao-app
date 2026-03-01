import React from 'react';
import { Award, Medal } from 'lucide-react';

const ImpactRanking = ({ data }) => {
    const getBadgeIcon = (index) => {
        if (index === 0) return <Medal className="text-yellow-400" size={24} />;
        if (index === 1) return <Medal className="text-slate-300" size={24} />;
        if (index === 2) return <Medal className="text-orange-400" size={24} />;
        return <Award className="text-slate-500" size={20} />;
    };

    return (
        <div className="bg-[#1e293b] border border-slate-800 p-8 rounded-[3rem]">
            <div className="flex items-center gap-3 mb-8">
                <Award className="text-blue-500" size={24} />
                <h3 className="text-white text-xl font-black italic uppercase">Ranking de Impacto</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.map((clinica, index) => (
                    <div key={index} className="flex items-center p-5 bg-slate-950/40 border border-slate-800 rounded-[1.5rem] hover:border-blue-500/50 transition-all">
                        <div className="mr-4">{getBadgeIcon(index)}</div>
                        <div className="flex-1 min-w-0">
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
    );
};

export default ImpactRanking;