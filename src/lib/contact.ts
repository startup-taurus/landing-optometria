export const WHATSAPP_NUMBER = "593995923599";

export const WHATSAPP_DISPLAY = "+593 99 592 3599";

const DEFAULT_WHATSAPP_MESSAGE =
  "Hola, me interesa conocer más sobre LatamSoft para mi clínica.";

export function whatsappUrl(message: string = DEFAULT_WHATSAPP_MESSAGE) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const WHATSAPP_URL = whatsappUrl();

export const CONTACT_EMAIL = "ridencedenods@gmail.com";

export const CONTACT_EMAIL_HREF = `mailto:${CONTACT_EMAIL}`;
