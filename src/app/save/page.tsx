'use client';

import Header from '@/components/layout/Header';

export default function SavePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-primary">Watchlist</h1>
          <p className="mt-4 text-muted-foreground">This is a public page for your watchlist. Content coming soon!</p>
        </div>
      </main>
    </div>
  );
}
