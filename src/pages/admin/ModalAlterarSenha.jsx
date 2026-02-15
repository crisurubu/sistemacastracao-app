import React, { useState } from 'react';
import { ShieldAlert, X, CheckCircle2, Loader2, KeyRound } from 'lucide-react';
import api from '../../services/api';

const ModalAlterarSenha = ({ isOpen, onClose }) => {
    const [form, setForm] = useState({ atual: '', nova: '', confirma: '' });
    const [loading, setLoading] = useState(false);
    const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.nova !== form.confirma) {
            return setMensagem({ tipo: 'erro', texto: 'As novas senhas não coincidem!' });
        }

        setLoading(true);
        setMensagem({ tipo: '', texto: '' });

        try {
            // Chama o endpoint que criamos que altera na tabela Administrador
            await api.put('/clinica/alterar-senha', {
                senhaAtual: form.atual,
                novaSenha: form.nova
            });

            setMensagem({ tipo: 'sucesso', texto: 'Senha atualizada com sucesso!' });

            // Fecha o modal após 2 segundos para a clínica ver o sucesso
            setTimeout(() => {
                onClose();
                setForm({ atual: '', nova: '', confirma: '' });
                setMensagem({ tipo: '', texto: '' });
            }, 2000);
        } catch (err) {
            setMensagem({
                tipo: 'erro',
                texto: err.response?.data?.message || 'Senha atual incorreta.'
            });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[3rem] p-8 shadow-2xl animate-in zoom-in duration-300">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-white font-black italic text-xl flex items-center gap-3 uppercase tracking-tighter">
                        <KeyRound className="text-emerald-500" size={24} /> Segurança
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-2 bg-slate-950 rounded-full border border-slate-800">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-2 italic tracking-widest">Senha Atual</label>
                        <input
                            type="password" required
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                            value={form.atual}
                            onChange={e => setForm({ ...form, atual: e.target.value })}
                        />
                    </div>

                    <div className="h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />

                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-2 italic tracking-widest">Nova Senha</label>
                        <input
                            type="password" required
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                            value={form.nova}
                            onChange={e => setForm({ ...form, nova: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-2 italic tracking-widest">Confirmar Nova Senha</label>
                        <input
                            type="password" required
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                            value={form.confirma}
                            onChange={e => setForm({ ...form, confirma: e.target.value })}
                        />
                    </div>

                    {mensagem.texto && (
                        <div className={`p-4 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase italic animate-bounce ${mensagem.tipo === 'sucesso' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                            {mensagem.tipo === 'sucesso' ? <CheckCircle2 size={16} /> : <ShieldAlert size={16} />}
                            {mensagem.texto}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-black py-5 rounded-[2rem] transition-all shadow-[0_10px_30px_-10px_rgba(16,185,129,0.5)] flex justify-center items-center gap-2 uppercase italic tracking-tighter"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                <span>Processando...</span>
                            </>
                        ) : (
                            'Confirmar Alteração'
                        )}
                    </button>
                    {/* NOTA DE AJUDA */}
                    <p className="mt-8 text-[9px] text-slate-600 text-center uppercase tracking-widest leading-relaxed">
                        Esqueceu sua senha atual? <br />
                        Entre em contato com a <span className="text-slate-400 font-bold">Sistema Castracao ong</span> para resetar sua conta.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default ModalAlterarSenha;