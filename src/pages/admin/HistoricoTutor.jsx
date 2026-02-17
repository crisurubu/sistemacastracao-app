import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../services/api"; 

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

    const formatarData = (dataISO) => {
        if (!dataISO) return "---";
        return new Date(dataISO).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    if (loading) return (
        <div className="!flex !items-center !justify-center !h-screen !bg-slate-950 !text-white">
            <h2 className="!font-black !text-2xl !animate-pulse">SINCRONIZANDO PRONTUÁRIOS...</h2>
        </div>
    );

    return (
        <div className="!min-h-screen !bg-slate-950 !p-6 !text-white">
            
            {/* HEADER SUPERIOR */}
            <div className="!flex !justify-between !items-center !mb-8 !border-b !border-slate-800 !pb-4">
                <button 
                    className="!bg-yellow-500 !hover:bg-yellow-600 !text-slate-950 !font-black !px-6 !py-2 !rounded-lg !transition-all !shadow-lg"
                    onClick={() => navigate(-1)}
                >
                    ← VOLTAR
                </button>
                <div className="!text-right">
                    <h4 className="!font-black !text-yellow-500 !m-0 !text-xl">Sistema Castracao ong</h4>
                    <small className="!text-slate-400 !font-bold">sistemacastracao@gmail.com</small>
                </div>
            </div>

            {/* CABEÇALHO DO TUTOR - DADOS COM SEPARAÇÃO E LABELS */}
            <div className="!bg-slate-900 !rounded-2xl !p-8 !border-2 !border-yellow-500 !mb-8 !shadow-2xl">
                <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-8">
                    <div className="!border-r-0 md:!border-r !border-slate-800 !pr-6">
                        <small className="!text-blue-400 !font-black !uppercase !tracking-widest !text-xs">Responsável pelo Registro</small>
                        <h1 className="!text-4xl !font-black !text-white !uppercase !mt-2 !mb-4 !leading-tight">
                            {tutorInfo?.nome || "Não identificado"}
                        </h1>
                        
                        <div className="!space-y-2 !text-slate-300">
                            <p className="!flex !items-center !gap-2 !m-0">
                                <span className="!font-bold !text-yellow-500">CPF:</span> {tutorInfo?.cpf || "---"}
                            </p>
                            <p className="!flex !items-center !gap-2 !m-0">
                                <span className="!font-bold !text-yellow-500">E-MAIL:</span> {tutorInfo?.email || "---"}
                            </p>
                        </div>
                    </div>

                    <div className="md:!text-right !flex !flex-col !justify-center">
                        <h2 className="!text-3xl !font-black !text-emerald-400 !mb-2 !m-0">
                            {tutorInfo?.whatsapp || "---"}
                        </h2>
                        <p className="!text-white !font-bold !text-lg !leading-snug !m-0">
                            {tutorInfo?.endereco}
                        </p>
                        <p className="!text-slate-400 !font-medium !mt-1 !m-0">
                            {tutorInfo?.bairro} — {tutorInfo?.cidade}/SP
                        </p>
                    </div>
                </div>
            </div>

            <h3 className="!mb-6 !font-black !text-white !border-l-4 !border-yellow-500 !pl-4 !text-2xl">
                HISTÓRICO DE VIDA / AUDITORIA
            </h3>

            {/* LISTAGEM DE CARDS */}
            <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
                {historico.length > 0 ? (
                    historico.map(item => (
                        <div key={item.cadastroId} className="!bg-white !rounded-2xl !overflow-hidden !border-4 !border-slate-900 !shadow-[8px_8px_0px_rgba(30,41,59,1)]">
                            
                            {/* STATUS BAR */}
                            <div className={`!p-4 !text-center !font-black !text-white !text-lg ${item.realizado ? '!bg-emerald-600' : '!bg-blue-600'}`}>
                                {item.realizado ? `✅ CASTRADO - HASH: ${item.codigoHash}` : `⚠️ STATUS: ${item.statusProcesso}`}
                            </div>

                            <div className="!p-6 !text-slate-900">
                                <div className="!flex !justify-between !items-center !mb-4">
                                    <h2 className="!text-3xl !font-black !m-0 !tracking-tighter">{item.petNome?.toUpperCase()}</h2>
                                    <span className="!bg-slate-900 !text-white !px-4 !py-1 !rounded-full !font-bold !text-sm">
                                        {item.petSexo}
                                    </span>
                                </div>

                                {/* BADGES CLÍNICOS COM ESPAÇAMENTO REAL */}
                                <div className="!flex !items-center !gap-3 !mb-5">
                                    <span className={`!px-3 !py-1 !rounded-md !text-xs !font-black ${item.petVacinado ? '!bg-emerald-100 !text-emerald-700' : '!bg-slate-100 !text-slate-500'}`}>
                                        {item.petVacinado ? '✓ VACINADO' : '✗ NÃO VACINADO'}
                                    </span>
                                    <span className="!text-slate-300 !font-bold">|</span>
                                    <span className={`!px-3 !py-1 !rounded-md !text-xs !font-black ${item.petOperouAntes ? '!bg-red-100 !text-red-700' : '!bg-blue-100 !text-blue-700'}`}>
                                        {item.petOperouAntes ? '⚠ JÁ OPEROU ANTES' : '● NUNCA OPEROU'}
                                    </span>
                                </div>

                                {/* DATA DE CONCLUSÃO */}
                                <div className="!bg-slate-50 !p-3 !rounded-xl !border-2 !border-slate-100 !mb-4 !flex !justify-between !items-center">
                                    <span className="!font-bold !text-slate-500 !text-xs !uppercase">{item.realizado ? 'Concluído em:' : 'Solicitado em:'}</span>
                                    <span className="!font-black !text-blue-600 !text-lg">
                                        {formatarData(item.realizado ? item.dataHoraAgendamento : item.dataSolicitacao)}
                                    </span>
                                </div>

                                {/* CLÍNICA RESPONSÁVEL */}
                                <div className="!p-4 !bg-blue-50/50 !rounded-xl !border !border-dashed !border-blue-300 !mb-4">
                                    <small className="!text-blue-600 !font-black !uppercase !text-[10px] !block !mb-1">🏥 Unidade de Atendimento</small>
                                    <h6 className="!font-black !text-slate-800 !m-0 !text-base">{item.clinicaNome || "Aguardando Clínica"}</h6>
                                    <div className="!grid !grid-cols-2 !gap-2 !mt-2 !text-[11px] !font-bold !text-slate-600">
                                        <div><span className="!text-slate-400">CRMV:</span> {item.clinicaCrmv || "---"}</div>
                                        <div><span className="!text-slate-400">CNPJ:</span> {item.clinicaCnpj || "---"}</div>
                                        <div className="!col-span-2 !mt-1 !text-slate-800">
                                            📞 {item.clinicaTelefone || "Sem telefone"}
                                        </div>
                                    </div>
                                </div>

                                {/* NOTAS DE ALERTA */}
                                {item.petMedicamentos && (
                                    <div className="!p-3 !bg-red-50 !border-l-4 !border-red-500 !mb-4">
                                        <small className="!text-red-600 !font-black !block">🚨 NOTAS CLÍNICAS / ALERTA:</small>
                                        <p className="!m-0 !text-xs !font-bold !text-red-800 !mt-1 leading-relaxed">
                                            {item.petMedicamentos}
                                        </p>
                                    </div>
                                )}

                                {/* RODAPÉ DO CARD */}
                                <div className="!pt-3 !border-t !border-slate-100 !text-right">
                                    <small className="!text-slate-400 !font-bold !italic">
                                        Registrado por: {item.agendadorNome}
                                    </small>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="!col-span-2 !text-center !py-20">
                        <h4 className="!text-slate-500 !font-bold">Nenhum histórico encontrado para este CPF.</h4>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoricoTutor;