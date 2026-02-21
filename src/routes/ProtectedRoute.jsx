import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // Ajuste o caminho conforme sua pasta

const ProtectedRoute = ({ children, allowedRoles }) => {
    // Pegamos o user e o loading do nosso contexto global
    const { user, loading } = useContext(AuthContext);

    // 1. Enquanto o context está recuperando o usuário do localStorage (no useEffect),
    // exibimos um nada ou um spinner para evitar redirecionamento falso
    if (loading) {
        return null; // Ou um <Loader />
    }

    // 2. Se não estiver logado (user null), manda para o login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 3. Se o nível de acesso não estiver na lista de permitidos, bloqueia
    // Note que não precisamos mais de JSON.parse aqui, o context já nos dá o objeto pronto
    if (allowedRoles && !allowedRoles.includes(user.nivelAcesso)) {
        // Redirecionamentos inteligentes baseados no cargo
        if (user.nivelAcesso === 'CLINICA') return <Navigate to="/clinica/agenda" />;
        
        return <Navigate to="/admin/dashboard" />;
    }

    // Se passou por tudo, renderiza a página protegida
    return children;
};

export default ProtectedRoute;