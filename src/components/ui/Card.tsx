import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  tone?: "dark" | "light";
}

export default function Card({ children, className, tone = "dark" }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card p-6",
        tone === "dark"
          ? "bg-[#123A43] border border-[#1D4650] shadow-card"
          : "bg-white border border-[#DCEBE7] shadow-[0_4px_24px_rgba(15,23,42,0.06)]",
        className
      )}
    >
      {children}
    </div>
  );
}
