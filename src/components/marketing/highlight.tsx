import { CheckCircle2 } from 'lucide-react';

interface HighlightProps {
  text: string;
}

export function Highlight({ text }: HighlightProps) {
  return (
    <li className="flex items-center gap-3 text-sm">
      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
      <span>{text}</span>
    </li>
  );
}
