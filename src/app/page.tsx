
'use client';

import { useAuth } from '@/hooks/use-auth';
import Header from '@/components/layout/Header';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
    ArrowRight, 
    Download, 
    Bookmark, 
    UserPlus, 
    LogIn, 
    BookCheck, 
    ClipboardList, 
    Users, 
    Mail, 
    Phone,
    Calculator,
    Copy,
    Wrench,
    ClipboardEdit,
    FileQuestion
} from 'lucide-react';
import { EducationalNotesLogo } from '@/components/icons/EducationalNotesLogo';

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

const tools = [
    {
        icon: <FileQuestion className="h-8 w-8 text-primary" />,
        title: 'AI Test Generator',
        description: 'Automatically create practice tests from any of our study notes to challenge yourself.',
        href: '/downloads', // The tool is accessible from the resource page
    },
     {
        icon: <ClipboardEdit className="h-8 w-8 text-primary" />,
        title: 'Admission Forms',
        description: 'Apply for our specialized coaching batches for various competitive exams directly through our platform.',
        href: '/admission',
    }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      duration: 0.3
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
};


export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-40 relative overflow-hidden">
          <motion.div 
            className="container px-4 md:px-6 relative"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <div className="flex flex-col items-center text-center space-y-6">
                <motion.div variants={itemVariants} className="inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary border border-primary/20 shadow-sm">
                    Your Ultimate Advantage for Exam Success
                </motion.div>
                <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400 tracking-tight">
                    Your Success, Our Mission
                </motion.h1>
                <motion.p variants={itemVariants} className="max-w-xl text-lg text-foreground/80">
                    High-quality study materials, expert-curated content—all completely free. Achieve academic excellence with us.
                </motion.p>
                <motion.div variants={itemVariants} className="flex flex-col gap-4 min-[400px]:flex-row">
                   {!user ? (
                        <Button size="lg" asChild>
                            <Link href="/signup">Get Started <ArrowRight /></Link>
                        </Button>
                    ) : (
                        <Button size="lg" asChild>
                            <Link href="/profile">My Profile <ArrowRight /></Link>
                        </Button>
                    )}
                     <Button size="lg" variant="secondary" asChild>
                        <Link href="/downloads">Explore Resources</Link>
                    </Button>
                </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <motion.section 
            id="features" 
            className="w-full py-12 md:py-24 lg:py-32 bg-secondary/30"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
        >
          <div className="container px-4 md:px-6 relative">
            <motion.div variants={itemVariants} className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-balance">What We Offer</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed text-balance">
                From comprehensive notes to practice tools, find everything you need to excel in your studies.
              </p>
            </motion.div>
            <motion.div variants={containerVariants} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, i) => (
                <motion.div variants={itemVariants} key={feature.title}>
                  <Card className="group flex flex-col h-full transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-primary/50 bg-background/50 border-border">
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
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Our Tools Section */}
        <motion.section 
            id="tools" 
            className="w-full py-12 md:py-24 lg:py-32"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
        >
          <div className="container px-4 md:px-6 relative">
            <motion.div variants={itemVariants} className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-balance">Our Tools</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed text-balance">
                Powerful utilities designed to help you study smarter and achieve your academic goals.
              </p>
            </motion.div>
            <motion.div variants={containerVariants} className="mx-auto grid max-w-5xl items-center gap-6 sm:grid-cols-2">
              {tools.map((tool, i) => (
                 <motion.div variants={itemVariants} key={tool.title}>
                    <Card className="group flex flex-col h-full transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-primary/50 bg-background/50 border-border">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                        {tool.icon}
                        <CardTitle className="text-xl font-semibold">{tool.title}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <CardDescription>{tool.description}</CardDescription>
                    </CardContent>
                    <CardFooter>
                        <Button asChild variant="secondary" className="w-full">
                            <Link href={tool.href}>Learn More <ArrowRight /></Link>
                        </Button>
                    </CardFooter>
                    </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Mentors Section */}
        <motion.section 
            id="mentors" 
            className="w-full py-12 md:py-24 lg:py-32 bg-secondary/30"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
        >
            <div className="container px-4 md:px-6 relative">
                <motion.div variants={itemVariants} className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-balance">Meet Our Mentors</h2>
                     <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed text-balance">
                        Sponsored by Passionate Educators
                    </p>
                </motion.div>
                <motion.div variants={containerVariants} className="grid md:grid-cols-2 gap-8">
                     <motion.div variants={itemVariants}>
                        <Card className="bg-background/50 border-border/50 shadow-lg">
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
                     </motion.div>
                    <motion.div variants={itemVariants}>
                        <Card className="bg-background/50 border-border/50 shadow-lg">
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
                    </motion.div>
                </motion.div>
            </div>
        </motion.section>
        
        {/* CTA Section */}
        <motion.section 
            id="contact" 
            className="w-full py-12 md:py-24 lg:py-32 bg-background"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
        >
          <div
            className="container grid items-center justify-center gap-8 px-4 text-center md:px-6 relative"
          >
            <motion.div variants={itemVariants} className="space-y-4 max-w-2xl mx-auto rounded-lg bg-secondary/30 backdrop-blur-sm p-8 border">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-balance">
                Ready to Start Your Journey?
              </h2>
              <p className="text-muted-foreground text-balance">
                Create an account today to unlock a world of knowledge and save your progress.
              </p>
              {!user && (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Button asChild size="lg">
                      <Link href="/signup">
                        <UserPlus />
                        Sign Up for Free
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline">
                      <Link href="/login">
                        <LogIn />
                        Sign In
                      </Link>
                    </Button>
                  </div>
              )}
            </motion.div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
