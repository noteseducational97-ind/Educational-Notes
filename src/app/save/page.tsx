
'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SavePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
                <CardTitle className="text-3xl font-bold text-primary">Watchlist</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mt-4 text-muted-foreground">This is a public page for your watchlist. Content coming soon!</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
