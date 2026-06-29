// Códigos de país para el selector de teléfono del checkout. Sin imports de Node →
// seguro para cliente y servidor. Ecuador primero (default). Lista curada: LatAm +
// destinos comunes. `dial` es solo dígitos (sin `+`); `flag` es el emoji de bandera.
export interface Country {
  iso: string; // ISO 3166-1 alfa-2
  dial: string; // código telefónico (solo dígitos)
  flag: string;
  name: string;
}

export const COUNTRIES: Country[] = [
  { iso: "EC", dial: "593", flag: "🇪🇨", name: "Ecuador" },
  { iso: "CO", dial: "57", flag: "🇨🇴", name: "Colombia" },
  { iso: "PE", dial: "51", flag: "🇵🇪", name: "Perú" },
  { iso: "CL", dial: "56", flag: "🇨🇱", name: "Chile" },
  { iso: "AR", dial: "54", flag: "🇦🇷", name: "Argentina" },
  { iso: "MX", dial: "52", flag: "🇲🇽", name: "México" },
  { iso: "BO", dial: "591", flag: "🇧🇴", name: "Bolivia" },
  { iso: "VE", dial: "58", flag: "🇻🇪", name: "Venezuela" },
  { iso: "PY", dial: "595", flag: "🇵🇾", name: "Paraguay" },
  { iso: "UY", dial: "598", flag: "🇺🇾", name: "Uruguay" },
  { iso: "PA", dial: "507", flag: "🇵🇦", name: "Panamá" },
  { iso: "CR", dial: "506", flag: "🇨🇷", name: "Costa Rica" },
  { iso: "GT", dial: "502", flag: "🇬🇹", name: "Guatemala" },
  { iso: "DO", dial: "1", flag: "🇩🇴", name: "Rep. Dominicana" },
  { iso: "US", dial: "1", flag: "🇺🇸", name: "Estados Unidos" },
  { iso: "ES", dial: "34", flag: "🇪🇸", name: "España" },
];

export const DEFAULT_COUNTRY = COUNTRIES[0]; // Ecuador

export function countryByIso(iso: string): Country | undefined {
  return COUNTRIES.find((c) => c.iso === iso);
}
