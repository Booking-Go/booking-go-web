interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="group rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300 hover:border-border hover:shadow-sm">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/[0.08] text-primary transition-colors group-hover:bg-primary/[0.12]">
        {icon}
      </div>
      <h3 className="font-semibold tracking-tight">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}
