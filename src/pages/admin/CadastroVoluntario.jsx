import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, Check, Lock, RefreshCw, UserPlus, Edit3 } from 'lucide-react';

const CadastroVoluntario = () => {
    const navigate = useNavigate();
    const location = useLocation(); 
    
    const estadoInicial = {
        nome: '',
        cpf: '',
        whatsapp: '',
        cep: '',
        logradouro: '',
        numero: '',
        bairro: '',
        cidade: '',
        estado: '',
        administrador: {
            email: '',
            senha: ''
        }
    };

    const [passo, setPasso] = useState(1);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');
    const [mensagemInfo, setMensagemInfo] = useState('');
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState(estadoInicial);

    const gerarSenhaAleatoria = () => {
        const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let senha = '';
        for (let i = 0; i < 8; i++) senha += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
        return senha;
    };

    const maskCPF = (v) => v.replace(/\D/g, "").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    const maskWhatsApp = (v) => v.replace(/\D/g, "").replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2").replace(/(-\d{4})\d+?$/, "$1");
    const maskCEP = (v) => v.replace(/\D/g, "").replace(/^(\d{5})(\d)/, "$1-$2").replace(/(-\d{3})\d+?$/, "$1");

    const validarCpfESeguir = useCallback(async (cpfManual) => {
        const cpfParaValidar = cpfManual || formData.cpf;
        const cpfLimpo = cpfParaValidar.replace(/\D/g, '');
        
        if (cpfLimpo.length < 11) {
            setErro("⚠️ Informe um CPF completo.");
            return;
        }

        setLoading(true);
        setErro("");
        setMensagemInfo(""); // Limpa info anterior

        try {
            const response = await api.get(`/admin/voluntarios/verificar/${cpfLimpo}`);

            if (response.data.existe) {
                const v = response.data.voluntario;
                setIsEdit(true);
                setFormData({
                    ...v,
                    cpf: maskCPF(v.cpf),
                    whatsapp: maskWhatsApp(v.whatsapp || ''),
                    cep: maskCEP(v.cep || ''),
                    administrador: {
                        ...v.administrador,
                        senha: '' 
                    }
                });
                setMensagemInfo("ℹ️ Modo de edição ativado para este voluntário.");
                setPasso(2); // CORREÇÃO: Força o avanço para o passo 2 na edição
            } else {
                setIsEdit(false);
                // Se for novo, valida se tem nome antes de seguir
                if (formData.nome.length > 3 || (cpfManual && !response.data.existe)) {
                    setPasso(2);
                } else {
                    setErro("⚠️ CPF disponível! Informe o nome para prosseguir.");
                }
            }
        } catch (err) {
            setErro("❌ Erro ao validar CPF.");
        } finally {
            setLoading(false);
        }
    }, [formData.cpf, formData.nome]);

    useEffect(() => {
        if (location.state?.cpfPreenchido) {
            const cpfFormatado = maskCPF(location.state.cpfPreenchido);
            setFormData(prev => ({ ...prev, cpf: cpfFormatado }));
            validarCpfESeguir(location.state.cpfPreenchido);
        }
    }, [location.state, validarCpfESeguir]);

    const resetarFormulario = () => {
        setFormData({
            ...estadoInicial,
            administrador: { ...estadoInicial.administrador, senha: gerarSenhaAleatoria() }
        });
        setPasso(1);
        setIsEdit(false);
        setErro('');
        setMensagemInfo('');
    };

    useEffect(() => {
        if (!isEdit && !formData.administrador.senha) {
            setFormData(prev => ({
                ...prev,
                administrador: { ...prev.administrador, senha: gerarSenhaAleatoria() }
            }));
        }
    }, [isEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let val = value;
        if (name === "cpf") val = maskCPF(value);
        if (name === "whatsapp") val = maskWhatsApp(value);
        if (name === "cep") val = maskCEP(value);

        if (name === "email") {
            setFormData({ ...formData, administrador: { ...formData.administrador, [name]: val } });
        } else {
            setFormData({ ...formData, [name]: val });
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setErro("");
        
        try {
            const payload = {
                ...formData,
                cpf: formData.cpf.replace(/\D/g, ''),
                cep: formData.cep.replace(/\D/g, ''),
                whatsapp: formData.whatsapp.replace(/\D/g, ''),
                administrador: {
                    ...formData.administrador,
                    nome: formData.nome,
                    nivelAcesso: "VOLUNTARIO"
                }
            };

            await api.post('/admin/voluntarios', payload);

            alert(isEdit ? "✅ Dados atualizados!" : "✅ Voluntário cadastrado!");
            resetarFormulario();
            navigate('/admin/voluntarios');
            
        } catch (err) {
            setErro(`❌ ${err.response?.data?.message || "Falha ao salvar"}`);
        } finally {
            setLoading(false);
        }
    };

    const buscarCep = async () => {
        const cepLimpo = formData.cep.replace(/\D/g, '');
        if (cepLimpo.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    setFormData(prev => ({
                        ...prev,
                        logradouro: data.logradouro, bairro: data.bairro, city: data.localidade, estado: data.uf
                    }));
                }
            } catch (err) { }
        }
    };

    const inputStyle = `w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`;

    return (
        <div className="p-6 bg-slate-950 min-h-screen text-white">
            <button onClick={() => navigate('/admin/voluntarios')} className="mb-6 text-slate-400 hover:text-white flex items-center transition-colors font-bold text-xs uppercase tracking-widest">
                <ArrowLeft size={16} className="mr-2"/> Voltar
            </button>

            <div className="max-w-md mx-auto bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl border border-slate-800 relative overflow-hidden">
                {isEdit && (
                    <div className="absolute top-4 right-8 flex items-center gap-1 text-[10px] font-black text-amber-500 uppercase tracking-tighter bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                        <Edit3 size={12} /> Editando
                    </div>
                )}

                {loading && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center">
                        <div className="flex flex-col items-center">
                            <RefreshCw className="animate-spin text-emerald-500 mb-2" size={32} />
                            <span className="text-emerald-400 font-black uppercase tracking-tighter text-[10px]">Processando...</span>
                        </div>
                    </div>
                )}

                {/* Stepper */}
                <div className="flex items-center justify-center mb-8 space-x-2">
                    {[1, 2, 3].map((num) => (
                        <div key={num} className="flex items-center">
                            <div className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-black transition-all ${passo === num ? 'bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : passo > num ? 'bg-emerald-900/40 text-emerald-500' : 'bg-slate-800 text-slate-500'}`}>
                                {passo > num ? <Check size={14}/> : num}
                            </div>
                            {num < 3 && <div className={`w-6 h-0.5 mx-1 ${passo > num ? 'bg-emerald-600/50' : 'bg-slate-800'}`} />}
                        </div>
                    ))}
                </div>

                <h2 className="text-xl font-black uppercase tracking-tighter mb-6 text-center italic flex items-center justify-center gap-2">
                    {isEdit ? <Edit3 className="text-amber-500" size={20}/> : <UserPlus className="text-emerald-500" size={20}/>}
                    <span className={isEdit ? "text-amber-500" : "text-emerald-500"}>
                        {passo === 1 ? "Identificação" : passo === 2 ? "Localização" : "Segurança"}
                    </span>
                </h2>

                {erro && <div className="mb-6 p-3 bg-red-900/20 border border-red-500/50 text-red-400 rounded-xl text-[10px] text-center font-bold uppercase">{erro}</div>}
                {mensagemInfo && <div className="mb-6 p-3 bg-emerald-900/20 border border-emerald-500/50 text-emerald-400 rounded-xl text-[10px] text-center font-bold uppercase">{mensagemInfo}</div>}

                {passo === 1 && (
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">CPF (Consulta Automática)</label>
                            <div className="flex gap-2">
                                <input className={inputStyle} name="cpf" placeholder="000.000.000-00" onChange={handleChange} value={formData.cpf} disabled={loading || isEdit} />
                                {isEdit && (
                                    <button onClick={() => { setIsEdit(false); setFormData({...formData, cpf: ''}) }} className="bg-slate-700 hover:bg-red-500/20 hover:text-red-500 px-3 rounded-xl transition-all">
                                        <RefreshCw size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Nome do Voluntário</label>
                            <input className={inputStyle} name="nome" placeholder="Nome Completo" onChange={handleChange} value={formData.nome} disabled={loading} />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">WhatsApp</label>
                            <input className={inputStyle} name="whatsapp" placeholder="(00) 00000-0000" onChange={handleChange} value={formData.whatsapp} disabled={loading} />
                        </div>
                        
                        <button 
                            onClick={() => validarCpfESeguir()} 
                            disabled={loading || !formData.cpf || !formData.nome} 
                            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 p-4 rounded-2xl font-black uppercase tracking-widest transition-all mt-4 text-xs shadow-lg shadow-emerald-900/40"
                        >
                            Próximo Passo
                        </button>
                    </div>
                )}

                {passo === 2 && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">CEP</label>
                                <input className={inputStyle} name="cep" placeholder="00000-000" onChange={handleChange} onBlur={buscarCep} value={formData.cep} disabled={loading} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Número</label>
                                <input className={inputStyle} name="numero" placeholder="Nº" onChange={handleChange} value={formData.numero} disabled={loading} />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Logradouro (Rua/Av)</label>
                            <input className={inputStyle} name="logradouro" placeholder="Endereço..." onChange={handleChange} value={formData.logradouro} disabled={loading} />
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button onClick={() => setPasso(1)} className="w-1/3 bg-slate-800 text-slate-500 p-4 rounded-2xl font-bold uppercase text-[10px]">Voltar</button>
                            <button onClick={() => setPasso(3)} className="w-2/3 bg-emerald-600 text-white p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">Continuar</button>
                        </div>
                    </div>
                )}

                {passo === 3 && (
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">E-mail para Acesso</label>
                            <input className={inputStyle} name="email" type="email" placeholder="voluntario@sistema.com" onChange={handleChange} value={formData.administrador.email} disabled={loading} />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">
                                {isEdit ? "Nova Senha (deixe vazio para manter)" : "Senha Gerada"}
                            </label>
                            <div className="relative">
                                <input 
                                    className={`${inputStyle} pr-12 font-mono`} 
                                    value={formData.administrador.senha} 
                                    onChange={(e) => setFormData({...formData, administrador: {...formData.administrador, senha: e.target.value}})}
                                    placeholder={isEdit ? "••••••••" : ""}
                                />
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, administrador: {...formData.administrador, senha: gerarSenhaAleatoria()}})}
                                    className="absolute right-3 top-2.5 text-emerald-500 hover:text-emerald-400 p-1"
                                >
                                    <RefreshCw size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button onClick={() => setPasso(2)} className="w-1/3 bg-slate-800 text-slate-500 p-4 rounded-2xl font-bold uppercase text-[10px]">Voltar</button>
                            <button onClick={handleSubmit} disabled={loading} className="w-2/3 bg-emerald-600 text-white p-4 rounded-2xl font-black uppercase text-[10px] italic tracking-widest shadow-lg shadow-emerald-900/40">
                                {isEdit ? "Salvar Alterações" : "Concluir Cadastro"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CadastroVoluntario;