
interface PageHeaderProps {
  title: string;
  description: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="container mx-auto pt-8">
        <div>
            <h1 className="text-2xl font-bold font-headline text-primary">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    </div>
  );
}
