// Texto CANÓNICO del consentimiento de cobro recurrente.
// Sin imports de Node → seguro para importar desde cliente y servidor.
// Si cambias el texto, el `consent_hash` guardado cambiará (versión del mandato).
export const RECURRING_CONSENT_TEXT =
  "Autorizo el cobro automático de la renovación de mi plan hasta cancelarla.";

// Flag público: la tokenización (cobro recurrente) está activa.
// Se controla con NEXT_PUBLIC_TOKENIZATION_ENABLED en .env.
export const TOKENIZATION_ENABLED =
  process.env.NEXT_PUBLIC_TOKENIZATION_ENABLED === "true";
