import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, Check, RefreshCw, UserPlus, Edit3, MessageCircle, Loader2 } from 'lucide-react';

// --- SERVICE DE MENSAGENS (AJUSTADO PARA EVITAR UNDEFINED) ---
const BASE_URL_LOGIN = "https://sistema-castracao-app.onrender.com/admin/login";

const messagesService = {
    gerarLinkWhatsApp: (dados, tipoAcao, mudouSenha = false) => {
        let texto = "";
        const saudacao = `Olá *${dados.nome}*! 👋`;
        const rodape = `\n\n_Equipe Sistema Castração_`;

        // EXTRAÇÃO INTELIGENTE: Busca na raiz ou dentro de administrador
        const emailFinal = dados.email || (dados.administrador && dados.administrador.email);
        const senhaFinal = dados.senha || (dados.administrador && dados.administrador.senha);

        if (tipoAcao === 'CADASTRO_NOVO') {
            texto = `${saudacao}\n\nBem-vindo(a) à equipe de voluntários da *Sistema Castracao ong*! Seu acesso está pronto.\n\n📧 *LOGIN:* ${emailFinal}\n🔑 *SENHA:* ${senhaFinal}\n🌐 *LINK:* ${BASE_URL_LOGIN}\n\n_Vamos juntos fazer a diferença!_${rodape}`;
        } else if (tipoAcao === 'ATUALIZACAO') {
            const infoSenha = mudouSenha 
                ? `🔑 *NOVA SENHA:* ${senhaFinal}` 
                : `🔑 *SENHA:* (Mantida a anterior)`;

            texto = `${saudacao}\n\nSeus dados de acesso na *Sistema Castracao ong* foram atualizados.\n\n📧 *LOGIN:* ${emailFinal}\n${infoSenha}\n🌐 *LINK:* ${BASE_URL_LOGIN}${rodape}`;
        }
        
        if (!texto) return null;
        const foneLimpo = (dados.whatsapp || "").replace(/\D/g, '');
        return `https://wa.me/55${foneLimpo}?text=${encodeURIComponent(texto)}`;
    }
};

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
        administrador: { email: '', senha: '' }
    };

    const [passo, setPasso] = useState(1);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');
    const [mensagemInfo, setMensagemInfo] = useState('');
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState(estadoInicial);
    const [linkWhatsapp, setLinkWhatsapp] = useState(null);
    const [sucessoFinal, setSucessoFinal] = useState(false);

    // Máscaras de Input
    const maskCPF = (v) => v.replace(/\D/g, "").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    const maskWhatsApp = (v) => v.replace(/\D/g, "").replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2").replace(/(-\d{4})\d+?$/, "$1");
    const maskCEP = (v) => v.replace(/\D/g, "").replace(/^(\d{5})(\d)/, "$1-$2").replace(/(-\d{3})\d+?$/, "$1");

    const gerarSenhaAleatoria = () => {
        const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let senha = '';
        for (let i = 0; i < 8; i++) senha += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
        return senha;
    };

    const validarCpfESeguir = useCallback(async (cpfManual) => {
        const cpfLimpo = (cpfManual || formData.cpf).replace(/\D/g, '');
        if (cpfLimpo.length < 11) return setErro("⚠️ Informe um CPF completo.");

        setLoading(true); setErro("");
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
                    administrador: { email: (v.administrador?.email || v.email || '').toLowerCase(), senha: '' }
                });
                setMensagemInfo("ℹ️ Voluntário encontrado! Modo de edição ativado.");
            }
            setPasso(2);
        } catch (err) { setErro("❌ Erro ao validar CPF."); } 
        finally { setLoading(false); }
    }, [formData.cpf]);

   useEffect(() => {
    // 1. Tenta pegar do 'voluntario' ou 'voluntarioCompleto' (para garantir compatibilidade)
    const v = location.state?.voluntario || location.state?.voluntarioCompleto;

    if (v) {
        setIsEdit(true);
        setPasso(1); // Você pode colocar 2 aqui se quiser pular a tela de CPF na edição
        setFormData({
            ...v,
            cpf: maskCPF(v.cpf || ''),
            whatsapp: maskWhatsApp(v.whatsapp || ''),
            cep: maskCEP(v.cep || ''),
            // Garante que o objeto administrador não fique undefined
            administrador: { 
                email: (v.administrador?.email || v.email || '').toLowerCase(), 
                senha: '' 
            }
        });
    } else if (!isEdit && !formData.administrador.senha) {
        // Se for cadastro novo, gera a senha
        setFormData(prev => ({
            ...prev,
            administrador: { ...prev.administrador, senha: gerarSenhaAleatoria() }
        }));
    }
}, [location.state, isEdit]); // Removi o formData.administrador.senha das dependências para evitar loop

    const handleChange = (e) => {
        const { name, value } = e.target;
        let val = value;
        if (name === "cpf") val = maskCPF(value);
        if (name === "whatsapp") val = maskWhatsApp(value);
        if (name === "cep") val = maskCEP(value);
        if (name === "nome" || name === "logradouro" || name === "bairro") val = value.replace(/\b\w/g, (l) => l.toUpperCase());

        if (name === "email") {
            setFormData({ ...formData, administrador: { ...formData.administrador, [name]: val.toLowerCase().trim() } });
        } else {
            setFormData({ ...formData, [name]: val });
        }
    };

    const buscarCep = async () => {
        const cepLimpo = formData.cep.replace(/\D/g, '');
        if (cepLimpo.length !== 8) return;
        try {
            const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            const data = await res.json();
            if (!data.erro) {
                setFormData(prev => ({
                    ...prev,
                    logradouro: data.logradouro, bairro: data.bairro, cidade: data.localidade, estado: data.uf
                }));
            }
        } catch (err) { console.error("Erro CEP"); }
    };

    const handleSubmit = async () => {
        setLoading(true); setErro("");
        try {
            const payload = {
                ...formData,
                cpf: formData.cpf.replace(/\D/g, ''),
                cep: formData.cep.replace(/\D/g, ''),
                whatsapp: formData.whatsapp.replace(/\D/g, ''),
                administrador: { ...formData.administrador, nome: formData.nome, nivelAcesso: "VOLUNTARIO" }
            };

            await api.post('/admin/voluntarios', payload);

            const link = messagesService.gerarLinkWhatsApp(
                formData,
                isEdit ? 'ATUALIZACAO' : 'CADASTRO_NOVO',
                formData.administrador.senha.length > 0
            );

            setLinkWhatsapp(link);
            setSucessoFinal(true);
        } catch (err) {
            setErro(`❌ ${err.response?.data?.message || "Falha ao salvar"}`);
        } finally { setLoading(false); }
    };

    const inputStyle = `w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none transition-all`;

    return (
        <div className="p-6 bg-slate-950 min-h-screen text-white">
            <button onClick={() => navigate('/admin/voluntarios')} className="mb-6 text-slate-400 hover:text-white flex items-center gap-2 transition-colors font-bold text-xs uppercase">
                <ArrowLeft size={16}/> Voltar para Lista
            </button>

            <div className="max-w-md mx-auto bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden">
                {sucessoFinal ? (
                    <div className="text-center animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-emerald-500">
                            <Check size={40} />
                        </div>
                        <h2 className="text-2xl font-black mb-2 italic uppercase text-emerald-500">Voluntário Salvo!</h2>
                        <p className="text-slate-400 text-sm mb-8">Cadastro realizado com sucesso.</p>

                        {linkWhatsapp && (
                            <a href={linkWhatsapp} target="_blank" rel="noreferrer" 
                               className="flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black no-underline shadow-lg shadow-emerald-900/20">
                                 <MessageCircle size={24} /> ENVIAR WHATSAPP
                            </a>
                        )}
                        <button onClick={() => navigate('/admin/voluntarios')} className="mt-8 text-slate-500 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors">Concluir</button>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-center mb-8 space-x-2">
                            {[1, 2, 3].map((num) => (
                                <div key={num} className="flex items-center">
                                    <div className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold ${passo >= num ? 'bg-emerald-600' : 'bg-slate-800 text-slate-500'}`}>{passo > num ? <Check size={18}/> : num}</div>
                                    {num < 3 && <div className={`w-6 h-1 ${passo > num ? 'bg-emerald-600' : 'bg-slate-800'}`} />}
                                </div>
                            ))}
                        </div>

                        <h2 className="text-xl font-black uppercase mb-6 text-center italic text-emerald-500 flex items-center justify-center gap-2">
                            {isEdit ? <Edit3 size={20}/> : <UserPlus size={20}/>}
                            {isEdit ? "Editar Voluntário" : "Novo Voluntário"}
                        </h2>

                        {erro && <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 text-red-400 rounded-xl text-[10px] text-center font-bold uppercase">{erro}</div>}
                        {mensagemInfo && <div className="mb-4 p-3 bg-emerald-900/20 border border-emerald-500/50 text-emerald-400 rounded-xl text-[10px] text-center font-bold uppercase">{mensagemInfo}</div>}

                        {passo === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                <input className={inputStyle} name="cpf" placeholder="CPF" onChange={handleChange} value={formData.cpf} disabled={isEdit} />
                                <input className={inputStyle} name="nome" placeholder="Nome Completo" onChange={handleChange} value={formData.nome} />
                                <input className={inputStyle} name="whatsapp" placeholder="WhatsApp com DDD" onChange={handleChange} value={formData.whatsapp} />
                                <button onClick={() => validarCpfESeguir()} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 p-4 rounded-xl font-black uppercase flex justify-center items-center gap-2">
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : "Próximo"}
                                </button>
                            </div>
                        )}

                        {passo === 2 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <input className={inputStyle} name="cep" placeholder="CEP" onChange={handleChange} onBlur={buscarCep} value={formData.cep} />
                                    <input className={inputStyle} name="numero" placeholder="Número" onChange={handleChange} value={formData.numero} />
                                </div>
                                <input className={inputStyle} name="logradouro" placeholder="Endereço" onChange={handleChange} value={formData.logradouro} />
                                <input className={inputStyle} name="bairro" placeholder="Bairro" onChange={handleChange} value={formData.bairro} />
                                <div className="flex gap-2">
                                    <button onClick={() => setPasso(1)} className="w-1/2 bg-slate-800 p-4 rounded-xl font-bold uppercase text-xs">Voltar</button>
                                    <button onClick={() => setPasso(3)} className="w-1/2 bg-emerald-600 p-4 rounded-xl font-bold uppercase text-xs">Próximo</button>
                                </div>
                            </div>
                        )}

                        {passo === 3 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                <input className={inputStyle} name="email" type="email" placeholder="E-mail de Acesso" onChange={handleChange} value={formData.administrador.email} />
                                <div className="relative">
                                    <input className={`${inputStyle} font-mono`} name="senha" value={formData.administrador.senha} onChange={(e) => setFormData({...formData, administrador: {...formData.administrador, senha: e.target.value}})} placeholder={isEdit ? "Nova Senha (Opcional)" : "Senha"} />
                                    <button type="button" onClick={() => setFormData({...formData, administrador: {...formData.administrador, senha: gerarSenhaAleatoria()}})} className="absolute right-3 top-3 text-emerald-500"><RefreshCw size={18} /></button>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setPasso(2)} className="w-1/2 bg-slate-800 p-4 rounded-xl font-bold uppercase text-xs">Voltar</button>
                                    <button onClick={handleSubmit} disabled={loading} className="w-1/2 bg-emerald-600 p-4 rounded-xl font-black uppercase text-xs flex justify-center items-center gap-2">
                                        {loading ? <Loader2 className="animate-spin" size={18} /> : "Finalizar"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CadastroVoluntario;