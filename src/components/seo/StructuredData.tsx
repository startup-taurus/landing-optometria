import { WHATSAPP_DISPLAY, CONTACT_EMAIL } from "@/lib/contact";
import { FAQS } from "@/lib/faq";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";

export default function StructuredData() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    description: SITE_DESCRIPTION,
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        telephone: WHATSAPP_DISPLAY,
        email: CONTACT_EMAIL,
        areaServed: "LATAM",
        availableLanguage: ["Spanish"],
      },
    ],
    areaServed: {
      "@type": "Place",
      name: "Latinoamérica",
    },
  };

  const software = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "HealthApplication",
    applicationSubCategory: "Optometry & Optical Practice Management",
    operatingSystem: "Web",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: "0",
      availability: "https://schema.org/InStock",
      description: "Demo personalizada bajo solicitud",
    },
    featureList: [
      "Gestión de pacientes",
      "Historia clínica oftalmológica digital",
      "Pedidos a laboratorio óptico",
      "Inventario de monturas, lentes y accesorios",
      "Agenda y citas multi-doctor",
      "Notificaciones por WhatsApp",
      "Dashboard de analítica",
      "Multi-sucursal",
    ],
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(software) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />
    </>
  );
}
