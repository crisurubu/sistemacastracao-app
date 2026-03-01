import React, { useState } from 'react';

const Input = ({ label, type, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="w-full space-y-2 text-left">
      {label && (
        <label className="text-[11px] uppercase font-black text-slate-200 ml-1 tracking-[0.15em] drop-shadow-sm">
          {label}
        </label>
      )}
      
      <div className="relative flex items-center group">
        <input
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          className={`
            w-full bg-[#1e293b]/50 border border-slate-700 p-4 rounded-2xl text-white 
            placeholder-slate-500 focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb]
            outline-none transition-all text-sm pr-12 group-hover:border-slate-500
            ${props.className || ''}
          `}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 text-slate-400 hover:text-[#2563eb] transition-colors cursor-pointer text-lg"
          >
            {showPassword ? "🙈" : "👁️"} 
          </button>
        )}
      </div>
    </div>
  );
};

export default Input;