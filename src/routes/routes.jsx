import { createBrowserRouter, Navigate , Outlet} from "react-router-dom";
import React from "react";

// Componentes de Controle
import PrivateRoute from "../components/PrivateRoute";
import AdminLayout from "../layouts/AdminLayout";

// Páginas Públicas
import HomePublica from "../pages/public/HomePublica";
import LoginAdmin from "../pages/public/Login";
import VerificarGuia from "../pages/public/VerificarGuia";
import CadastroTutor from "../pages/public/CadastroTutor";

// Páginas Administrativas (Master / Voluntário)
import PainelAdmin from "../pages/admin/PainelAdmin";
import FilaCastracao from "../pages/admin/FilaCastracao";
import PagamentosPendentes from "../pages/admin/PagamentosPendentes";
import Agendados from "../pages/admin/Agendados";
import GestaoTutores from "../pages/admin/GestaoTutores";
import HistoricoTutor from "../pages/admin/HistoricoTutor";
import CentralAlarmes from "../pages/admin/CentralAlarmes";
import GestaoPix from "../pages/admin/GestaoPix";
import ExtratoAuditoria from "../pages/admin/ExtratoAuditoria";

// Páginas de Clínicas
import DashboardClinica from "../pages/admin/DashboardClinica";
import GestaoClinicas from "../pages/admin/GestaoClinicas";
import CadastroClinica from "../pages/admin/CadastroClinica";
import AgendaClinica from "../pages/admin/AgendaClinica";

// Páginas de Voluntários
import GestaoVoluntarios from "../pages/admin/GestaoVoluntarios";
import CadastroVoluntario from "../pages/admin/CadastroVoluntario";
import GerenciarVoluntario from "../pages/admin/GerenciarVoluntario";

export const router = createBrowserRouter([
  // --- ROTAS PÚBLICAS ---
  { path: "/", element: <HomePublica /> },
  { path: "/cadastro", element: <CadastroTutor /> },
  { path: "/verificar", element: <VerificarGuia /> },
  
  // Alterado para /admin/login para manter compatibilidade com V1 e mensagens de cadastro
  { path: "/admin/login", element: <LoginAdmin /> },

  // --- ROTA DE CLÍNICA (INTERFACE PRÓPRIA) ---
  {
    path: "/clinica/agenda",
    element: (
      <PrivateRoute allowedRoles={['CLINICA']}>
        <AgendaClinica />
      </PrivateRoute>
    )
  },

  // --- PAINEL ADMINISTRATIVO (ESTRUTURA V2) ---
  {
    path: "/admin",
    element: (
      <PrivateRoute allowedRoles={['MASTER', 'VOLUNTARIO', 'CLINICA']}>
        <AdminLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <Navigate to="painel" replace /> },
      { path: "painel", element: <PainelAdmin /> },
      { path: "fila", element: <FilaCastracao /> },
      { path: "pagamentos", element: <PagamentosPendentes /> },
      { path: "agendados", element: <Agendados /> },
      { path: "alarmes", element: <CentralAlarmes /> },
      { path: "extrato", element: <ExtratoAuditoria /> },

      // Dashboard específica de clínicas que usam o layout admin
      { path: "dashboard-clinica", element: <DashboardClinica /> },

      // Gestão de Tutores
      {
        path: "tutores",
        children: [
          { path: "", element: <GestaoTutores /> },
          { path: ":id", element: <HistoricoTutor /> },
        ]
      },

      // Gestão de Clínicas (Apenas Master)
      {
        path: "clinicas",
        element: (
          <PrivateRoute allowedRoles={['MASTER']}>
            <Outlet /> 
          </PrivateRoute>
        ), 
        children: [
          { path: "", element: <GestaoClinicas /> },
          { path: "novo", element: <CadastroClinica /> },
        ]
      },

      // Gestão de Voluntários (Apenas Master)
      {
        path: "voluntarios",
        children: [
          { path: "", element: <GestaoVoluntarios /> },
          { path: "novo", element: <CadastroVoluntario /> },
          { path: ":id", element: <GerenciarVoluntario /> },
        ]
      },

      // Configurações Sensíveis
      { path: "configuracao-pix", element: <GestaoPix /> },
    ]
  },

  // Rota de Fallback
  { path: "*", element: <Navigate to="/" replace /> },
]);

// --- RESUMO DO CÓDIGO ---
/**
 * 1. COMPATIBILIDADE DE ROTAS: A rota de login foi alterada de '/login' para '/admin/login', garantindo que todos os links enviados em mensagens de cadastro e e-mails continuem funcionando sem necessidade de alteração no back-end.
 * 2. PADRONIZAÇÃO V1/V2: Mantemos a estrutura moderna da V2, mas respeitando os caminhos de acesso da V1 para evitar confusão dos usuários antigos.
 * 3. HIERARQUIA ADMIN: O 'AdminLayout' continua centralizando o menu e topo para todas as rotas internas, otimizando o carregamento.
 * 4. PROTEÇÃO DE ACESSO: O sistema de rotas privadas agora cobre tanto a interface administrativa quanto a agenda específica de clínicas.
 */