
'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone } from 'lucide-react';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-primary">Education Notes</CardTitle>
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
                            src="https://images.pexels.com/photos/4144144/pexels-photo-4144144.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                            alt="Student studying at a desk"
                            data-ai-hint="student study"
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
                <CardTitle className="text-3xl font-bold text-primary">Sponsored by Passionate Educators</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <h3 className="text-2xl font-semibold text-foreground">Pravin Khachane (M.Sc., B.Ed.) – Physics</h3>
                    <p className="text-muted-foreground leading-relaxed">
                        With over 30 years of teaching experience, Pravin Sir is a visionary in science education. His ability to simplify complex physics concepts and connect with students has made him a beloved mentor across Maharashtra.
                    </p>
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-semibold text-foreground">Mangesh Shete Sir (M.Sc., B.Ed.) – Chemistry</h3>
                    <p className="text-muted-foreground leading-relaxed">
                        A master of chemistry and a champion of student-first learning, Mangesh Sir has spent three decades nurturing curiosity, confidence, and academic excellence. His empathetic approach continues to inspire thousands.
                    </p>
                </div>
            </CardContent>
          </Card>
          
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-primary">Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Have questions or feedback? We'd love to hear from you. Reach out to us at:
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild variant="outline">
                  <a href="mailto:noteseducational97@gmail.com">
                    <Mail className="mr-2 h-4 w-4" />
                    noteseducational97@gmail.com
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a href="tel:+919881482416">
                    <Phone className="mr-2 h-4 w-4" />
                    Khachane Sir - 9881482416
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a href="tel:+919405695457">
                    <Phone className="mr-2 h-4 w-4" />
                    Shete Sir - 9405695457
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}
