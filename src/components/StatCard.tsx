import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  className?: string;
}

const StatCard = ({ label, value, className }: StatCardProps) => {
  return (
    <div
      className={cn(
        "rounded-lg bg-card p-5 shadow-sm border-t-4 border-t-primary",
        className
      )}
    >
      <p className="font-heading text-2xl font-bold text-primary">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground font-body">{label}</p>
    </div>
  );
};

export default StatCard;
