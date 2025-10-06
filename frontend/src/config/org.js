// Organization configuration for letter view/print
// You can override these via .env values:
// VITE_ORG_NAME, VITE_ORG_LOCAL_NAME, VITE_ORG_LOGO_URL
// Example in .env:
// VITE_ORG_NAME="JIMMA UNIVERSITY"
// VITE_ORG_LOCAL_NAME="ጅማ ዩኒቨርሲቲ"
// VITE_ORG_LOGO_URL="/logo.png"  // or full URL

export const ORG_NAME = import.meta.env.VITE_ORG_NAME || 'JIMMA UNIVERSITY';
export const ORG_LOCAL_NAME = import.meta.env.VITE_ORG_LOCAL_NAME || 'ጅማ ዩኒቨርሲቲ';
export const ORG_LOGO_URL = import.meta.env.VITE_ORG_LOGO_URL || '';
