import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, MessageCircle, UserX, UserCheck, MapPin, Phone, Shield, Edit3, Mail } from "lucide-react";
const GerenciarVoluntario = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [voluntario, setVoluntario] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const buscarDados = async () => {
            try {
                // Removido localStorage.getItem('token')
                // O Axios configurado com withCredentials: true enviará o cookie automaticamente
                const response = await api.get(`/admin/voluntarios/${id}`);
                setVoluntario(response.data);
            } catch (err) {
                console.error("Erro ao buscar dados do voluntário:", err);
                // O erro 401 será tratado pelo interceptor global do Axios se o cookie expirar
                navigate('/admin/voluntarios');
            } finally {
                setLoading(false);
            }
        };

        buscarDados();
    }, [id, navigate]);

    const alternarStatus = async () => {
        const novoStatus = !voluntario.ativo;
        const acao = novoStatus ? 'ATIVAR' : 'BLOQUEAR';
        
        if (!window.confirm(`Deseja realmente ${acao} o acesso deste voluntário?`)) return;

        try {
            // Removido headers manuais
            await api.patch(`/admin/voluntarios/${id}/status`, { ativo: novoStatus });
            
            setVoluntario({ ...voluntario, ativo: novoStatus });
            alert(`Voluntário ${novoStatus ? 'ativado' : 'bloqueado'} com sucesso!`);
        } catch (err) {
            console.error("Erro ao alterar status:", err);
            alert("Erro ao alterar status no servidor.");
        }
    };

    const abrirWhatsApp = () => {
        const numero = voluntario.whatsapp.replace(/\D/g, '');
        const mensagem = encodeURIComponent(`Olá ${voluntario.nome}, aqui é da equipe do Sistema Castração ONG!`);
        window.open(`https://wa.me/55${numero}?text=${mensagem}`, '_blank');
    };

    const editarVoluntario = () => {
    navigate('/admin/voluntarios/novo', { 
        state: { 
            voluntario: voluntario, // Enviando o objeto completo
            modoEdicao: true 
        } 
    });
};

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500 mb-4"></div>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Carregando Perfil...</p>
        </div>
    );

    if (!voluntario) return null;

    return (
        <div className="p-6 bg-slate-950 min-h-screen text-white font-sans">
            {/* Top Bar */}
            <div className="max-w-3xl mx-auto mb-8 flex justify-between items-center">
                <button 
                    onClick={() => navigate('/admin/voluntarios')} 
                    className="group text-slate-400 hover:text-white flex items-center transition-all font-bold text-xs uppercase tracking-widest"
                >
                    <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform"/> Voltar para Lista
                </button>
                
                <button 
                    onClick={editarVoluntario}
                    className="flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-slate-950 px-5 py-2.5 rounded-xl border border-amber-500/20 transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-amber-900/10"
                >
                    <Edit3 size={16} /> Editar Cadastro
                </button>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
                {/* Card Principal de Perfil */}
                <div className="bg-slate-900 p-8 rounded-[3rem] border border-slate-800 relative overflow-hidden shadow-2xl">
                    {/* Status Badge */}
                    <div className={`absolute top-0 right-0 px-8 py-3 rounded-bl-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl ${voluntario.ativo ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                        {voluntario.ativo ? '● Acesso Ativo' : '● Bloqueado'}
                    </div>

                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
                        <div className="p-6 bg-slate-800 rounded-3xl text-emerald-500 border border-slate-700 shadow-inner">
                            <Shield size={48} />
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-4xl font-black uppercase tracking-tighter italic text-white leading-none mb-2">
                                {voluntario.nome}
                            </h1>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-[10px] font-mono border border-slate-700">
                                    CPF: {voluntario.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}
                                </span>
                                <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-[10px] font-black border border-blue-500/20 uppercase tracking-widest">
                                    Voluntário
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button 
                            onClick={abrirWhatsApp}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 p-4 rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-xs transition-all shadow-lg shadow-emerald-900/40"
                        >
                            <MessageCircle size={20} /> Contatar via WhatsApp
                        </button>

                        <button 
                            onClick={alternarStatus}
                            className={`flex-1 p-4 rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-xs transition-all border-2 ${voluntario.ativo ? 'border-red-500/30 text-red-500 hover:bg-red-600 hover:text-white' : 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-600 hover:text-white'}`}
                        >
                            {voluntario.ativo ? <><UserX size={20} /> Bloquear Acesso</> : <><UserCheck size={20} /> Reativar Membro</>}
                        </button>
                    </div>
                </div>

                {/* Grid de Informações Detalhadas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contato */}
                    <div className="bg-slate-900/50 p-7 rounded-[2rem] border border-slate-800 group hover:border-emerald-500/30 transition-all backdrop-blur-sm">
                        <h3 className="text-slate-500 text-[10px] font-black uppercase mb-6 tracking-widest flex items-center gap-2">
                            <Phone size={14} className="text-emerald-500" /> Comunicação e Login
                        </h3>
                        <div className="space-y-5">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-slate-800 rounded-lg text-slate-500"><Mail size={16}/></div>
                                <div>
                                    <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">E-mail Administrativo</p>
                                    <p className="text-sm text-slate-200 font-medium break-all">{voluntario.administrador?.email || 'Nenhum e-mail vinculado'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-slate-800 rounded-lg text-slate-500"><MessageCircle size={16}/></div>
                                <div>
                                    <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">Telefone Principal</p>
                                    <p className="text-sm text-slate-200 font-medium">{voluntario.whatsapp}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Endereço */}
                    <div className="bg-slate-900/50 p-7 rounded-[2rem] border border-slate-800 group hover:border-emerald-500/30 transition-all backdrop-blur-sm">
                        <h3 className="text-slate-500 text-[10px] font-black uppercase mb-6 tracking-widest flex items-center gap-2">
                            <MapPin size={14} className="text-emerald-500" /> Localização
                        </h3>
                        <div className="space-y-1">
                            <p className="text-white font-bold text-lg leading-tight">
                                {voluntario.logradouro}, {voluntario.numero}
                            </p>
                            <p className="text-slate-400 text-sm">{voluntario.bairro}</p>
                            <p className="text-slate-400 text-sm font-medium">{voluntario.cidade} — {voluntario.estado}</p>
                            <div className="pt-4 flex items-center gap-2">
                                <span className="bg-slate-800 px-3 py-1 rounded-lg font-mono text-[11px] text-slate-500 border border-slate-700">
                                    CEP {voluntario.cep}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GerenciarVoluntario;