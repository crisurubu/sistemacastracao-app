import React, { useContext } from 'react'; // Trocamos useState/useEffect por useContext
import { AuthContext } from '../../context/AuthContext'; // Ajuste o caminho

const AdminHeader = () => {
    // Pegamos o usuário direto do "coração" da aplicação
    const { user } = useContext(AuthContext);

    // Função para traduzir o nível de acesso para um nome amigável
    const formatarCargo = (nivel) => {
        switch (nivel) {
            case 'MASTER': return 'Administrador Master';
            case 'VOLUNTARIO': return 'Voluntário';
            case 'CLINICA': return 'Clínica Parceira';
            default: return 'Membro';
        }
    };

    // Se por algum motivo o user não estiver carregado ainda, 
    // evitamos que o código quebre ao tentar ler user.nome
    if (!user) return null;

    return (
        <header className="h-16 bg-[#0f172a]/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-end px-8">
            
            <div className="flex items-center gap-3">
                <div className="text-right">
                    <p className="text-sm font-bold text-white">
                        {user.nome}
                    </p>
                    <p className="text-[10px] text-blue-500 uppercase font-black tracking-wider">
                        {formatarCargo(user.nivelAcesso)}
                    </p>
                </div>
                
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full flex items-center justify-center text-white font-bold border-2 border-slate-700 shadow-lg shadow-blue-500/20">
                    {user.nome ? user.nome.charAt(0).toUpperCase() : 'A'}
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;