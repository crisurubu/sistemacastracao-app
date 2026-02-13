import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { AuthProvider } from './context/AuthContext'; // 1. Importe o AuthProvider

function App() {
  return (
    // 2. Coloque o AuthProvider por volta do RouterProvider
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;