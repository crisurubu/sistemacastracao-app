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

        if (form.nova.length < 6) {
            return setMensagem({ tipo: 'erro', texto: 'A nova senha deve ter no mínimo 6 caracteres.' });
        }

        setLoading(true);
        setMensagem({ tipo: '', texto: '' });

        try {
            // O endpoint utiliza a sessão do cookie HttpOnly para saber qual admin/clínica está logada
            await api.put('/clinica/alterar-senha', {
                senhaAtual: form.atual,
                novaSenha: form.nova
            });

            setMensagem({ tipo: 'sucesso', texto: 'Senha atualizada com sucesso!' });

            // Timer de fechamento para feedback visual
            setTimeout(() => {
                handleClose();
            }, 2000);
        } catch (err) {
            setMensagem({
                tipo: 'erro',
                texto: err.response?.data?.message || 'Erro ao validar senha atual.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setForm({ atual: '', nova: '', confirma: '' });
        setMensagem({ tipo: '', texto: '' });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300 relative overflow-hidden">
                
                {/* Detalhe estético de fundo */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />

                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-white font-black italic text-2xl flex items-center gap-3 uppercase tracking-tighter">
                            <KeyRound className="text-emerald-500" size={28} /> Segurança
                        </h2>
                        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mt-1">Alteração de Credenciais</p>
                    </div>
                    <button 
                        onClick={handleClose} 
                        className="text-slate-500 hover:text-white transition-all p-2 bg-slate-950 rounded-full border border-slate-800 hover:rotate-90"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="group">
                        <label className="text-[10px] font-black text-slate-500 uppercase ml-2 italic tracking-[0.2em] group-focus-within:text-emerald-500 transition-colors">Senha Atual</label>
                        <input
                            type="password" required
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-emerald-500/50 transition-all font-mono"
                            value={form.atual}
                            onChange={e => setForm({ ...form, atual: e.target.value })}
                        />
                    </div>

                    <div className="h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent my-2" />

                    <div className="group">
                        <label className="text-[10px] font-black text-slate-500 uppercase ml-2 italic tracking-[0.2em] group-focus-within:text-emerald-500 transition-colors">Nova Senha</label>
                        <input
                            type="password" required
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-emerald-500/50 transition-all font-mono"
                            value={form.nova}
                            onChange={e => setForm({ ...form, nova: e.target.value })}
                        />
                    </div>

                    <div className="group">
                        <label className="text-[10px] font-black text-slate-500 uppercase ml-2 italic tracking-[0.2em] group-focus-within:text-emerald-500 transition-colors">Confirmar Nova Senha</label>
                        <input
                            type="password" required
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-emerald-500/50 transition-all font-mono"
                            value={form.confirma}
                            onChange={e => setForm({ ...form, confirma: e.target.value })}
                        />
                    </div>

                    {mensagem.texto && (
                        <div className={`p-4 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase italic animate-in slide-in-from-top-2 duration-300 ${mensagem.tipo === 'sucesso' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                            {mensagem.tipo === 'sucesso' ? <CheckCircle2 size={16} /> : <ShieldAlert size={16} />}
                            {mensagem.texto}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-black py-5 rounded-[2rem] transition-all shadow-[0_20px_40px_-15px_rgba(16,185,129,0.3)] flex justify-center items-center gap-2 uppercase italic tracking-tighter active:scale-95"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                <span>Autenticando...</span>
                            </>
                        ) : (
                            'Confirmar Nova Senha'
                        )}
                    </button>

                    <div className="pt-4">
                        <p className="text-[9px] text-slate-600 text-center uppercase tracking-[0.2em] leading-relaxed">
                            Atenção: A alteração é imediata. <br />
                            Suporte: <span className="text-slate-400 font-bold">sistemacastracao@gmail.com</span>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalAlterarSenha;