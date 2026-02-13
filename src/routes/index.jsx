import { createBrowserRouter, Navigate } from "react-router-dom";
import React, { useContext } from 'react';
import PrivateRoute from "../components/PrivateRoute"; // Importe ele daqui


import CadastroTutor from "../pages/public/CadastroTutor/index";
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


// NOVOS IMPORTS
import DashboardClinica from "../pages/admin/DashboardClinica";
import GestaoClinicas from "../pages/admin/GestaoClinicas";
import CadastroClinica from "../pages/admin/CadastroClinica";
import AgendaClinica from "../pages/admin/AgendaClinica"; // Importe a nova página aqui

// --- COMPONENTE DE PROTEÇÃO (ATUALIZADO) ---

export const router = createBrowserRouter([
  {
    path: "/",
    element: <CadastroTutor />, 
  },
  {
    path: "/verificar",
    element: <VerificarGuia />,
  },
  // --- ÁREA DA CLÍNICA ---
  {
    path: "/clinica/agenda",
    element: (
        <PrivateRoute allowedRoles={['CLINICA']}>
            <AgendaClinica />
        </PrivateRoute>
    )
  },
  // --- ÁREA ADMINISTRATIVA ---
  {
    path: "/admin",
    children: [
      {
        path: "login",
        element: <LoginAdmin />
      },
     // --- CENTRAL ÚNICA DA CLÍNICA ---
      // Agora acessível em: /admin/dashboard-clinica
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
      // --- GESTÃO DE CLÍNICAS: SOMENTE MASTER ---
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