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
          "group relative inline-flex items-center justify-center gap-2 font-inter font-semibold rounded-btn transition-all duration-300 cursor-pointer select-none active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky/40 focus-visible:ring-offset-2",
          size === "sm" && "px-4 py-2 text-sm",
          size === "md" && "px-6 py-3 text-base",
          size === "lg" && "px-7 py-3.5 text-base",
          variant === "primary" &&
            "text-white bg-gradient-to-br from-sky to-sky-deep shadow-glow-sky hover:shadow-[0_24px_70px_-10px_rgba(14,165,233,0.6)] hover:-translate-y-0.5",
          variant === "outline" &&
            "border border-sky/40 text-navy bg-white/70 backdrop-blur hover:border-sky hover:bg-bg-blue hover:-translate-y-0.5",
          variant === "ghost" &&
            "text-text-muted hover:text-navy hover:bg-bg-soft",
          variant === "whatsapp" &&
            "text-white shadow-[0_18px_40px_-10px_rgba(37,211,102,0.5)] hover:-translate-y-0.5 hover:shadow-[0_24px_60px_-10px_rgba(37,211,102,0.7)]",
          className
        )}
        style={
          variant === "whatsapp"
            ? { background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }
            : undefined
        }
        {...props}
      >
        <span className="relative z-10 inline-flex items-center gap-2">
          {children}
        </span>
      </button>
    );
  }
);
Button.displayName = "Button";

export default Button;
