import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext'; // Verifique se o caminho do seu contexto está correto

const AdminHeader = () => {
    const { user } = useContext(AuthContext);

    const formatarCargo = (nivel) => {
        switch (nivel) {
            case 'MASTER': return 'Administrador Master';
            case 'VOLUNTARIO': return 'Voluntário';
            case 'CLINICA': return 'Clínica Parceira';
            default: return 'Membro';
        }
    };

    if (!user) return null;

    return (
        <header className="h-16 bg-[#0f172a]/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-end px-8 sticky top-0 z-40">
            
            <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-white leading-tight">
                        {user.nome || 'Usuário'}
                    </p>
                    <p className="text-[9px] text-blue-500 uppercase font-black tracking-widest">
                        {formatarCargo(user.nivelAcesso)}
                    </p>
                </div>
                
                {/* Avatar com Gradiente e Iniciais */}
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center text-white font-black border border-slate-700 shadow-lg shadow-blue-500/10 transition-transform hover:scale-105 cursor-default">
                    {user.nome ? user.nome.charAt(0).toUpperCase() : 'A'}
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;

/**
 * RESUMO DO CÓDIGO:
 * - O AdminHeader consome o AuthContext para exibir o nome e nível de acesso do voluntário em tempo real.
 * - Utiliza a propriedade 'backdrop-blur' do Tailwind para um efeito visual moderno e translúcido.
 * - Implementa uma lógica de segurança (if !user return null) para evitar erros de renderização caso a sessão expire.
 */