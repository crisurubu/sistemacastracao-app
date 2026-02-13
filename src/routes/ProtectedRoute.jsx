import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;

    // 1. Se não estiver logado, manda para o login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 2. Se o nível de acesso não estiver na lista de permitidos, bloqueia
    if (allowedRoles && !allowedRoles.includes(user.nivelAcesso)) {
        // Se for clínica tentando entrar em rota master, manda para agenda dela
        if (user.nivelAcesso === 'CLINICA') return <Navigate to="/clinica/agenda" />;
        // Se for voluntário tentando entrar em gestão de clínicas, manda para home
        return <Navigate to="/admin/dashboard" />;
    }

    return children;
};

export default ProtectedRoute;