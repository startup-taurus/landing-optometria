export const WHATSAPP_NUMBER = "593995923599";

export const WHATSAPP_DISPLAY = "+593 99 592 3599";

const DEFAULT_WHATSAPP_MESSAGE =
  "Hola, me interesa conocer más sobre Dioptrika para mi óptica.";

export function whatsappUrl(message: string = DEFAULT_WHATSAPP_MESSAGE) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const WHATSAPP_URL = whatsappUrl();

export const CONTACT_EMAIL = "ridencedenods@gmail.com";

export const CONTACT_EMAIL_HREF = `mailto:${CONTACT_EMAIL}`;

export interface LeadFormData {
  name: string;
  clinic?: string;
  email: string;
  phone?: string;
  message?: string;
}

export function buildLeadMessage(data: LeadFormData): string {
  const lines: string[] = [];

  lines.push("👋 *Nueva solicitud desde la web*", "");

  const intro = data.clinic
    ? `Hola, soy *${data.name}* de *${data.clinic}* y me interesa conocer Dioptrika.`
    : `Hola, soy *${data.name}* y me interesa conocer Dioptrika para mi óptica.`;
  lines.push(intro, "");

  lines.push("📋 *Mis datos*");
  lines.push(`• Nombre: ${data.name}`);
  if (data.clinic) lines.push(`• Óptica: ${data.clinic}`);
  lines.push(`• Email: ${data.email}`);
  if (data.phone) lines.push(`• Teléfono: ${data.phone}`);
  lines.push("");

  lines.push("💬 *Mensaje*");
  lines.push(
    data.message?.trim() ||
      "Me gustaría agendar una demo y entender cómo funciona la plataforma."
  );

  lines.push("", "— Enviado desde dioptrika.com");

  return lines.join("\n");
}
