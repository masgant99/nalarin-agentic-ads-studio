// White-label branding: one build, many clients. Values are baked at build time
// via Vite env vars; neutral defaults; override via env vars.
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Agentic Ads Studio';
export const APP_LOGO = import.meta.env.VITE_APP_LOGO || '/logo.png';
export const APP_TAGLINE = import.meta.env.VITE_APP_TAGLINE || 'Paid media operations';
export const APP_OPERATOR = import.meta.env.VITE_APP_OPERATOR || 'Your Company';
export const APP_OPERATOR_URL = import.meta.env.VITE_APP_OPERATOR_URL || 'https://your-company.example';
export const APP_ACCENT = import.meta.env.VITE_APP_ACCENT || '#B45309';
