import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "whatsapp";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
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
          className
        )}
        style={
          variant === "whatsapp"
            ? { background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }
            : undefined
        }
        {...props}
      >
        {/* La flecha/ícono final se adelanta levemente al hover (solo transform). */}
        <span className="relative z-10 inline-flex items-center gap-2 [&>svg:last-child]:transition-transform [&>svg:last-child]:duration-300 [&>svg:last-child]:ease-out-expo group-hover:[&>svg:last-child]:translate-x-0.5">
          {children}
        </span>
      </button>
    );
  }
);
Button.displayName = "Button";

export default Button;
