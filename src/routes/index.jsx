import { createBrowserRouter } from "react-router-dom";
import CadastroTutor from "../pages/public/CadastroTutor";
import VerificarGuia from "../pages/public/VerificarGuia/index"; // 1. Importe o novo componente
import LoginAdmin from "../pages/admin/LoginAdmin";
import PainelAdmin from "../pages/admin/PainelAdmin";
import FilaCastracao from "../pages/admin/FilaCastracao";
import PagamentosPendentes from "../pages/admin/PagamentosPendentes";
import GestaoTutores from "../pages/admin/GestaoTutores";
import HistoricoTutor from "../pages/admin/HistoricoTutor";
import CentralAlarmes from "../pages/admin/CentralAlarmes";
import Agendados from "../pages/admin/Agendados";
import AdminLayout from "../layouts/AdminLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <CadastroTutor />,
  },
  {
    path: "/verificar", // 2. Rota pública para as clínicas de Tatuí
    element: <VerificarGuia />,
  },
  {
    path: "/admin",
    children: [
      {
        path: "login",
        element: <LoginAdmin />
      },
      {
        path: "painel",
        element: <PainelAdmin />
      },
      {
        path: "fila",
        element: (
          <AdminLayout>
            <FilaCastracao />
          </AdminLayout>
        )
      },
      {
        path: "pagamentos",
        element: (
          <AdminLayout>
            <PagamentosPendentes />
          </AdminLayout>
        )
      },
      {
        path: "agendados", 
        element: (
          <AdminLayout>
            <Agendados />
          </AdminLayout>
        )
      },
      {
        path: "tutores",
        children: [
          {
            path: "", 
            element: (
              <AdminLayout>
                <GestaoTutores />
              </AdminLayout>
            )
          },
          {
            path: ":id", 
            element: (
              <AdminLayout>
                <HistoricoTutor />
              </AdminLayout>
            )
          }
        ]
      },
      {
        path: "alarmes",
        element: (
          <AdminLayout>
            <CentralAlarmes />
          </AdminLayout>
        )
      },
    ]
  }
]);