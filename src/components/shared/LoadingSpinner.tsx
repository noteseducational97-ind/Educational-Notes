import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex min-h-screen w-full items-center justify-center', className)}>
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
    </div>
  );
}
