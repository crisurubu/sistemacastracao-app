// src/services/messagesService.js
const BASE_URL_LOGIN = "https://sistema-castracao-front.onrender.com";

export const messagesService = {
    
    gerarLinkWhatsApp: (dados, tipoAcao, mudouSenha = false) => {
        let texto = "";

        // 1. CASO: NOVO CADASTRO (Manda Login e Senha de Boas-vindas)
        if (tipoAcao === 'CADASTRO_NOVO') {
            const saudacao = dados.tipo === 'CLINICA' 
                ? "Sua clínica agora é nossa parceira! 🏥" 
                : "Você agora é voluntário(a) oficial! 🐾";
            
            texto = `Olá *${dados.nome}*!\n\n${saudacao}\n\nAqui estão seus dados para acessar o sistema:\n\n📧 *LOGIN:* ${dados.email}\n🔑 *SENHA:* ${dados.senha}\n\n🌐 *ACESSE POR AQUI:* ${BASE_URL_LOGIN}\n\n_Seja muito bem-vindo(a)!_`;
        } 
        
        // 2. CASO: TROCA DE SENHA (Manda o Login e a NOVA Senha)
        else if (tipoAcao === 'ATUALIZACAO' && mudouSenha) {
            texto = `Olá *${dados.nome}*!\n\nSeus dados de acesso na *Sistema Castracao ong* foram atualizados.\n\n📧 *CONFIRME SEU LOGIN:* ${dados.email}\n🔑 *SUA NOVA SENHA:* ${dados.senha}\n\n🌐 *LINK DE LOGIN:* ${BASE_URL_LOGIN}\n\n_Por favor, teste seu novo acesso agora._`;
        }

        if (!texto) return null;

        // Gera o link final para o WhatsApp
        const telefoneLimpo = dados.whatsapp.replace(/\D/g, '');
        return `https://wa.me/55${telefoneLimpo}?text=${encodeURIComponent(texto)}`;
    }
};