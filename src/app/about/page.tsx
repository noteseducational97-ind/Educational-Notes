
'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-primary">About Educational Notes</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                        <p className="text-muted-foreground leading-relaxed">
                            At Educational Notes, our vision is to empower every student with high-quality, emotionally supportive learning resources that foster academic success and personal growth. Founded with a deep commitment to inclusive education, we offer a wide range of materials—from concise study notes and textbook solutions to motivational content and exam-focused resources—designed to meet the evolving needs of learners across India.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            We proudly serve students preparing for competitive exams like NEET, JEE, MHT-CET, and those seeking to build a strong foundation in their academic subjects. Our platform is built on the principles of accessibility, affordability, and trust, ensuring that every learner—regardless of background—can thrive.
                        </p>
                    </div>
                    <div className="w-full aspect-video relative rounded-lg overflow-hidden">
                        <Image
                            src="https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                            alt="Library with many books"
                            data-ai-hint="library books"
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
