import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-card border border-border shadow-card p-6",
        className
      )}
    >
      {children}
    </div>
  );
}
