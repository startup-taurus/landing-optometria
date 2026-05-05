import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium font-inter",
        "bg-[#EFF6FF] text-sky border border-[#BAE6FD]",
        className
      )}
    >
      {children}
    </span>
  );
}
