import { ReactNode } from "react";

interface DashCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
}

export default function DashCard({ title, value, icon }: DashCardProps) {
  return (
    <div className="data-card flex items-center gap-4">
      <div className="rounded-lg bg-primary/10 p-3 text-primary">{icon}</div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-semibold font-mono-data tracking-tight">{value}</p>
      </div>
    </div>
  );
}
