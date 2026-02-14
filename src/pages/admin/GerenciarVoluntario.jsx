import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, MessageCircle, UserX, UserCheck, MapPin, Phone, Shield } from 'lucide-react';

const GerenciarVoluntario = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [voluntario, setVoluntario] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const buscarDados = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await api.get(`/admin/voluntarios/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setVoluntario(response.data);
            } catch (err) {
                console.error("Erro ao buscar:", err);
                navigate('/admin/voluntarios');
            } finally {
                setLoading(false);
            }
        };

        buscarDados();
    }, [id, navigate]);

    const alternarStatus = async () => {
        const novoStatus = !voluntario.ativo;
        if (!window.confirm(`Deseja realmente ${novoStatus ? 'ATIVAR' : 'INATIVAR'} este voluntário?`)) return;

        try {
            const token = localStorage.getItem('token');
            await api.patch(`/admin/voluntarios/${id}/status`, { ativo: novoStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVoluntario({ ...voluntario, ativo: novoStatus });
        } catch (err) {
            alert("Erro ao alterar status no servidor.");
        }
    };

    const abrirWhatsApp = () => {
        const numero = voluntario.whatsapp.replace(/\D/g, '');
        const mensagem = encodeURIComponent(`Olá ${voluntario.nome}, aqui é da equipe do Sistema Castração ONG!`);
        window.open(`https://wa.me/55${numero}?text=${mensagem}`, '_blank');
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500"></div>
        </div>
    );

    if (!voluntario) return null;

    return (
        <div className="p-6 bg-slate-950 min-h-screen text-white">
            <button onClick={() => navigate('/admin/voluntarios')} className="mb-6 text-slate-400 hover:text-white flex items-center transition-colors">
                <ArrowLeft size={20} className="mr-2"/> Voltar para a lista
            </button>

            <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 relative overflow-hidden shadow-2xl">
                    <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-2xl font-black text-[10px] uppercase tracking-widest ${voluntario.ativo ? 'bg-emerald-600' : 'bg-red-600'}`}>
                        {voluntario.ativo ? 'Membro Ativo' : 'Acesso Bloqueado'}
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-4 bg-slate-800 rounded-2xl text-emerald-500">
                            <Shield size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black uppercase tracking-tighter italic text-white leading-none">{voluntario.nome}</h1>
                            <p className="text-slate-500 font-mono text-sm mt-1">CPF: {voluntario.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                        <button 
                            onClick={abrirWhatsApp}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 p-4 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all shadow-lg shadow-emerald-900/20"
                        >
                            <MessageCircle size={22} /> Chamar no WhatsApp
                        </button>

                        <button 
                            onClick={alternarStatus}
                            className={`flex-1 p-4 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all border-2 ${voluntario.ativo ? 'border-red-500/50 text-red-500 hover:bg-red-500/10' : 'border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10'}`}
                        >
                            {voluntario.ativo ? <><UserX size={22} /> Inativar Acesso</> : <><UserCheck size={22} /> Reativar Acesso</>}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                        <h3 className="text-slate-500 text-xs font-black uppercase mb-4 tracking-widest flex items-center gap-2">
                            <Phone size={14} /> Dados de Contato
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-[10px] uppercase text-slate-500 font-bold">E-mail de Login</p>
                                <p className="text-sm text-slate-200">{voluntario.administrador?.email || 'Sem e-mail'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase text-slate-500 font-bold">Telefone/WhatsApp</p>
                                <p className="text-sm text-slate-200">{voluntario.whatsapp}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                        <h3 className="text-slate-500 text-xs font-black uppercase mb-4 tracking-widest flex items-center gap-2">
                            <MapPin size={14} /> Localização
                        </h3>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            {voluntario.logradouro}, {voluntario.numero}<br />
                            {voluntario.bairro}<br />
                            {voluntario.cidade} - {voluntario.estado}<br />
                            <span className="font-mono text-xs text-slate-500">CEP: {voluntario.cep}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ESSA LINHA É A MAIS IMPORTANTE PARA RESOLVER O SEU ERRO:
export default GerenciarVoluntario;