
'use client';

import Header from '@/components/layout/Header';
import AskForm from './_components/AskForm';
import { Suspense } from 'react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

function AskPageContent() {
    return <AskForm />;
}

export default function AskPage() {
  return (
    <div className="flex h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div className="h-full w-full flex items-center justify-center">
            <Suspense fallback={<LoadingSpinner />}>
                <AskPageContent />
            </Suspense>
        </div>
      </main>
    </div>
  );
}
