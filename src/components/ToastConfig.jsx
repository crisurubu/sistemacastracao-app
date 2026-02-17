import { Toaster, ToastBar, toast } from 'react-hot-toast';
import { X } from 'lucide-react'; // Importando ícone de fechar

const ToastConfig = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={12}
      containerStyle={{
        top: 40,
        right: 20,
      }}
      toastOptions={{
        // Duração de 6 segundos para dar tempo de ler
        duration: 6000, 
        style: {
          background: '#1e293b',
          color: '#f8fafc',
          border: '1px solid #334155',
          borderRadius: '20px',
          padding: '16px',
          fontSize: '14px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
          maxWidth: '400px',
        },
        success: {
          iconTheme: { primary: '#10b981', secondary: '#fff' },
        },
        error: {
          duration: 8000, // Erros ficam mais tempo na tela
          iconTheme: { primary: '#ef4444', secondary: '#fff' },
        },
      }}
    >
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => (
            <>
              {icon}
              <div className="flex-1 flex flex-row items-center justify-between">
                {message}
                {t.type !== 'loading' && (
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="ml-4 p-1 rounded-full hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
};

export default ToastConfig;