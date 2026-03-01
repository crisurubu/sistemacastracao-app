import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import CadastroTutor from './CadastroTutor';
import { PawPrint, Clock, Mail, Instagram, CheckCircle2, Heart, Info, Loader2, Share2, ShieldCheck } from 'lucide-react';

const HomePublica = () => {
    const [status, setStatus] = useState({ aberto: false, mensagem: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checarStatus = async () => {
            try {
                // Busca o status real do botão Power na nuvem
                const res = await api.get('/sistema/status');
                setStatus({ 
                    aberto: res.data.cadastroAberto, 
                    mensagem: res.data.mensagemFechado 
                });
            } catch (e) {
                console.error("Erro ao buscar status");
            } finally {
                setLoading(false);
            }
        };
        checarStatus();
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
            <span className="text-slate-500 font-black tracking-[0.5em] text-xs uppercase animate-pulse">Sincronizando Sistema...</span>
        </div>
    );

    // Se o botão Power estiver ON, renderiza o formulário diretamente
    if (status.aberto) return <CadastroTutor />;

    // Se o botão Power estiver OFF, renderiza a Landing Page de aviso
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 overflow-x-hidden selection:bg-emerald-500 selection:text-slate-950">
            
            {/* ELEMENTOS DE FUNDO (GLOW) */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full -z-10" />
            <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full -z-10" />

            {/* HEADER */}
            <nav className="p-8 flex justify-between items-center max-w-6xl mx-auto border-b border-white/5">
                <div className="flex items-center gap-3 group cursor-default">
                    <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-2.5 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:scale-110 transition-transform duration-500">
                        <PawPrint size={28} className="text-slate-950" />
                    </div>
                    <div>
                        <h1 className="font-black italic text-2xl tracking-tighter text-white leading-none">SISTEMA CASTRAÇÃO</h1>
                        <span className="text-[10px] font-bold text-emerald-500 tracking-[0.3em] uppercase">Ong & Parceiros</span>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-all hover:scale-110"><Instagram size={24} /></a>
                    <button className="bg-white/5 hover:bg-white/10 p-2.5 rounded-xl border border-white/10 transition-all"><Share2 size={20} /></button>
                </div>
            </nav>

            {/* HERO SECTION */}
            <main className="max-w-6xl mx-auto px-6 pt-20 pb-32">
                <div className="relative flex flex-col items-center text-center">
                    
                    {/* BADGE STATUS */}
                    <div className="inline-flex items-center gap-2 bg-slate-900/80 border border-slate-700 px-4 py-2 rounded-full mb-8 shadow-2xl backdrop-blur-md">
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_#f59e0b]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Inscrições Pausadas</span>
                    </div>

                    <h2 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter leading-[0.9] mb-8">
                        VAGAS EM <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-200 to-emerald-500 drop-shadow-sm">BREVE!</span>
                    </h2>

                    <div className="max-w-2xl bg-slate-900/40 border border-white/5 backdrop-blur-xl p-8 rounded-[3rem] shadow-3xl mb-16 relative">
                        <Clock className="absolute -top-6 left-1/2 -translate-x-1/2 text-emerald-500 bg-slate-950 rounded-full p-2 border-4 border-slate-950" size={56} />
                        <p className="text-xl text-slate-400 font-medium leading-relaxed italic">
                            "{status.mensagem || "Estamos finalizando os preparativos para o próximo mutirão. Fique atento às nossas redes sociais para garantir sua vaga."}"
                        </p>
                    </div>

                    {/* CARDS DE IMPACTO */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                        <div className="group bg-gradient-to-b from-slate-900 to-slate-950 p-10 rounded-[3.5rem] border border-white/5 hover:border-emerald-500/30 transition-all duration-500">
                            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500 transition-all">
                                <ShieldCheck className="text-emerald-500 group-hover:text-slate-950" size={32} />
                            </div>
                            <h4 className="text-white font-black uppercase text-lg mb-3 italic tracking-tighter">Castração é Saúde</h4>
                            <p className="text-slate-500 text-sm leading-relaxed">Reduz o risco de doenças graves e aumenta a expectativa de vida dos animais.</p>
                        </div>

                        <div className="group bg-gradient-to-b from-slate-900 to-slate-950 p-10 rounded-[3.5rem] border border-white/5 hover:border-emerald-500/30 transition-all duration-500">
                            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500 transition-all">
                                <Heart className="text-emerald-500 group-hover:text-slate-950" size={32} />
                            </div>
                            <h4 className="text-white font-black uppercase text-lg mb-3 italic tracking-tighter">Ato de Amor</h4>
                            <p className="text-slate-500 text-sm leading-relaxed">Evita o abandono e o sofrimento de milhares de ninhadas indesejadas.</p>
                        </div>

                        <div className="group bg-gradient-to-b from-slate-900 to-slate-950 p-10 rounded-[3.5rem] border border-white/5 hover:border-emerald-500/30 transition-all duration-500">
                            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500 transition-all">
                                <Info className="text-emerald-500 group-hover:text-slate-950" size={32} />
                            </div>
                            <h4 className="text-white font-black uppercase text-lg mb-3 italic tracking-tighter">Transparência</h4>
                            <p className="text-slate-500 text-sm leading-relaxed">Acompanhe seu histórico e guias através da nossa validação por Hash.</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* FOOTER */}
            <footer className="border-t border-white/5 bg-slate-900/20 py-16 px-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Contato Oficial</p>
                        <div className="flex items-center gap-3 text-emerald-400 font-bold hover:scale-105 transition-transform cursor-pointer">
                            <Mail size={20} />
                            <span>sistemacastracao@gmail.com</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-center md:items-end">
                        <div className="flex gap-4 mb-4">
                            <div className="h-10 w-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 text-slate-400 hover:text-white cursor-pointer transition-all"><Instagram size={20} /></div>
                        </div>
                        <p className="text-slate-600 text-[10px] font-medium tracking-tight">
                            © 2026 SISTEMA CASTRAÇÃO ONG | <span className="text-slate-500">CNPJ: 00.000.000/0001-00</span>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

// ESSA LINHA ABAIXO É O QUE RESOLVE O ERRO DO VITE:
export default HomePublica;

/**
 * RESUMO DO CÓDIGO:
 * - Export Padrão: Adicionado 'export default' para garantir compatibilidade com o Router.
 * - Lógica de Gatekeeper: O componente decide entre CadastroTutor ou Landing Page baseado no status.aberto.
 * - Estética V1: Background ultra-dark (#020617) com efeitos de glow e transparência glassmorphism preservados.
 */