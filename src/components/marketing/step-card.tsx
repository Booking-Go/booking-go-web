interface StepCardProps {
  step: string;
  title: string;
  description: string;
}

export function StepCard({ step, title, description }: StepCardProps) {
  return (
    <div className="text-center md:text-left">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted text-sm font-semibold text-muted-foreground">
        {step}
      </div>
      <h3 className="font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}
