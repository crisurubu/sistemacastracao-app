export const maskCPF = (value) => {
  if (!value) return "";
  
  // Remove tudo o que não for número
  const v = value.replace(/\D/g, "");
  
  // Se não tiver nada, retorna vazio
  if (v.length <= 3) return v;
  
  // Aplica a máscara baseada na quantidade de números digitados
  if (v.length <= 6) return v.replace(/(\d{3})(\d{0,3})/, "$1.$2");
  if (v.length <= 9) return v.replace(/(\d{3})(\d{3})(\d{0,3})/, "$1.$2.$3");
  
  // Aqui é o pulo do gato: força o formato final
  return v.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4").slice(0, 14);
};

// 00.000.000/0000-00
export const maskCNPJ = (value) => {
  if (!value) return "";
  const v = value.replace(/\D/g, ""); // LIMPA TUDO
  return v
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2")
    .slice(0, 18);
};

// (00) 00000-0000 (Celular) ou (00) 0000-0000 (Fixo)
export const maskPhone = (value) => {
  if (!value) return "";
  const v = value.replace(/\D/g, ""); // LIMPA TUDO
  
  if (v.length > 10) {
    // Celular: (11) 99999-9999
    return v.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3").slice(0, 15);
  } else {
    // Fixo: (11) 4444-4444
    return v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3").slice(0, 14);
  }
};

// 00000-000
export const maskCEP = (value) => {
  if (!value) return "";
  const v = value.replace(/\D/g, ""); // LIMPA TUDO
  return v
    .replace(/(\d{5})(\d)/, "$1-$2")
    .slice(0, 9);
};