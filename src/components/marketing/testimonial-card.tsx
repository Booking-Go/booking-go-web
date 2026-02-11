interface TestimonialCardProps {
  quote: string;
  name: string;
  role: string;
}

export function TestimonialCard({ quote, name, role }: TestimonialCardProps) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6">
      <p className="text-sm leading-relaxed text-muted-foreground">&ldquo;{quote}&rdquo;</p>
      <div className="mt-4 border-t border-border/40 pt-4">
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">{role}</p>
      </div>
    </div>
  );
}
