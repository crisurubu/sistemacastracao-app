import React, { useState, useEffect } from 'react';
import { AlertTriangle, ArrowRight, Loader2, DollarSign, Info, CheckCircle2, PawPrint, LayoutList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const CentralAlarmes = () => {
    const navigate = useNavigate();
    const [alertas, setAlertas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAlarmes = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/alarmes');
            setAlertas(response.data);
            setError(null);
        } catch (err) {
            console.error("Erro ao buscar alarmes:", err);
            setError("Não foi possível carregar os alertas do servidor.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user?.nivelAcesso === 'CLINICA') {
            setLoading(false);
            setError("Acesso restrito: Clínicas não possuem permissão para ver alertas da ONG.");
            return;
        }
        fetchAlarmes();
    }, []);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="text-orange-500" /> Central de Alertas
                </h1>
                <p className="text-slate-400 text-sm">Monitoramento em tempo real da operação e financeiro.</p>
            </div>

            {/* BOX DE INSTRUÇÕES - Protocolo de Auditoria */}
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5 flex gap-4">
                <div className="bg-blue-500/10 p-3 rounded-xl h-fit">
                    <Info className="text-blue-400" size={24} />
                </div>
                <div className="space-y-3">
                    <h2 className="text-blue-100 font-bold text-sm uppercase tracking-wider">Protocolo de Auditoria</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                            <span className="text-blue-400 font-bold block mb-1 text-[10px]">FINANCEIRO</span>
                            <p className="text-slate-300">Confira o PIX no banco e clique em <span className="text-white font-medium">Confirmar</span> na tela de Pagamentos.</p>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                            <span className="text-orange-400 font-bold block mb-1 text-[10px]">OPERACIONAL</span>
                            <p className="text-slate-300">Fila acima da capacidade. Verifique a <span className="text-white font-medium">Fila de Castração</span> para organizar os mutirões.</p>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                            <span className="text-green-400 font-bold block mb-1 text-[10px]">RESOLUÇÃO</span>
                            <p className="text-slate-300">Assim que a pendência for tratada na tela de destino, este alarme sumirá automaticamente.</p>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-20 text-slate-500">
                    <Loader2 className="animate-spin mb-4" size={40} />
                    <p>Sincronizando dados...</p>
                </div>
            ) : error ? (
                <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-red-400 text-center">{error}</div>
            ) : alertas.length === 0 ? (
                <div className="bg-slate-800/20 border border-slate-800 p-10 rounded-2xl text-center text-slate-500 italic">
                    <CheckCircle2 className="mx-auto mb-4 text-green-500/50" size={48} />
                    <p>Tudo em ordem por aqui!</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {alertas.map((alerta, index) => {
                        const isFinanceiro = alerta.tipo === 'CRÍTICO' || alerta.mensagem?.toUpperCase().includes('PIX');
                        const isAuditoria = alerta.tipo === 'AUDITORIA';
                        const isFilaCritica = alerta.mensagem?.toUpperCase().includes('FILA');
                        
                        const keyUnica = alerta.id ? `alerta-${alerta.id}` : `alerta-idx-${index}`;

                        let cardStyle = "bg-orange-500/5 border-orange-500/20";
                        let iconStyle = "bg-orange-500/10 text-orange-500";
                        let badgeStyle = "bg-orange-500/20 text-orange-400";
                        let badgeLabel = "LOGÍSTICA / FILA";

                        if (isFinanceiro) {
                            cardStyle = "bg-red-500/5 border-red-500/20 shadow-sm";
                            iconStyle = "bg-red-500/10 text-red-500";
                            badgeStyle = "bg-red-500/20 text-red-400";
                            badgeLabel = "PENDÊNCIA FINANCEIRA";
                        } else if (isAuditoria) {
                            cardStyle = "bg-purple-500/5 border-purple-500/20 shadow-sm";
                            iconStyle = "bg-purple-500/10 text-purple-400";
                            badgeStyle = "bg-purple-500/20 text-purple-400";
                            badgeLabel = "HISTÓRICO / AUDITORIA";
                        }

                        return (
                            <div key={keyUnica} className={`p-4 rounded-2xl border flex items-center justify-between transition-all group ${cardStyle}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${iconStyle}`}>
                                        {isFinanceiro ? <DollarSign size={24} /> : 
                                         isAuditoria ? <LayoutList size={24} /> : 
                                         <PawPrint size={24} />}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-sm uppercase">{alerta.mensagem}</h3>
                                        <div className="flex items-center gap-2 mt-1 text-xs">
                                            <span className={`px-2 py-0.5 rounded font-black ${badgeStyle}`}>
                                                {badgeLabel}
                                            </span>

                                            {alerta.responsavel && alerta.responsavel !== 'N/A' && (
                                                <>
                                                    <span className="text-slate-700">|</span>
                                                    <span className="text-slate-500 italic">Resp: {alerta.responsavel}</span>
                                                </>
                                            )}

                                            {alerta.tutor && alerta.tutor !== 'N/A' && (
                                                <>
                                                    <span className="text-slate-700">|</span>
                                                    <span className="text-slate-500 italic">Tutor: {alerta.tutor}</span>
                                                </>
                                            )}

                                            {isFilaCritica && (!alerta.tutor || alerta.tutor === 'N/A') && (
                                                <>
                                                    <span className="text-slate-700">|</span>
                                                    <span className="text-blue-400/60 font-medium">Aguardando agendamento em massa</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate(isAuditoria ? '/admin/extrato' : isFinanceiro ? '/admin/pagamentos' : '/admin/fila')}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all border bg-slate-800 border-slate-700 ${
                                        isAuditoria ? 'hover:border-purple-500/50' : 
                                        isFinanceiro ? 'hover:border-red-500/50' : 
                                        'hover:border-orange-500/50'
                                    }`}
                                >
                                    {isAuditoria ? 'Ver Histórico' : isFinanceiro ? 'Verificar Pagamento' : 'Organizar Fila'}
                                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CentralAlarmes;