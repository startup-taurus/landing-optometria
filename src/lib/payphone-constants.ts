// Constantes PURAS de Payphone (sin imports de Node). Seguras para importar desde
// componentes cliente: no arrastran `crypto`/`https` al bundle del navegador.
export const PLAN_CURRENCY = "USD";
export const PLAN_LABEL = "Dioptrika — Plan"; // fallback de etiqueta (emails)
export const PLAN_REFERENCE = "Dioptrika - Suscripción"; // referencia base (fallback)

// Precio del Plan Único — FUENTE ÚNICA DE VERDAD (UI, catálogo, emails y cobro
// recurrente derivan de aquí). La base es $30.00; el IVA (15% Ecuador) se calcula
// y se suma → total $34.50. Cambiar la base o la tasa aquí propaga a todo.
export const TAX_RATE = 0.15;
export const TAX_RATE_PCT = Math.round(TAX_RATE * 100); // 15 (para etiquetas "IVA (15%)")
export const PLAN_BASE_CENTS = 3000; // $30.00 base imponible
export const PLAN_TAX_CENTS = Math.round(PLAN_BASE_CENTS * TAX_RATE); // $4.50 de IVA
export const PLAN_TOTAL_CENTS = PLAN_BASE_CENTS + PLAN_TAX_CENTS; // $34.50 total
