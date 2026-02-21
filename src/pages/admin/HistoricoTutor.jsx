import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { FileText, MapPin, ClipboardList } from 'lucide-react';
import { gerarCertificadoConclusao, gerarDossieAuditoriaTutor } from "../../utils/GeradorPDF";

const HistoricoTutor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [historico, setHistorico] = useState([]);
    const [tutorInfo, setTutorInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.get(`/cadastros/tutor/${id}`)
            .then(response => {
                const data = response.data;
                if (data && data.length > 0) {
                    setTutorInfo({
                        nome: data[0].tutorNome,
                        cpf: data[0].tutorCpf,
                        whatsapp: data[0].tutorWhatsapp,
                        endereco: data[0].tutorEnderecoCompleto,
                        bairro: data[0].tutorBairro,
                        cidade: data[0].tutorCidade,
                        email: data[0].tutorEmail
                    });
                    setHistorico(data);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    const formatarDataSimples = (dataISO) => {
        if (!dataISO) return null;
        const [data] = dataISO.split('T');
        return data.split('-').reverse().join('/');
    };

    if (loading) return (
        <div className="!flex !items-center !justify-center !h-screen !bg-slate-950 !text-white">
            <h2 className="!font-black !text-2xl !animate-pulse uppercase">Sincronizando Histórico Clínico...</h2>
        </div>
    );

    return (
        <div className="!min-h-screen !bg-slate-950 !p-6 !text-white">

            {/* HEADER DA ONG */}
            <div className="!flex !justify-between !items-center !mb-8 !border-b !border-slate-800 !pb-4">
                <button
                    className="!bg-emerald-500 !hover:bg-emerald-600 !text-slate-950 !font-black !px-6 !py-2 !rounded-lg !transition-all !shadow-lg !cursor-pointer"
                    onClick={() => navigate(-1)}
                >
                    ← VOLTAR
                </button>
                <div className="!text-right">
                    <h4 className="!font-black !text-emerald-500 !m-0 !text-xl uppercase italic">Sistema Castracao ONG</h4>
                    <small className="!text-slate-400 !font-bold">sistemacastracao@gmail.com</small>
                </div>
            </div>

            {/* CARD DO TUTOR */}
            <div className="!bg-slate-900 !rounded-[2rem] !p-8 !border !border-slate-800 !mb-8 !shadow-2xl">
                <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-8">
                    <div>
                        <small className="!text-emerald-500 !font-black !uppercase !tracking-widest !text-[10px]">Tutor Responsável</small>
                        <h1 className="!text-4xl !font-black !text-white !uppercase !mt-1 !mb-4">{tutorInfo?.nome}</h1>
                        <div className="!flex !gap-4 !text-sm">
                            <span className="!bg-slate-800 !px-3 !py-1 !rounded-md !font-bold !text-slate-300">CPF: {tutorInfo?.cpf}</span>
                            <span className="!bg-slate-800 !px-3 !py-1 !rounded-md !font-bold !text-slate-300">WhatsApp: {tutorInfo?.whatsapp}</span>
                        </div>
                    </div>
                    <div className="md:!text-right !flex !flex-col !justify-end !items-end">
                        <button
                            onClick={() => gerarDossieAuditoriaTutor({ ...tutorInfo }, historico)}
                            className="!mb-4 !bg-blue-600 !hover:bg-blue-500 !text-white !px-4 !py-2 !rounded-xl !font-black !text-[10px] !uppercase !flex !items-center !gap-2 !transition-all !shadow-lg !cursor-pointer"
                        >
                            <ClipboardList size={16} /> Gerar Dossiê de Auditoria
                        </button>
                        <p className="!text-slate-400 !font-bold !m-0">{tutorInfo?.endereco}</p>
                        <p className="!text-slate-500 !m-0 !text-sm">{tutorInfo?.bairro} — {tutorInfo?.cidade}/SP</p>
                    </div>
                </div>
            </div>

            <h3 className="!mb-6 !font-black !text-white !border-l-4 !border-emerald-500 !pl-4 !text-2xl !italic !uppercase">
                Prontuários e Auditoria
            </h3>

            <div className="!grid !grid-cols-1 lg:!grid-cols-2 !gap-6">
                {historico.map(item => (
                    <div key={item.cadastroId} className="!bg-white !rounded-3xl !overflow-hidden !border-4 !border-slate-900 !shadow-xl">

                        {/* STATUS */}
                        <div className={`!p-4 !flex !justify-between !items-center !text-white !font-black ${item.realizado ? '!bg-emerald-600' : '!bg-amber-500'}`}>
                            <span className="!uppercase !tracking-tighter">#{item.codigoHash || 'SEM-HASH'}</span>
                            <span className="!text-sm">{item.realizado ? '✓ PROCEDIMENTO FINALIZADO' : `⚠ ${item.statusProcesso}`}</span>
                        </div>

                        <div className="!p-6 !text-slate-900">
                            <div className="!flex !justify-between !items-start !mb-6">
                                <div>
                                    <h2 className="!text-3xl !font-black !m-0 !leading-none">{item.petNome?.toUpperCase()}</h2>
                                    <small className="!font-bold !text-slate-400 !uppercase">{item.petEspecie} • {item.petSexo} • {item.petRaca}</small>
                                </div>
                            </div>

                            {/* LINHA DO TEMPO SIMPLIFICADA */}
                            <div className="!grid !grid-cols-3 !gap-2 !mb-6">
                                <div className="!bg-slate-50 !p-3 !rounded-2xl !border !border-slate-100 text-center">
                                    <small className="!text-slate-400 !font-black !text-[9px] !block !uppercase">Cadastro</small>
                                    <span className="!font-bold !text-slate-700 !text-sm">{formatarDataSimples(item.dataSolicitacao)}</span>
                                </div>
                                <div className="!bg-blue-50 !p-3 !rounded-2xl !border !border-blue-100 text-center">
                                    <small className="!text-blue-400 !font-black !text-[9px] !block !uppercase">Agendado</small>
                                    <span className="!font-bold !text-blue-700 !text-sm">{formatarDataSimples(item.dataHoraAgendamento) || "---"}</span>
                                </div>
                                <div className={`!p-3 !rounded-2xl !border text-center ${item.realizado ? '!bg-emerald-50 !border-emerald-100' : '!bg-slate-100 !border-slate-200'}`}>
                                    <small className={`${item.realizado ? '!text-emerald-500' : '!text-slate-400'} !font-black !text-[9px] !block !uppercase`}>Castrado</small>
                                    <span className={`${item.realizado ? '!text-emerald-700' : '!text-slate-400'} !font-bold !text-sm`}>
                                        {item.realizado ? formatarDataSimples(item.dataHoraAgendamento) : "Pendente"}
                                    </span>
                                </div>
                            </div>

                            {/* DADOS DA CLÍNICA (FOCO TOTAL AQUI) */}
                            <div className="!flex !items-start !gap-4 !p-4 !bg-slate-900 !rounded-2xl !text-white !mb-4">
                                <MapPin className="!text-emerald-500 !mt-1" size={24} />
                                <div className="!flex-1">
                                    <small className="!text-slate-400 !font-black !text-[9px] !uppercase">Unidade de Atendimento</small>
                                    <p className="!m-0 !font-black !text-base !text-emerald-400">{item.clinicaNome || "AGUARDANDO TRIAGEM"}</p>
                                    {item.clinicaEndereco && (
                                        <p className="!m-0 !text-[11px] !font-bold !text-slate-300 !leading-tight !mt-1">{item.clinicaEndereco}</p>
                                    )}
                                    {item.clinicaTelefone && (
                                        <p className="!m-0 !text-[11px] !text-emerald-500 !font-bold !italic !mt-1">WhatsApp/Tel: {item.clinicaTelefone}</p>
                                    )}
                                </div>
                            </div>

                            {/* RODAPÉ DO CARD */}
                            <div className="!flex !justify-between !items-center !mt-6 !pt-4 !border-t !border-slate-100">
                                <div className="!flex !flex-col">
                                    <small className="!font-bold !text-slate-400 !text-[10px] !uppercase">Responsável pelo Agendamento</small>
                                    <span className="!font-black !text-slate-700 !text-xs !uppercase">{item.agendadorNome || "SISTEMA"}</span>
                                </div>

                                {item.realizado && (
                                    <button
                                        onClick={() => gerarCertificadoConclusao({ ...item, tutorNome: tutorInfo.nome })}
                                        className="!flex !items-center !gap-1 !text-emerald-600 !hover:text-emerald-800 !transition-all !font-black !text-[10px] !uppercase !cursor-pointer"
                                    >
                                        <FileText size={20} /> Certificado
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HistoricoTutor;

// --- RESUMO DO CÓDIGO ---
/**
 * 1. CLÍNICA: Dados centralizados no box !bg-slate-900 com Nome (Emerald), Endereço (Slate-300) e Telefone (Emerald).
 * 2. SIMPLIFICAÇÃO: Removida a lógica de CPF do voluntário para evitar erros e lentidão no desenvolvimento.
 * 3. IDENTIDADE: Mantida a estrutura visual da ONG com foco na informação útil de onde o pet será/foi atendido.
 * 4. NAVEGAÇÃO: Botão voltar e dossiê geral operando normalmente.
 */