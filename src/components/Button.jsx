import React from 'react';

const Button = ({ children, variant = 'blue', ...props }) => {
  // Cores fixas em Hexadecimal para garantir que apareça mesmo se o CSS falhar
  const variants = {
    blue: "bg-[#2563eb] hover:bg-[#1d4ed8] shadow-blue-900/20",
    green: "bg-[#059669] hover:bg-[#047857] shadow-emerald-900/20",
  };

  return (
    <button 
      {...props}
      className={`
        w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[11px]
        transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2
        text-white border-none outline-none
        cursor-pointer 
        ${variants[variant]} 
        ${props.className || ''}
      `}
      style={{ cursor: 'pointer', display: 'flex' }} // Forçamos o cursor e display aqui
    >
      {children}
    </button>
  );
};

export default Button;