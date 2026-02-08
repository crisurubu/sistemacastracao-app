import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const HistoricoTutor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tutor, setTutor] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`http://localhost:8080/api/tutores/${id}`)
            .then(res => {
                if (!res.ok) throw new Error("Tutor não encontrado");
                return res.json();
            })
            .then(data => {
                setTutor(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erro:", err);
                setLoading(false);
            });
    }, [id]);

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{height: '80vh'}}>
            <div className="spinner-border text-primary" role="status"></div>
            <span className="ms-3 fw-bold text-primary">Carregando Prontuário Master...</span>
        </div>
    );

    if (!tutor) return <div className="alert alert-danger m-5 shadow">⚠️ Erro crítico: Dados não localizados.</div>;

    return (
        <div className="container-fluid p-4 bg-light min-vh-100">
            {/* Header de Navegação */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <button className="btn btn-white shadow-sm border px-3" onClick={() => navigate(-1)}>
                    <i className="bi bi-arrow-left"></i> ← Voltar para Gestão
                </button>
                <span className="badge bg-dark px-3 py-2">ID DO SISTEMA: #{tutor.id}</span>
            </div>

            {/* CARD MASTER - DADOS DO TUTOR */}
            <div className="card shadow border-0 overflow-hidden mb-5">
                <div className="row g-0">
                    <div className="col-md-1 bg-primary d-flex align-items-center justify-content-center text-white">
                        <h1 className="display-4"><i className="bi bi-person-badge"></i></h1>
                    </div>
                    <div className="col-md-11">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <h2 className="fw-bold text-dark mb-0">{tutor.nome?.toUpperCase()}</h2>
                                    <p className="text-muted mb-0"><i className="bi bi-fingerprint"></i> CPF: {tutor.cpf}</p>
                                </div>
                                <div className="text-end">
                                    <span className="badge bg-success-subtle text-success border border-success px-3 mb-2">CADASTRO ATIVO</span>
                                    <br />
                                    <small className="text-muted">Última atualização: {new Date().toLocaleDateString()}</small>
                                </div>
                            </div>

                            <hr />

                            <div className="row">
                                <div className="col-md-4 mb-3">
                                    <h6 className="text-primary fw-bold small text-uppercase">📞 Contato Direto</h6>
                                    <p className="mb-1"><strong>WhatsApp:</strong> <span className="text-success">{tutor.whatsapp || 'Não informado'}</span></p>
                                    <p className="mb-0"><strong>E-mail:</strong> {tutor.email}</p>
                                </div>
                                <div className="col-md-8">
                                    <h6 className="text-danger fw-bold small text-uppercase">📍 Localização de Auditoria</h6>
                                    <p className="mb-0 fs-5">{tutor.endereco || "Endereço não consolidado"}</p>
                                    <small className="text-muted">{tutor.bairro} — {tutor.cidade} / SP</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SEÇÃO DOS ANIMAIS */}
            <div className="d-flex align-items-center mb-4">
                <div className="bg-info p-2 rounded-circle me-3 text-white">
                    <i className="bi bi-reception-4 fs-4"></i>
                </div>
                <h3 className="fw-bold text-dark mb-0">Patrimônio Animal Vinculado</h3>
                <div className="ms-auto">
                    <span className="badge rounded-pill bg-info px-4 py-2">{tutor.pets?.length || 0} Animais</span>
                </div>
            </div>

            <div className="row g-4">
                {tutor.pets && tutor.pets.length > 0 ? (
                    tutor.pets.map(pet => (
                        <div key={pet.id} className="col-xl-4 col-md-6">
                            <div className="card h-100 shadow-sm border-0 border-top border-info border-4">
                                <div className="card-body p-4">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h4 className="fw-bold text-info mb-0">{pet.nomeAnimal}</h4>
                                        <span className={`badge ${pet.sexo === 'Fêmea' ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'} px-3`}>
                                            {pet.sexo}
                                        </span>
                                    </div>

                                    {/* INFO BOX: ESPÉCIE E IDADE COM SEPARAÇÃO */}
                                    <div className="bg-light p-3 rounded mb-3 border">
                                        <div className="row text-center">
                                            <div className="col-6 border-end">
                                                <small className="text-muted d-block small">ESPÉCIE:</small>
                                                <span className="fw-bold">{pet.especie}</span>
                                            </div>
                                            <div className="col-6">
                                                <small className="text-muted d-block small">IDADE:</small>
                                                <span className="fw-bold">{pet.idadeAprox}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* LISTA DE STATUS COM DOIS-PONTOS */}
                                    <div className="list-group list-group-flush small mb-3">
                                        <div className="list-group-item d-flex justify-content-between bg-transparent px-0 border-bottom">
                                            <span>💉 Situação Vacinal:</span>
                                            <span className={pet.vacinado ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                                                {pet.vacinado ? 'EM DIA' : 'PENDENTE'}
                                            </span>
                                        </div>
                                        <div className="list-group-item d-flex justify-content-between bg-transparent px-0 border-bottom">
                                            <span>🔪 Histórico Cirúrgico:</span>
                                            <span className="fw-bold text-dark">{pet.operouAntes ? '⚠️ JÁ OPERADO' : '✅ APTO'}</span>
                                        </div>
                                    </div>

                                    {/* OBSERVAÇÕES MÉDICAS */}
                                    {pet.medicamentos && (
                                        <div className="p-3 bg-warning bg-opacity-10 border-start border-warning border-4 rounded-0">
                                            <small className="d-block text-warning-emphasis fw-bold mb-1">📋 OBSERVAÇÕES:</small>
                                            <p className="mb-0 small text-dark">{pet.medicamentos}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="card-footer bg-white border-0 p-3 pt-0">
                                    <button className="btn btn-sm btn-outline-info w-100 rounded-pill fw-bold">
                                        Visualizar Ficha Clínica
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12 text-center py-5">
                        <div className="card border-dashed p-5 bg-transparent">
                            <p className="text-muted mb-0">Nenhum animal vinculado a este histórico.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoricoTutor;