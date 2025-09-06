
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Download, BookCheck, ClipboardList, Bookmark } from 'lucide-react';
import Link from 'next/link';

const features = [
    {
        icon: <Download className="h-8 w-8 text-primary" />,
        title: 'Study Notes',
        description: 'High-quality, comprehensive study notes for various subjects and competitive exams, available for free.',
        href: '/downloads',
    },
    {
        icon: <BookCheck className="h-8 w-8 text-primary" />,
        title: 'Previous Year Questions',
        description: 'Access a vast library of past exam papers (PYQs) to understand patterns and practice effectively.',
        href: '/downloads',
    },
    {
        icon: <ClipboardList className="h-8 w-8 text-primary" />,
        title: 'Syllabus & Exam Guides',
        description: 'Stay on track with detailed syllabus breakdowns and exam patterns for various boards and entrance tests.',
        href: '/downloads',
    },
    {
        icon: <Bookmark className="h-8 w-8 text-primary" />,
        title: 'Personalized Watchlist',
        description: 'Save and organize your most important resources for quick and easy access whenever you need them.',
        href: '/save',
    }
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-20 lg:py-24 bg-secondary/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-primary">About Us</h1>
              <p className="max-w-3xl text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Learn about our mission, the passionate educators behind this platform, and how we are committed to helping students succeed.
              </p>
            </div>
          </div>
        </section>

        <section id="mission" className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-balance">Our Mission</h2>
                </div>
                <Card className="bg-secondary/30 border-border/50 shadow-lg">
                    <CardContent className="p-6 md:p-8">
                        <div className="space-y-4 text-muted-foreground text-lg text-center">
                            <p className="leading-relaxed">
                                At Educational Notes, our vision is to empower every student with high-quality, emotionally supportive learning resources that foster academic success and personal growth.
                            </p>
                            <p className="leading-relaxed">
                                We proudly serve students preparing for competitive exams like NEET, JEE, MHT-CET, and those seeking to build a strong foundation in their academic subjects. Our platform is built on the principles of accessibility, affordability, and trust, ensuring that every learner—regardless of background—can thrive.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-balance">What We Offer</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed text-balance">
                From comprehensive notes to practice tools, find everything you need to excel in your studies.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <Card 
                  key={feature.title}
                  className="group flex flex-col h-full bg-background/50 border-border shadow-md"
                >
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      {feature.icon}
                      <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="mentors" className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-balance">Meet Our Mentors</h2>
                     <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed text-balance">
                        Sponsored by Passionate Educators
                    </p>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                     <Card className="bg-secondary/30 border-border/50 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-2xl">Pravin Khachane (M.Sc., B.Ed.)</CardTitle>
                             <CardDescription>Physics</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground leading-relaxed">
                                With over 30 years of teaching experience, Pravin Sir is a visionary in science education. His ability to simplify complex physics concepts has made him a beloved mentor.
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-secondary/30 border-border/50 shadow-lg">
                       <CardHeader>
                            <CardTitle className="text-2xl">Mangesh Shete (M.Sc., B.Ed.)</CardTitle>
                            <CardDescription>Chemistry</CardDescription>
                        </CardHeader>
                       <CardContent>
                            <p className="text-muted-foreground leading-relaxed">
                                A master of chemistry, Mangesh Sir has spent three decades nurturing curiosity and confidence. His empathetic approach continues to inspire thousands.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>

        <section id="contact" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/30">
          <div className="container px-4 md:px-6">
            <Card className="bg-background/50 border-border shadow-xl">
                <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-primary">Contact Us</CardTitle>
                <CardDescription>Have questions or feedback? We'd love to hear from you.</CardDescription>
                </CardHeader>
                <CardContent>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button asChild variant="outline" className="w-full sm:w-auto">
                    <a href="mailto:noteseducational97@gmail.com">
                        <Mail className="mr-2 h-4 w-4" />
                        noteseducational97@gmail.com
                    </a>
                    </Button>
                    <Button asChild variant="outline" className="w-full sm:w-auto">
                    <a href="tel:+919881482416">
                        <Phone className="mr-2 h-4 w-4" />
                        Khachane Sir - 9881482416
                    </a>
                    </Button>
                    <Button asChild variant="outline" className="w-full sm:w-auto">
                    <a href="tel:+919405695457">
                        <Phone className="mr-2 h-4 w-4" />
                        Shete Sir - 9405695457
                    </a>
                    </Button>
                </div>
                </CardContent>
            </Card>
          </div>
        </section>

      </main>
    </div>
  );
}
