'use client';

import Header from '@/components/layout/Header';

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-primary">About Educational Notes</h1>
          <p className="mt-4 text-muted-foreground">This is a protected page with information about the app. Content coming soon!</p>
        </div>
      </main>
    </div>
  );
}
