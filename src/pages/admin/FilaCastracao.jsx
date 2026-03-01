import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Calendar, MessageCircle, ArrowRight, User, Clock, X, Loader2, CheckCircle2, Hash, Zap, Fingerprint } from 'lucide-react';
import api from '../../services/api';
import { enviarWhatsApp } from '../../services/whatsappService';

const FilaCastracao = () => {
    const [fila, setFila] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [dadosAgendamento, setDadosAgendamento] = useState({ data: '', hora: '', clinicaId: '' });
    const [submitting, setSubmitting] = useState(false);
    const [clinicas, setClinicas] = useState([]);
    const [filtro, setFiltro] = useState("");
    const [step, setStep] = useState(1);
    const [infoPosAgendamento, setInfoPosAgendamento] = useState(null);

    useEffect(() => { fetchFila(); }, []);

    const fetchFila = async () => {
        try {
            const response = await api.get('/admin/fila-espera');
            setFila(Array.isArray(response.data) ? response.data : []);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const carregarClinicas = async () => {
        try {
            const response = await api.get('/admin/clinicas');
            setClinicas(response.data.filter(c => c.administrador?.ativo));
        } catch (error) { console.error(error); }
    };

    const handleAbrirAgendamento = (item) => {
        setSelectedItem(item);
        setDadosAgendamento({ data: '', hora: '', clinicaId: '' });
        setStep(1);
        setShowModal(true);
        if (clinicas.length === 0) carregarClinicas();
    };

    const confirmarAgendamento = async () => {
        const { data, hora, clinicaId } = dadosAgendamento;
        if (!data || !hora || !clinicaId) return alert("Preencha todos os campos!");
        setSubmitting(true);
        try {
            const response = await api.post('/admin/agendamentos', { cadastroId: selectedItem.id, dataHora: `${data}T${hora}`, clinicaId });
            const { codigoHash, local } = response.data;
            const [ano, mes, dia] = data.split('-');
            setInfoPosAgendamento({
                whatsapp: selectedItem.tutor?.whatsapp,
                dados: { tutor: selectedItem.tutor?.nome, pet: selectedItem.pet?.nomeAnimal, data: `${dia}/${mes}/${ano}`, hora: hora, local: local, hash: codigoHash }
            });
            setStep(2);
        } catch (error) { alert(error.response?.data?.message || "Erro ao agendar."); } finally { setSubmitting(false); }
    };

    const concluirEFechar = () => {
        setFila(prev => prev.filter(f => f.id !== selectedItem.id));
        setShowModal(false);
    };

    const filaFiltrada = useMemo(() => {
        const termo = filtro.toLowerCase();
        return fila.filter(item => 
            (item.pet?.nomeAnimal || "").toLowerCase().includes(termo) || 
            (item.tutor?.nome || "").toLowerCase().includes(termo) ||
            (item.tutor?.cpf || "").includes(termo)
        );
    }, [fila, filtro]);

    // COMPONENTE DE ARRASTAR
    const SwipeButton = ({ onComplete, item }) => {
        const [isDragging, setIsDragging] = useState(false);
        const [startX, setStartX] = useState(0);
        const [translateX, setTranslateX] = useState(0);
        const containerRef = useRef(null);

        const handleStart = (e) => {
            setIsDragging(true);
            setStartX(e.type === 'mousedown' ? e.pageX : e.touches[0].pageX);
        };

        const handleMove = (e) => {
            if (!isDragging) return;
            const currentX = e.type === 'mousemove' ? e.pageX : e.touches[0].pageX;
            const diff = currentX - startX;
            const maxSlide = containerRef.current.offsetWidth - 72; 
            if (diff >= 0 && diff <= maxSlide) setTranslateX(diff);
            if (diff > maxSlide * 0.92) {
                setIsDragging(false);
                setTranslateX(0);
                onComplete(item);
            }
        };

        return (
            <div 
                ref={containerRef}
                className="relative w-full lg:w-64 h-20 lg:h-full bg-slate-900 overflow-hidden lg:rounded-r-2xl border-t lg:border-t-0 lg:border-l border-slate-800 flex items-center p-2"
                onMouseMove={handleMove} onMouseUp={() => {setIsDragging(false); setTranslateX(0)}} onMouseLeave={() => {setIsDragging(false); setTranslateX(0)}}
                onTouchMove={handleMove} onTouchEnd={() => {setIsDragging(false); setTranslateX(0)}}
            >
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] bg-gradient-to-r from-slate-500 via-white to-slate-500 bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer">
                        ARRASTE PARA AGENDAR
                    </span>
                </div>
                <div 
                    onMouseDown={handleStart} onTouchStart={handleStart}
                    style={{ transform: `translateX(${translateX}px)` }}
                    className={`z-10 w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center text-white cursor-grab active:cursor-grabbing shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-transform ${!isDragging && 'duration-300'}`}
                >
                    <ArrowRight size={28} strokeWidth={3} />
                </div>
                <style dangerouslySetInnerHTML={{ __html: `@keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } } .animate-shimmer { animation: shimmer 2s infinite linear; }`}} />
            </div>
        );
    };

    if (loading) return <div className="flex h-screen items-center justify-center bg-[#020617] font-black italic text-blue-500 text-3xl animate-pulse">SINCRO_FILA_V4...</div>;

    return (
        <div className="p-6 bg-[#020617] min-h-screen space-y-8 text-slate-200">
            {/* Header */}
            <div className="flex flex-col gap-6 border-b-2 border-blue-600 pb-8 relative">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-blue-500 font-black tracking-[0.4em] text-[10px]">
                        <Zap size={12} fill="currentColor" /> SISTEMA DE CONTROLE MESTRE
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-white italic uppercase tracking-tighter leading-none">
                        FILA <span className="text-blue-600">MESTRA</span>
                    </h1>
                </div>
                <div className="relative w-full max-w-2xl">
                    <div className="absolute -inset-0.5 bg-blue-600 rounded-xl blur opacity-20"></div>
                    <div className="relative flex items-center bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
                        <div className="pl-4 text-slate-500"><Search size={20} /></div>
                        <input className="w-full bg-transparent p-4 text-base font-bold text-white placeholder-slate-700 outline-none uppercase" placeholder="BUSCAR POR NOME, ANIMAL OU CPF..." value={filtro} onChange={(e) => setFiltro(e.target.value)} />
                    </div>
                </div>
            </div>

            {/* Grid de Cards */}
            <div className="grid grid-cols-1 gap-6">
                {filaFiltrada.map((item) => (
                    <div key={item.id} className="group relative flex flex-col lg:flex-row bg-[#0a0f1e] border-l-[6px] border-blue-600 rounded-r-3xl shadow-xl transition-all duration-300 hover:bg-[#0f172a] border-y border-r border-slate-800/50 overflow-hidden">
                        
                        {/* DATA DE CADASTRO (Canto Superior Esquerdo) */}
                        <div className="absolute top-0 left-0 bg-blue-600 px-3 py-1 rounded-br-xl z-20 flex items-center gap-2 shadow-lg">
                            <Clock size={10} className="text-white" />
                            <span className="text-[10px] font-black text-white uppercase tracking-tighter">
                                Cadastrado em: {new Date(item.dataSolicitacao).toLocaleDateString()}
                            </span>
                        </div>

                        {/* Seção do Animal */}
                        <div className="p-8 pt-10 lg:w-1/3 border-b lg:border-b-0 lg:border-r border-slate-800/50">
                            <div className="flex gap-2 mb-3 mt-2">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${item.pet?.sexo === 'Macho' ? 'bg-blue-600 text-white' : 'bg-pink-600 text-white'}`}>{item.pet?.sexo}</span>
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-800 text-slate-400">{item.pet?.especie}</span>
                            </div>
                            <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-2 group-hover:text-blue-500 transition-colors">{item.pet?.nomeAnimal}</h3>
                            <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                                <Hash size={12} className="text-blue-600" /> {item.pet?.raca || 'SEM RAÇA DEFINIDA'}
                            </div>
                        </div>

                        {/* Seção do Tutor (Com CPF agora) */}
                        <div className="p-8 lg:w-1/3 flex flex-col justify-center gap-4">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.3em]">Responsável</p>
                                <h4 className="text-xl font-black text-white uppercase leading-tight">{item.tutor?.nome}</h4>
                                <div className="flex items-center gap-2 text-slate-500 font-mono text-xs">
                                    <Fingerprint size={14} className="text-slate-700" />
                                    <span>CPF: {item.tutor?.cpf || 'N/A'}</span>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <button onClick={() => window.open(`https://wa.me/55${item.tutor?.whatsapp?.replace(/\D/g, '')}`, '_blank')} className="bg-green-600/10 hover:bg-green-600 text-green-500 hover:text-white px-4 py-2 rounded-xl flex items-center gap-2 font-black text-[10px] uppercase transition-all">
                                    <MessageCircle size={14} /> WhatsApp
                                </button>
                            </div>
                        </div>

                        {/* Swipe de Ação */}
                        <div className="lg:ml-auto">
                            <SwipeButton onComplete={handleAbrirAgendamento} item={item} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0f172a] border-t-8 border-blue-600 w-full max-w-lg rounded-b-3xl p-8 shadow-2xl">
                        {step === 1 ? (
                            <div className="space-y-8">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Agendamento</h2>
                                        <p className="text-blue-500 font-bold text-xs uppercase tracking-widest">{selectedItem?.pet?.nomeAnimal} <span className="text-slate-700 mx-1">/</span> {selectedItem?.tutor?.nome}</p>
                                    </div>
                                    <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Data</label>
                                        <input type="date" className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white text-sm font-bold outline-none focus:border-blue-600 transition-all" value={dadosAgendamento.data} onChange={(e) => setDadosAgendamento({...dadosAgendamento, data: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Hora</label>
                                        <input type="time" className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white text-sm font-bold outline-none focus:border-blue-600 transition-all" value={dadosAgendamento.hora} onChange={(e) => setDadosAgendamento({...dadosAgendamento, hora: e.target.value})} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Clínica</label>
                                    <select className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white text-sm font-bold outline-none focus:border-blue-600 transition-all appearance-none cursor-pointer uppercase" value={dadosAgendamento.clinicaId} onChange={(e) => setDadosAgendamento({...dadosAgendamento, clinicaId: e.target.value})}>
                                        <option value="">SELECIONE...</option>
                                        {clinicas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                                    </select>
                                </div>
                                <button onClick={confirmarAgendamento} disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-xl text-lg font-black italic tracking-tighter transition-all flex items-center justify-center gap-3">
                                    {submitting ? <Loader2 className="animate-spin" size={20} /> : "GERAR ORDEM"}
                                </button>
                            </div>
                        ) : (
                            <div className="text-center space-y-6 py-4">
                                <div className="flex justify-center"><div className="h-20 w-20 bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg animate-bounce"><CheckCircle2 size={40} /></div></div>
                                <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Sucesso</h2>
                                <div className="flex flex-col gap-3">
                                    <button onClick={() => enviarWhatsApp(infoPosAgendamento.whatsapp, 'AGENDADO', infoPosAgendamento.dados)} className="w-full bg-[#25d366] hover:bg-[#1fb355] text-white p-5 rounded-2xl flex items-center justify-center gap-4 font-black text-xl shadow-xl transition-all active:scale-95 group">
                                        <MessageCircle size={24} /> NOTIFICAR
                                    </button>
                                    <button onClick={concluirEFechar} className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em] hover:text-white transition-all pt-2">Fechar Painel</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilaCastracao;

/**
 * RESUMO DO CÓDIGO (V9 - ESTRUTURA REORGANIZADA):
 * - Destaque Temporal: A data de cadastro agora é um selo azul no canto superior esquerdo do card (`absolute top-0 left-0`).
 * - Dados Completos: CPF do tutor reintroduzido abaixo do nome com ícone de digital para facilitar conferência.
 * - UX de Swipe: Sistema de deslizar para agendar integrado com animação de brilho (shimmer) ultra visível.
 * - Organização Visual: Espaçamento ajustado para acomodar o selo superior sem sobrepor o nome do animal.
 */