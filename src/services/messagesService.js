// src/services/messagesService.js
const BASE_URL_LOGIN = "https://sistema-castracao-app.onrender.com/admin/login";

export const messagesService = {
    
    gerarLinkWhatsApp: (dados, tipoAcao, mudouSenha = false) => {
        if (!dados) return null;

        // --- BUSCA INTELIGENTE DE DADOS (EVITA UNDEFINED) ---
        // Procura o e-mail na raiz ou dentro do objeto administrador
        const emailFinal = dados.email || (dados.administrador && dados.administrador.email);
        
        // Procura a senha na raiz ou dentro do objeto administrador
        const senhaFinal = dados.senha || (dados.administrador && dados.administrador.senha);
        
        const nomeFinal = dados.nome || "Parceiro";
        
        // Aceita os nomes de campo 'whatsapp' (voluntário) ou 'telefone' (clínica)
        const foneBruto = dados.whatsapp || dados.telefone || "";

        let texto = "";

        // 1. CASO: NOVO CADASTRO
        if (tipoAcao === 'CADASTRO_NOVO') {
            const saudacao = dados.tipo === 'CLINICA' 
                ? "É uma honra ter sua clínica como parceira! 🏥" 
                : "Você agora é voluntário(a) oficial! 🐾";
            
            texto = `Olá *${nomeFinal}*!\n\n${saudacao}\n\nAqui estão seus dados para acessar o sistema:\n\n📧 *LOGIN:* ${emailFinal}\n🔑 *SENHA:* ${senhaFinal}\n\n🌐 *ACESSE POR AQUI:* ${BASE_URL_LOGIN}\n\n_Seja muito bem-vindo(a)!_`;
        } 
        
        // 2. CASO: ATUALIZAÇÃO
        else if (tipoAcao === 'ATUALIZACAO') {
            const infoSenha = mudouSenha 
                ? `🔑 *SUA NOVA SENHA:* ${senhaFinal}` 
                : `🔑 *SENHA:* (Mantida a anterior)`;

            texto = `Olá *${nomeFinal}*!\n\nSeus dados de acesso na *Sistema Castracao ong* foram atualizados.\n\n📧 *CONFIRME SEU LOGIN:* ${emailFinal}\n${infoSenha}\n\n🌐 *LINK DE LOGIN:* ${BASE_URL_LOGIN}\n\n_Por favor, teste seu novo acesso agora._`;
        }

        if (!texto || !foneBruto) return null;

        const telefoneLimpo = foneBruto.replace(/\D/g, '');
        return `https://wa.me/55${telefoneLimpo}?text=${encodeURIComponent(texto)}`;
    }
};