import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { AuthProvider } from './context/AuthContext';
import ToastConfig from './components/ToastConfig'; // Importe o novo componente

function App() {
  return (
    <AuthProvider>
      <ToastConfig /> {/* O componente cuida de todo o estilo agora */}
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;