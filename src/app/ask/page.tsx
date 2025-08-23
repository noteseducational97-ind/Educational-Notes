
import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import AskForm from './_components/AskForm';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function AskPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
            <Suspense fallback={<LoadingSpinner />}>
                <AskForm />
            </Suspense>
        </div>
      </main>
    </div>
  );
}
