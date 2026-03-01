import React, { useState } from 'react';
import { ShieldCheck, Search, FileText, AlertCircle, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { gerarGuiaCastracao } from '../../utils/GeradorPDF';

const VerificarGuia = () => {
    const [hash, setHash] = useState('');
    const [agendamento, setAgendamento] = useState(null);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState(null);

    const handleVerificar = async () => {
        if (!hash || hash.length < 3) return;

        setLoading(true);
        setErro(null);
        setAgendamento(null);

        try {
            // Rota pública que vamos criar no Java
            // No React
            const response = await api.get(`/public/agendamentos/verificar/${hash}`);
            setAgendamento(response.data);
        } catch (error) {
            setErro("Código Hash não encontrado ou inválido. Verifique o documento físico.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center">
                    <div className="bg-emerald-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="text-emerald-500" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Validador de Guia</h1>
                    <p className="text-slate-400 text-sm mt-2">Digite o código Hash da guia para confirmar os dados.</p>
                </div>

                <div className="relative group">
                    <input
                        type="text"
                        placeholder="Ex: TAT-XYZ-123"
                        className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl p-4 pl-12 text-white font-mono text-lg uppercase focus:border-emerald-500 outline-none transition-all"
                        value={hash}
                        onChange={(e) => setHash(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleVerificar()}
                    />
                    <Search className="absolute left-4 top-5 text-slate-500" size={20} />
                </div>

                <button
                    onClick={handleVerificar}
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin" /> : "VERIFICAR AUTENTICIDADE"}
                </button>

                {erro && (
                    <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex items-center gap-3 text-red-400 text-sm">
                        <AlertCircle size={18} /> {erro}
                    </div>
                )}

                {agendamento && (
                    <div className="bg-slate-900 border border-emerald-500/30 p-6 rounded-2xl space-y-4 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <span className="text-emerald-500 font-bold text-xs uppercase tracking-widest">Documento Válido</span>
                            <span className="text-slate-500 text-xs">ID: {agendamento.id}</span>
                        </div>

                        <div>
                            <p className="text-slate-500 text-xs uppercase">Pet / Tutor</p>
                            <p className="text-white font-bold text-lg">{agendamento.cadastro.pet.nomeAnimal}</p>
                            <p className="text-slate-400 text-sm">{agendamento.cadastro.tutor.nome}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-3">
                            <div>
                                <p className="text-slate-500 text-xs uppercase">Data</p>
                                <p className="text-white font-semibold">{new Date(agendamento.dataHora).toLocaleDateString('pt-BR')}</p>
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs uppercase">Local</p>
                                <p className="text-white font-semibold truncate">{agendamento.local}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => gerarGuiaCastracao(agendamento)}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors"
                        >
                            <FileText size={18} /> VISUALIZAR PDF ORIGINAL
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerificarGuia;