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
            <h2 className="!font-black !text-xl md:!text-2xl !animate-pulse uppercase !text-center !px-4">Sincronizando Histórico Clínico...</h2>
        </div>
    );

    return (
        <div className="!min-h-screen !bg-slate-950 !p-4 md:!p-6 !text-white">

            {/* HEADER DA ONG CORRIGIDO E RESPONSIVO */}
            <div className="!flex !flex-col md:!flex-row !justify-between !items-start md:!items-center !mb-8 !border-b !border-slate-800 !pb-4 !gap-4">
                <button
                    className="!bg-emerald-500 !hover:bg-emerald-600 !text-slate-950 !font-black !px-6 !py-2 !rounded-lg !transition-all !shadow-lg !cursor-pointer !w-full md:!w-auto uppercase !text-sm"
                    onClick={() => navigate("/admin/tutores")} 
                >
                    ← VOLTAR
                </button>
                <div className="!text-left md:!text-right !w-full">
                    <h4 className="!font-black !text-emerald-500 !m-0 !text-lg md:!text-xl uppercase italic">Sistema Castracao ONG</h4>
                    <small className="!text-slate-400 !font-bold">sistemacastracao@gmail.com</small>
                </div>
            </div>

            {/* CARD DO TUTOR - Ajustado grid para empilhar no mobile */}
            <div className="!bg-slate-900 !rounded-[1.5rem] md:!rounded-[2rem] !p-5 md:!p-8 !border !border-slate-800 !mb-8 !shadow-2xl">
                <div className="!flex !flex-col md:!grid md:!grid-cols-2 !gap-6 md:!gap-8">
                    <div>
                        <small className="!text-emerald-500 !font-black !uppercase !tracking-widest !text-[9px] md:!text-[10px]">Tutor Responsável</small>
                        <h1 className="!text-2xl md:!text-4xl !font-black !text-white !uppercase !mt-1 !mb-4 !leading-tight">{tutorInfo?.nome}</h1>
                        <div className="!flex !flex-wrap !gap-2 md:!gap-4 !text-[10px] md:!text-sm">
                            <span className="!bg-slate-800 !px-3 !py-1 !rounded-md !font-bold !text-slate-300">CPF: {tutorInfo?.cpf}</span>
                            <span className="!bg-slate-800 !px-3 !py-1 !rounded-md !font-bold !text-slate-300">WhatsApp: {tutorInfo?.whatsapp}</span>
                        </div>
                    </div>
                    <div className="md:!text-right !flex !flex-col !justify-end !items-start md:!items-end !border-t md:!border-t-0 !pt-4 md:!pt-0 !border-slate-800/50">
                        <button
                            onClick={() => gerarDossieAuditoriaTutor({ ...tutorInfo }, historico)}
                            className="!mb-4 !w-full md:!w-auto !bg-blue-600 !hover:bg-blue-500 !text-white !px-4 !py-3 md:!py-2 !rounded-xl !font-black !text-[10px] !uppercase !flex !items-center !justify-center !gap-2 !transition-all !shadow-lg !cursor-pointer"
                        >
                            <ClipboardList size={16} /> Gerar Dossiê de Auditoria
                        </button>
                        <p className="!text-slate-400 !font-bold !m-0 !text-sm">{tutorInfo?.endereco}</p>
                        <p className="!text-slate-500 !m-0 !text-xs md:!text-sm">{tutorInfo?.bairro} — {tutorInfo?.cidade}/SP</p>
                    </div>
                </div>
            </div>

            <h3 className="!mb-6 !font-black !text-white !border-l-4 !border-emerald-500 !pl-4 !text-xl md:!text-2xl !italic !uppercase">
                Prontuários e Auditoria
            </h3>

            <div className="!grid !grid-cols-1 lg:!grid-cols-2 !gap-6">
                {historico.map(item => (
                    <div key={item.cadastroId} className="!bg-white !rounded-2xl md:!rounded-3xl !overflow-hidden !border-4 !border-slate-900 !shadow-xl">

                        {/* STATUS - Texto menor no mobile para não quebrar */}
                        <div className={`!p-3 md:!p-4 !flex !justify-between !items-center !text-white !font-black ${item.realizado ? '!bg-emerald-600' : '!bg-amber-500'}`}>
                            <span className="!uppercase !tracking-tighter !text-[10px] md:!text-sm">#{item.codigoHash || 'SEM-HASH'}</span>
                            <span className="!text-[9px] md:!text-sm !text-right">{item.realizado ? '✓ PROCEDIMENTO FINALIZADO' : `⚠ ${item.statusProcesso}`}</span>
                        </div>

                        <div className="!p-5 md:!p-6 !text-slate-900">
                            <div className="!flex !justify-between !items-start !mb-6">
                                <div>
                                    <h2 className="!text-2xl md:!text-3xl !font-black !m-0 !leading-none">{item.petNome?.toUpperCase()}</h2>
                                    <small className="!font-bold !text-slate-400 !uppercase !text-[10px]">{item.petEspecie} • {item.petSexo} • {item.petRaca}</small>
                                </div>
                            </div>

                            {/* LINHA DO TEMPO - Fonte adaptável */}
                            <div className="!grid !grid-cols-3 !gap-1.5 md:!gap-2 !mb-6">
                                <div className="!bg-slate-50 !p-2 md:!p-3 !rounded-xl md:!rounded-2xl !border !border-slate-100 text-center">
                                    <small className="!text-slate-400 !font-black !text-[8px] md:!text-[9px] !block !uppercase">Cadastro</small>
                                    <span className="!font-bold !text-slate-700 !text-[10px] md:!text-sm">{formatarDataSimples(item.dataSolicitacao)}</span>
                                </div>
                                <div className="!bg-blue-50 !p-2 md:!p-3 !rounded-xl md:!rounded-2xl !border !border-blue-100 text-center">
                                    <small className="!text-blue-400 !font-black !text-[8px] md:!text-[9px] !block !uppercase">Agendado</small>
                                    <span className="!font-bold !text-blue-700 !text-[10px] md:!text-sm">{formatarDataSimples(item.dataHoraAgendamento) || "---"}</span>
                                </div>
                                <div className={`!p-2 md:!p-3 !rounded-xl md:!rounded-2xl !border text-center ${item.realizado ? '!bg-emerald-50 !border-emerald-100' : '!bg-slate-100 !border-slate-200'}`}>
                                    <small className={`${item.realizado ? '!text-emerald-500' : '!text-slate-400'} !font-black !text-[8px] md:!text-[9px] !block !uppercase`}>Castrado</small>
                                    <span className={`${item.realizado ? '!text-emerald-700' : '!text-slate-400'} !font-bold !text-[10px] md:!text-sm`}>
                                        {item.realizado ? formatarDataSimples(item.dataHoraAgendamento) : "Pendente"}
                                    </span>
                                </div>
                            </div>

                            {/* DADOS DA CLÍNICA */}
                            <div className="!flex !items-start !gap-3 md:!gap-4 !p-4 !bg-slate-900 !rounded-2xl !text-white !mb-4">
                                <MapPin className="!text-emerald-500 !mt-1 !flex-shrink-0" size={20} md={24} />
                                <div className="!flex-1">
                                    <small className="!text-slate-400 !font-black !text-[9px] !uppercase">Unidade de Atendimento</small>
                                    <p className="!m-0 !font-black !text-sm md:!text-base !text-emerald-400 !leading-tight">{item.clinicaNome || "AGUARDANDO TRIAGEM"}</p>
                                    {item.clinicaEndereco && (
                                        <p className="!m-0 !text-[10px] md:!text-[11px] !font-bold !text-slate-300 !leading-tight !mt-1">{item.clinicaEndereco}</p>
                                    )}
                                    {item.clinicaTelefone && (
                                        <p className="!m-0 !text-[10px] md:!text-[11px] !text-emerald-500 !font-bold !italic !mt-1">Tel: {item.clinicaTelefone}</p>
                                    )}
                                </div>
                            </div>

                            {/* RODAPÉ DO CARD - Empilhar botões no mobile */}
                            <div className="!flex !flex-col md:!flex-row !justify-between !items-start md:!items-center !mt-6 !pt-4 !border-t !border-slate-100 !gap-4">
                                <div className="!flex !flex-col">
                                    <small className="!font-bold !text-slate-400 !text-[9px] md:!text-[10px] !uppercase">Agendado por</small>
                                    <span className="!font-black !text-slate-700 !text-xs !uppercase">{item.agendadorNome || "SISTEMA"}</span>
                                </div>

                                {item.realizado && (
                                    <button
                                        onClick={() => gerarCertificadoConclusao({ ...item, tutorNome: tutorInfo.nome })}
                                        className="!flex !items-center !justify-center !gap-2 !bg-emerald-50 !text-emerald-600 !hover:bg-emerald-100 !px-4 !py-3 md:!py-2 !rounded-lg !w-full md:!w-auto !transition-all !font-black !text-[10px] !uppercase !cursor-pointer !border !border-emerald-100"
                                    >
                                        <FileText size={18} /> Ver Certificado
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

/**
 * RESUMO DO CÓDIGO (UPGRADE MOBILE):
 * 1. HEADER & CARD TUTOR: Agora usam flex-col no mobile. Botão "Voltar" e "Dossiê" ficam em largura total (w-full) para facilitar o clique com o polegar.
 * 2. TIPOGRAFIA: Reduzi tamanhos de fonte em telas pequenas (ex: !text-2xl virando !text-4xl no desktop) para evitar quebras de layout.
 * 3. LINHA DO TEMPO: Mantive as 3 colunas mas reduzi os paddings e bordas para caber perfeitamente na largura do celular.
 * 4. BOTÕES DE AÇÃO: Botão de certificado agora é w-full no mobile com fundo leve (emerald-50) para destacar a área de toque.
 * 5. PRESERVAÇÃO: Nenhuma funcionalidade de PDF, Auditoria ou busca de dados foi alterada.
 */