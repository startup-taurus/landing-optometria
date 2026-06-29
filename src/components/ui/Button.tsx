import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "whatsapp";
  size?: "sm" | "md" | "lg";
  /** Muestra un spinner centrado y deshabilita el botón (feedback de "procesando"). */
  loading?: boolean;
}

// Spinner: pista tenue + arco en `currentColor`, así toma el color del texto de cada
// variante (p.ej. cta-on en el primario). Giro lineal constante (lo correcto para un
// indicador indeterminado: una curva ease se vería errática).
function Spinner() {
  return (
    <svg
      className="h-[1.15em] w-[1.15em] animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", loading = false, disabled, children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={cn(
          // Transiciones de propiedades EXPLÍCITAS (nunca `all`) y press rápido
          // (~180ms) para que el botón se sienta "vivo" al tocarlo (Emil).
          "group relative inline-flex items-center justify-center gap-2 font-body font-semibold rounded-btn transition-[transform,background-color,border-color,color,box-shadow,filter] duration-200 ease-out-expo cursor-pointer select-none active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/55 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:opacity-55 disabled:pointer-events-none",
          size === "sm" && "px-4 py-2 text-sm",
          size === "md" && "px-5 py-2.5 text-[15px]",
          size === "lg" && "px-6 py-3 text-base",
          variant === "primary" &&
            "bg-cta text-cta-on shadow-soft hover:-translate-y-0.5 hover:brightness-[1.06]",
          variant === "outline" &&
            "border border-line-strong text-ink bg-surface hover:border-brand hover:text-brand-ink hover:-translate-y-0.5",
          variant === "ghost" && "text-ink-2 hover:text-brand-ink hover:bg-brand/[0.08]",
          variant === "whatsapp" && "text-white hover:-translate-y-0.5",
          // Cargando: el botón está `disabled` (no re-enviar) pero NO debe verse apagado
          // —se ve vivo con el spinner—; anulamos el dim de disabled:opacity-55.
          loading && "!opacity-100",
          className
        )}
        style={
          variant === "whatsapp"
            ? { background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }
            : undefined
        }
        {...props}
      >
        {/* Spinner superpuesto y centrado: el contenido se desvanece (opacity-0) en vez
            de desmontarse, así el ancho del botón no salta al entrar en "procesando". */}
        {loading && (
          <span className="absolute inset-0 z-20 grid place-items-center">
            <Spinner />
          </span>
        )}
        {/* La flecha/ícono final se adelanta levemente al hover (solo transform). */}
        <span
          className={cn(
            "relative z-10 inline-flex items-center gap-2 transition-opacity duration-200 [&>svg:last-child]:transition-transform [&>svg:last-child]:duration-300 [&>svg:last-child]:ease-out-expo group-hover:[&>svg:last-child]:translate-x-0.5",
            loading && "opacity-0"
          )}
        >
          {children}
        </span>
      </button>
    );
  }
);
Button.displayName = "Button";

export default Button;
