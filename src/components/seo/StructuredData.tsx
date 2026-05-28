import { WHATSAPP_DISPLAY, CONTACT_EMAIL } from "@/lib/contact";
import { FAQS } from "@/lib/faq";
import {
  PARENT_COMPANY,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

export default function StructuredData() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    alternateName: "Dioptrika by LatamSoft",
    url: SITE_URL,
    logo: `${SITE_URL}/brand/isologo.png`,
    image: `${SITE_URL}/opengraph-image`,
    description: SITE_DESCRIPTION,
    parentOrganization: {
      "@type": "Organization",
      name: PARENT_COMPANY,
      description:
        "LatamSoft es la startup detrás de Dioptrika, dedicada a construir software especializado para Latinoamérica.",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        telephone: WHATSAPP_DISPLAY,
        email: CONTACT_EMAIL,
        areaServed: ["EC", "MX", "CO", "PE", "AR", "CL", "BO"],
        availableLanguage: ["Spanish"],
      },
    ],
    areaServed: {
      "@type": "Place",
      name: "Latinoamérica",
    },
    sameAs: [],
  };

  const software = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Optical Practice Management",
    operatingSystem: "Web",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    image: `${SITE_URL}/opengraph-image`,
    publisher: {
      "@type": "Organization",
      name: PARENT_COMPANY,
    },
    audience: {
      "@type": "Audience",
      audienceType: "Optometristas, ópticas y clínicas oftalmológicas",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: "0",
      availability: "https://schema.org/InStock",
      description: "Demo personalizada bajo solicitud",
    },
    featureList: [
      "Historia clínica digital para optometría",
      "Refracción OD/OI con plantillas clínicas",
      "Órdenes a laboratorio óptico con seguimiento",
      "Inventario de monturas, lentes y accesorios",
      "Agenda por sucursal y profesional",
      "Facturación electrónica para ópticas",
      "Notificaciones por WhatsApp",
      "Dashboard de analítica clínica y comercial",
      "Gestión multi-sucursal",
    ],
    inLanguage: "es",
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

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "es",
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
    },
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />
    </>
  );
}
