'use client';

import { COUNTRIES, DEFAULT_COUNTRY, countryByIso } from "@/lib/countries";

// Campo de teléfono con selector de país NATIVO (default Ecuador). El <select>
// nativo abre el picker del SO en móvil (touch-friendly, sin recortes ni problemas
// de stacking-context que tendría un dropdown custom). Muestra bandera + código
// completo (+593), arreglando el recorte que se veía antes.
export function PhoneCountryField({
  countryIso,
  onCountry,
  value,
  onChange,
}: {
  countryIso: string;
  onCountry: (iso: string) => void;
  value: string;
  onChange: (v: string) => void;
}) {
  const country = countryByIso(countryIso) ?? DEFAULT_COUNTRY;
  const isEC = country.dial === "593";
  const maxLen = isEC ? 10 : 14;

  function handleChange(raw: string) {
    onChange(raw.replace(/[^\d]/g, "").slice(0, maxLen));
  }

  const digits = value.replace(/\D/g, "");
  const ecLocal = digits.replace(/^593/, "").replace(/^0/, "");
  const valid = isEC ? /^9\d{8}$/.test(ecLocal) : digits.replace(/^0+/, "").length >= 6;

  const hint = isEC
    ? value
      ? valid
        ? `Se enviará como +593${ecLocal}`
        : "Debe ser un celular ecuatoriano válido (empieza con 09)"
      : "Ingresa tu celular (10 dígitos, ej. 0994312472)"
    : value
      ? valid
        ? `Se enviará como +${country.dial}${digits.replace(/^0+/, "")}`
        : "Número demasiado corto"
      : `Ingresa tu número (sin el código +${country.dial})`;

  return (
    <label className="block">
      <span className="mb-2 block text-[12px] font-semibold uppercase tracking-wider text-muted">
        Celular <span className="text-brand-ink">*</span>
      </span>
      <div className="relative flex items-stretch overflow-hidden rounded-lg border border-line bg-surface transition-all focus-within:border-brand focus-within:ring-2 focus-within:ring-focus/35">
        <div className="relative flex shrink-0 items-center border-r border-line bg-surface-2">
          <select
            aria-label="Código de país"
            value={countryIso}
            onChange={(e) => onCountry(e.target.value)}
            className="data h-full cursor-pointer appearance-none bg-transparent py-3 pl-3 pr-7 text-sm text-ink focus:outline-none"
          >
            {COUNTRIES.map((c) => (
              <option key={c.iso} value={c.iso}>
                {c.flag} +{c.dial}
              </option>
            ))}
          </select>
          <svg
            aria-hidden
            viewBox="0 0 20 20"
            className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-muted"
          >
            <path
              d="M6 8l4 4 4-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <input
          type="tel"
          inputMode="numeric"
          placeholder={isEC ? "0994312472" : "Número de celular"}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          required
          autoComplete="tel-national"
          className="min-w-0 flex-1 bg-transparent px-3 py-3 text-[16px] text-ink placeholder:text-muted/60 focus:outline-none sm:px-4 sm:text-[15px]"
        />
      </div>
      <span className={`mt-1.5 block text-[11px] ${valid ? "text-brand-ink" : "text-muted"}`}>
        {hint}
      </span>
    </label>
  );
}
