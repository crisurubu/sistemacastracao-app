import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// --- CONFIGURAÇÃO DE CORES GLOBAIS (Para manter o padrão) ---

const AZUL_CLARO = [214, 234, 248];
const VERDE_SUCESSO = [16, 185, 129];
const CINZA_TEXTO = [60, 60, 60];
// Definição de cores para manter o padrão visual da ONG
const AZUL_ESCURO = [31, 41, 55]; // Slate 900
const AZUL_MEDIO = [40, 116, 166];

// 1. GUIA DE ENCAMINHAMENTO (O que você já tem)
export const gerarGuiaCastracao = (agendamento) => {
    const doc = new jsPDF();
    const { cadastro, codigoHash, dataHora, local, hash } = agendamento;
    const { tutor, pet } = cadastro;
    const hashFinal = codigoHash || hash;

    doc.setFillColor(...AZUL_CLARO);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...AZUL_ESCURO);
    doc.text("PRONTUÁRIO DE ENCAMINHAMENTO", 105, 15, { align: "center" });
    doc.setFontSize(10);
    doc.text("SISTEMA CASTRACAO ONG - CONTROLE DE ZOONOSES", 105, 22, { align: "center" });
    doc.setFontSize(11);
    doc.setTextColor(200, 0, 0);
    doc.text(`CÓDIGO DE VALIDAÇÃO: ${hashFinal}`, 105, 30, { align: "center" });

    autoTable(doc, {
        startY: 40,
        head: [['DADOS DO RESPONSÁVEL (TUTOR)']],
        body: [
            [`NOME: ${tutor.nome.toUpperCase()}`],
            [`CPF: ${tutor.cpf} `],
            [`ENDEREÇO: ${tutor.endereco}`], 
            [`TELEFONE: ${tutor.whatsapp || tutor.telefone || 'NÃO INFORMADO'}  |  E-MAIL: ${tutor.email}`]
        ],
        theme: 'grid',
        headStyles: { fillColor: AZUL_ESCURO },
        styles: { fontSize: 9, cellPadding: 2 }
    });

    autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 5,
        head: [['PRONTUÁRIO CLÍNICO DO ANIMAL']],
        body: [
            [`NOME: ${pet.nomeAnimal.toUpperCase()}  |  ESPÉCIE: ${pet.especie}`],
            [`SEXO: ${pet.sexo || '---'}  |  IDADE APROX.: ${pet.idadeAprox || '---'}`],
            [`VACINADO: ${pet.vacinado ? 'SIM' : 'NÃO'}  |  JÁ OPEROU ANTES: ${pet.operouAntes ? 'SIM' : 'NÃO'}`],
            [`MEDICAMENTOS EM USO: ${pet.medicamentos || 'NENHUM INFORMADO'}`]
        ],
        theme: 'grid',
        headStyles: { fillColor: [40, 116, 166] },
        styles: { fontSize: 9, cellPadding: 2 }
    });

    autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 5,
        head: [['INFORMAÇÕES DA CASTRAÇÃO']],
        body: [
            [`DATA E HORA: ${dataHora ? new Date(dataHora).toLocaleString('pt-BR') : 'A DEFINIR'}`],
            [`LOCAL: ${local || 'CLÍNICA PARCEIRA'}`]
        ],
        theme: 'grid',
        headStyles: { fillColor: [93, 173, 226] },
        styles: { fontSize: 9 }
    });

    const finalY = doc.lastAutoTable.finalY + 25;
    doc.setDrawColor(0);
    doc.line(20, finalY, 90, finalY); 
    doc.setFontSize(8);
    doc.setTextColor(...CINZA_TEXTO);
    doc.text("ASSINATURA DO TUTOR / RESPONSÁVEL", 30, finalY + 5);
    doc.line(120, finalY, 190, finalY);
    doc.text("ASSINATURA E CARIMBO DO VETERINÁRIO", 125, finalY + 5);

    doc.setFillColor(...AZUL_CLARO);
    doc.rect(0, 280, 210, 17, 'F');
    doc.setFontSize(8);
    doc.setTextColor(...AZUL_ESCURO);
    doc.text("Este documento é obrigatório para a realização do procedimento.", 105, 287, { align: "center" });
    doc.text("Dúvidas: sistemacastracao@gmail.com", 105, 292, { align: "center" });

    doc.save(`Prontuario_${pet.nomeAnimal}_${hashFinal}.pdf`);
};

// ... (mantenha o resto igual)


// --- FUNÇÃO AUXILIAR PARA CRIAR UM SELO DE AUTENTICIDADE ---
const desenharSeloCertificado = (doc, x, y) => {
    doc.setDrawColor(...VERDE_SUCESSO);
    doc.setFillColor(...VERDE_SUCESSO);
    doc.circle(x, y, 15, 'D'); // Círculo externo
    doc.circle(x, y, 13, 'FD'); // Círculo interno preenchido
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text("ORIGINAL", x, y - 2, { align: "center" });
    doc.text("VALIDADO", x, y + 3, { align: "center" });
};

// 2. CERTIFICADO DE CONCLUSÃO (DESIGN PREMIUM)
export const gerarCertificadoConclusao = (item) => {
    const doc = new jsPDF('l', 'mm', 'a4'); // Paisagem para parecer certificado
    const largura = 297;
    const altura = 210;

    const nomeAnimal = (item.petNome || item.animal || "Animal").toUpperCase();
    const nomeTutor = (item.tutorNome || item.tutor || "Tutor").toUpperCase();
    const hash = item.codigoHash || item.hash || "---";

    // Borda Dupla Elegante
    doc.setDrawColor(...VERDE_SUCESSO);
    doc.setLineWidth(1);
    doc.rect(5, 5, largura - 10, altura - 10);
    doc.setLineWidth(0.2);
    doc.rect(7, 7, largura - 14, altura - 14);

    // Fundo do Título
    doc.setFillColor(...AZUL_ESCURO);
    doc.rect(7, 7, largura - 14, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(30);
    doc.setFont("helvetica", "bold");
    doc.text("CERTIFICADO DE CASTRAÇÃO E BEM-ESTAR", largura / 2, 28, { align: "center" });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "italic");
    doc.text("SISTEMA CASTRACAO ONG - REGISTRO OFICIAL DE CONTROLE DE ZOONOSES", largura / 2, 38, { align: "center" });

    // Corpo do Certificado
    doc.setTextColor(...CINZA_TEXTO);
    doc.setFontSize(18);
    doc.setFont("helvetica", "normal");
    doc.text("Certificamos para os devidos fins que o animal de estimação", largura / 2, 70, { align: "center" });
    
    doc.setTextColor(...AZUL_ESCURO);
    doc.setFontSize(35);
    doc.setFont("helvetica", "bold");
    doc.text(nomeAnimal, largura / 2, 90, { align: "center" });

    doc.setTextColor(...CINZA_TEXTO);
    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    doc.text(`sob responsabilidade do tutor(a) ${nomeTutor},`, largura / 2, 105, { align: "center" });
    doc.text("passou pelo procedimento de esterilização cirúrgica com sucesso.", largura / 2, 115, { align: "center" });

    // Detalhes Técnicos em Grid
    autoTable(doc, {
        startY: 125,
        margin: { left: 50, right: 50 },
        body: [
            ["ESPÉCIE/RAÇA:", `${item.petEspecie || ''} / ${item.petRaca || ''}`],
            ["DATA DO PROCEDIMENTO:", new Date(item.dataHoraAgendamento).toLocaleDateString('pt-BR')],
            ["CLÍNICA:", (item.clinicaNome || "CLÍNICA PARCEIRA").toUpperCase()],
            ["HASH DE AUTENTICIDADE:", hash]
        ],
        theme: 'plain',
        styles: { fontSize: 10, halign: 'center' },
        columnStyles: { 0: { fontStyle: 'bold' } }
    });

    // Selo e Assinaturas
    desenharSeloCertificado(doc, largura / 2, 175);

    doc.setDrawColor(...CINZA_TEXTO);
    doc.line(40, 185, 120, 185); // Assinatura ONG
    doc.line(177, 185, 257, 185); // Assinatura Clínica

    doc.setFontSize(8);
    doc.text("SISTEMA CASTRACAO ONG", 80, 190, { align: "center" });
    doc.text("RESPONSÁVEL TÉCNICO / CLÍNICA", 217, 190, { align: "center" });

    doc.save(`Certificado_${nomeAnimal}.pdf`);
    
};



