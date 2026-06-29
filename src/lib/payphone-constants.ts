// Constantes PURAS de Payphone (sin imports de Node). Seguras para importar desde
// componentes cliente: no arrastran `crypto`/`https` al bundle del navegador.
export const PLAN_CURRENCY = "USD";
export const PLAN_LABEL = "Dioptrika — Plan"; // fallback de etiqueta (emails)
export const PLAN_REFERENCE = "Dioptrika - Suscripción"; // referencia base (fallback)
