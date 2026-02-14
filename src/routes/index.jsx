import { createBrowserRouter, Navigate } from "react-router-dom";
import React, { useContext } from 'react';
import PrivateRoute from "../components/PrivateRoute";

// ... (imports existentes)
import CadastroTutor from "../pages/public/CadastroTutor/index";
import HomePublica from "../pages/public/HomePublica";
import VerificarGuia from "../pages/public/VerificarGuia/index"; 
import PainelAdmin from "../pages/admin/PainelAdmin";
import FilaCastracao from "../pages/admin/FilaCastracao";
import PagamentosPendentes from "../pages/admin/PagamentosPendentes";
import GestaoTutores from "../pages/admin/GestaoTutores";
import HistoricoTutor from "../pages/admin/HistoricoTutor";
import CentralAlarmes from "../pages/admin/CentralAlarmes";
import Agendados from "../pages/admin/Agendados";
import AdminLayout from "../layouts/AdminLayout";
import LoginAdmin from "../pages/public/LoginAdmin/index";

import DashboardClinica from "../pages/admin/DashboardClinica";
import GestaoClinicas from "../pages/admin/GestaoClinicas";
import CadastroClinica from "../pages/admin/CadastroClinica";
import AgendaClinica from "../pages/admin/AgendaClinica"; 

// NOVOS IMPORTS DE VOLUNTÁRIOS
import GestaoVoluntarios from "../pages/admin/GestaoVoluntarios"; // Página com a tabela/lista
import CadastroVoluntario from "../pages/admin/CadastroVoluntario"; // O formulário que fizemos
import GerenciarVoluntario from "../pages/admin/GerenciarVoluntario"; // A página de inativar/WhatsApp

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePublica/>, 
  },
  {
    path: "/verificar",
    element: <VerificarGuia />,
  },
  {
    path: "/clinica/agenda",
    element: (
        <PrivateRoute allowedRoles={['CLINICA']}>
            <AgendaClinica />
        </PrivateRoute>
    )
  },
  {
    path: "/admin",
    children: [
      {
        path: "login",
        element: <LoginAdmin />
      },
      {
        path: "dashboard-clinica", 
        element: (
          <PrivateRoute allowedRoles={['CLINICA']}>
            <AdminLayout>
              <DashboardClinica />
            </AdminLayout>
          </PrivateRoute>
        )
      },
      {
        path: "painel",
        element: (
          <PrivateRoute allowedRoles={['MASTER', 'VOLUNTARIO']}>
            <AdminLayout>
              <PainelAdmin />
            </AdminLayout>
          </PrivateRoute>
        )
      },
      {
        path: "fila",
        element: (
          <PrivateRoute allowedRoles={['MASTER', 'VOLUNTARIO']}>
            <AdminLayout>
              <FilaCastracao />
            </AdminLayout>
          </PrivateRoute>
        )
      },
      {
        path: "pagamentos",
        element: (
          <PrivateRoute allowedRoles={['MASTER', 'VOLUNTARIO']}>
            <AdminLayout>
              <PagamentosPendentes />
            </AdminLayout>
          </PrivateRoute>
        )
      },
      {
        path: "agendados", 
        element: (
          <PrivateRoute allowedRoles={['MASTER', 'VOLUNTARIO']}>
            <AdminLayout>
              <Agendados />
            </AdminLayout>
          </PrivateRoute>
        )
      },
      {
        path: "tutores",
        children: [
          {
            path: "", 
            element: (
              <PrivateRoute allowedRoles={['MASTER', 'VOLUNTARIO']}>
                <AdminLayout>
                  <GestaoTutores />
                </AdminLayout>
              </PrivateRoute>
            )
          },
          {
            path: ":id", 
            element: (
              <PrivateRoute allowedRoles={['MASTER', 'VOLUNTARIO']}>
                <AdminLayout>
                  <HistoricoTutor />
                </AdminLayout>
              </PrivateRoute>
            )
          }
        ]
      },
      {
        path: "clinicas",
        children: [
          {
            path: "", 
            element: (
              <PrivateRoute allowedRoles={['MASTER']}>
                <AdminLayout>
                  <GestaoClinicas />
                </AdminLayout>
              </PrivateRoute>
            )
          },
          {
            path: "novo", 
            element: (
              <PrivateRoute allowedRoles={['MASTER']}>
                <AdminLayout>
                  <CadastroClinica />
                </AdminLayout>
              </PrivateRoute>
            )
          }
        ]
      },

      // --- GESTÃO DE VOLUNTÁRIOS ORGANIZADA ---
      {
        path: "voluntarios",
        children: [
          {
            path: "", // /admin/voluntarios (Lista de todos)
            element: (
              <PrivateRoute allowedRoles={['MASTER']}>
                <AdminLayout>
                  <GestaoVoluntarios />
                </AdminLayout>
              </PrivateRoute>
            )
          },
          {
            path: "novo", // /admin/voluntarios/novo (Cadastro)
            element: (
              <PrivateRoute allowedRoles={['MASTER']}>
                <AdminLayout>
                  <CadastroVoluntario />
                </AdminLayout>
              </PrivateRoute>
            )
          },
          {
            path: ":id", // /admin/voluntarios/123 (Gerenciar/Inativar/WhatsApp)
            element: (
              <PrivateRoute allowedRoles={['MASTER']}>
                <AdminLayout>
                  <GerenciarVoluntario />
                </AdminLayout>
              </PrivateRoute>
            )
          }
        ]
      },

      {
        path: "alarmes",
        element: (
          <PrivateRoute allowedRoles={['MASTER', 'VOLUNTARIO']}>
            <AdminLayout>
              <CentralAlarmes />
            </AdminLayout>
          </PrivateRoute>
        )
      },
    ]
  }
]);