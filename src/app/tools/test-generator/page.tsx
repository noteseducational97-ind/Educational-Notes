
import { Suspense } from 'react';
import TestGeneratorClient from './TestGeneratorClient';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function TestGeneratorPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <TestGeneratorClient />
    </Suspense>
  );
}
