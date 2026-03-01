import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // Importação necessária
import { AuthProvider } from './context/AuthContext';
import { router } from './routes/routes';

function App() {
  return (
    <AuthProvider>
      {/* O Toaster fica aqui para os alertas aparecerem sobre qualquer página */}
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'font-sans text-sm',
          duration: 5000,
        }}
      />
      
      {/* DICA: O GlobalMonitor deve ser chamado dentro das rotas privadas 
          ou no seu AdminLayout para que ele tenha acesso ao contexto do Router.
      */}
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;

/**
 * RESUMO DO CÓDIGO:
 * - Adicionado o Toaster como componente global acima do roteador.
 * - Isso garante que, independente da rota, o balão de alerta tenha um "palco" para aparecer.
 */