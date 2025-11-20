import { Separator } from "./ui/separator";

interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="p-6 border-b bg-muted/20">
      <h1 className="font-headline text-2xl font-semibold tracking-tight">
        {title}
      </h1>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
    </header>
  );
}
