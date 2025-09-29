
"use client";

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { useLocale } from '@/hooks/use-locale';

interface RoleCardProps {
  title: string;
  icon: React.ReactNode;
  href: string;
  description: string;
}

export function RoleCard({ title, icon, href, description }: RoleCardProps) {
  const { t } = useLocale();
  return (
    <Link href={href} className="group">
      <Card className="h-full bg-card/80 backdrop-blur-sm hover:bg-card hover:shadow-primary/20 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-primary/50">
        <CardHeader className="items-center text-center">
          <div className="p-4 bg-primary/10 rounded-full text-primary mb-4">
            {icon}
          </div>
          <CardTitle className="font-headline text-xl text-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <CardDescription>{description}</CardDescription>
          <div className="mt-6 flex items-center justify-center text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            {t('roleCard.proceed')} <ArrowRight className="w-4 h-4 ml-2" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
