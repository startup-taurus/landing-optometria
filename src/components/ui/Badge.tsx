import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  tone?: "dark" | "light";
}

export default function Badge({ children, className, tone = "dark" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium font-inter",
        tone === "dark"
          ? "bg-[#14B875]/10 text-[#14B875] border border-[#14B875]/30"
          : "bg-[#14B875]/8 text-[#087A5A] border border-[#14B875]/25",
        className
      )}
    >
      {children}
    </span>
  );
}