export const gerarDossieAuditoriaTutor = (tutorInfo, historico) => {
    const doc = new jsPDF();

    // 1. EXTRAÇÃO DIRETA (O segredo: pegar do primeiro item do histórico)
    const h = (historico && historico.length > 0) ? historico[0] : {};
    
    // Transformamos tudo em Texto Simples para o jsPDF não se perder
    const nomeTutor = String(h.tutorNome || "NÃO IDENTIFICADO").toUpperCase();
    const cpfTutor = String(h.tutorCpf || "---");
    const whatsTutor = String(h.tutorWhatsapp || "---");
    const emailTutor = String(h.tutorEmail || "---");
    const enderecoTutor = String(h.tutorEnderecoCompleto || "---");
    const localidade = `${String(h.tutorBairro || "")} - ${String(h.tutorCidade || "")}/SP`;

    // 2. CABEÇALHO INSTITUCIONAL
    doc.setFillColor(31, 41, 55); 
    doc.rect(0, 0, 210, 45, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("RELATÓRIO MESTRE DE AUDITORIA", 105, 22, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("SISTEMA CASTRACAO ONG - REGISTRO OFICIAL", 105, 32, { align: "center" });

    // 3. IMPRESSÃO DIRETA DOS DADOS (MÉTODO "CARIMBO" - SEM TABELA NO TOPO)
    // Se usarmos autoTable aqui, o dado pode sumir. Com doc.text ele APARECE.
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("DADOS DO RESPONSÁVEL:", 15, 55);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`NOME COMPLETO: ${nomeTutor}`, 15, 65);
    doc.text(`DOCUMENTO (CPF): ${cpfTutor}`, 15, 72);
    doc.text(`CONTATO WHATSAPP: ${whatsTutor}`, 15, 79);
    doc.text(`E-MAIL REGISTRADO: ${emailTutor}`, 15, 86);
    doc.text(`ENDEREÇO: ${enderecoTutor}`, 15, 93);
    doc.text(`LOCALIDADE: ${localidade}`, 15, 100);

    // Linha divisória para separar o topo da tabela
    doc.setDrawColor(200);
    doc.line(15, 105, 195, 105);

    // 4. TABELA DE ANIMAIS (HISTÓRICO)
    const bodyHistorico = historico.map(pet => [
        String(pet.petNome || "---").toUpperCase(),
        String(pet.statusProcesso || "---").toUpperCase(),
        pet.dataSolicitacao ? new Date(pet.dataSolicitacao).toLocaleDateString('pt-BR') : '---',
        pet.realizado ? (pet.dataHoraAgendamento ? new Date(pet.dataHoraAgendamento).toLocaleDateString('pt-BR') : 'SIM') : 'PENDENTE',
        pet.clinicaNome || 'AGUARDANDO',
        pet.codigoHash || '---'
    ]);

    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.setFont("helvetica", "bold");
    doc.text("HISTÓRICO DE PROCEDIMENTOS", 15, 115);

    autoTable(doc, {
        startY: 120, // Começa depois do texto que carimbamos acima
        head: [['ANIMAL', 'STATUS', 'SOLICITAÇÃO', 'CONCLUSÃO', 'CLÍNICA', 'HASH']],
        body: bodyHistorico,
        headStyles: { fillColor: [40, 116, 166], fontSize: 9, halign: 'center' },
        theme: 'striped',
        styles: { fontSize: 9, cellPadding: 3, halign: 'center' },
        columnStyles: { 0: { halign: 'left', fontStyle: 'bold' } }
    });

    // 5. ASSINATURA
    const finalY = doc.lastAutoTable.finalY + 30;
    doc.setDrawColor(200);
    doc.line(60, finalY, 150, finalY);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Assinatura do Auditor Responsável", 105, finalY + 7, { align: "center" });

    doc.save(`Dossie_Auditoria_${nomeTutor.split(' ')[0]}.pdf`);
};
/**
 * RESUMO DAS MELHORIAS:
 * 1. Certificado (Paisagem): Layout de diploma, borda dupla, selo de "Original/Validado" e campos de assinatura para a ONG e Clínica.
 * 2. Dossiê (Completo): Agora puxa endereço completo, e-mail e telefone do tutor, além de listar a clínica onde cada animal foi operado.
 * 3. Assinaturas: Adicionados campos formais de assinatura no final de ambos os documentos para dar valor jurídico/administrativo.
 * 4. Profissionalismo: Uso de fontes em negrito/itálico e variação de tamanhos para hierarquia de informação.
 */