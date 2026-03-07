import { cn } from "@/lib/utils";

type Variant = "success" | "warning" | "danger" | "info" | "pending";

const variants: Record<Variant, string> = {
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-destructive/15 text-destructive",
  info: "bg-primary/15 text-primary",
  pending: "bg-warning/15 text-warning",
};

export default function StatusBadge({ variant, label }: { variant: Variant; label: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", variants[variant])}>
      {label}
    </span>
  );
}
