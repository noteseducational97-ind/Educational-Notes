
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
    <div className="flex h-screen flex-col bg-muted/30">
      <Header />
      <main className="flex-1 overflow-hidden">
        <Suspense fallback={<LoadingSpinner />}>
            <AskPageContent />
        </Suspense>
      </main>
    </div>
  );
}
