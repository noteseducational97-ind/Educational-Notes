
'use client';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Download, BookCheck, ClipboardList, Bookmark, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { Teacher } from '@/types';
import { getTeachers } from '@/lib/firebase/teachers';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import Image from 'next/image';

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

export default function AboutPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeachers()
      .then(setTeachers)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <motion.section 
          className="w-full py-12 md:py-20 lg:py-24 bg-secondary/30"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="container px-4 md:px-6 relative">
            <motion.div variants={itemVariants} className="flex flex-col items-center justify-center space-y-4 text-center">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-primary">About Us</h1>
              <p className="max-w-3xl text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Learn about our mission, the passionate educators behind this platform, and how we are committed to helping students succeed.
              </p>
            </motion.div>
          </div>
        </motion.section>

        <motion.section 
          id="mission" 
          className="w-full py-12 md:py-24 lg:py-32"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          variants={itemVariants}
        >
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
        </motion.section>
        
        {loading ? (
            <div className="py-24"><LoadingSpinner className="min-h-0" /></div>
        ) : teachers.length > 0 && (
          <motion.section
            id="mentors"
            className="w-full py-12 md:py-24 lg:py-32"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
          >
            <div className="container px-4 md:px-6">
              <motion.div variants={itemVariants} className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-balance">Meet Our Mentors</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed text-balance">
                  The experienced educators dedicated to your success.
                </p>
              </motion.div>
              <motion.div variants={containerVariants} className="grid gap-8 sm:grid-cols-1 lg:grid-cols-2 max-w-4xl mx-auto">
                {teachers.map((teacher) => (
                  <motion.div variants={itemVariants} key={teacher.id}>
                    <Card className="group flex flex-col h-full bg-secondary/30 border-border shadow-md overflow-hidden">
                       <CardHeader className="flex flex-col sm:flex-row items-center gap-6 p-6">
                          <div className="relative h-24 w-24 sm:h-32 sm:w-32 flex-shrink-0">
                                <Image
                                    src={`https://picsum.photos/seed/${teacher.id}/200`}
                                    alt={teacher.name}
                                    className="rounded-full object-cover border-4 border-primary/20"
                                    layout="fill"
                                    data-ai-hint="person"
                                />
                          </div>
                          <div>
                            <CardTitle className="text-2xl font-bold text-primary">{teacher.name}</CardTitle>
                            <CardDescription className="text-base text-muted-foreground">{teacher.education}</CardDescription>
                             <div className="mt-2 flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-1 text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                                    <GraduationCap className="h-4 w-4" />
                                    {teacher.subject}
                                </span>
                             </div>
                          </div>
                       </CardHeader>
                       <CardContent className="p-6 pt-0 flex-grow">
                            <p className="text-muted-foreground">
                                Teaching at <strong>{teacher.className}</strong> since <strong>{teacher.since}</strong>, with over <strong>{teacher.experience}</strong> of experience.
                            </p>
                            <div className="mt-4 space-y-2 text-sm">
                               {teacher.mobile && (
                                 <div className="flex items-center gap-2 text-muted-foreground">
                                    <Phone className="h-4 w-4"/> {teacher.mobile}
                                 </div>
                               )}
                               {teacher.email && (
                                 <a href={`mailto:${teacher.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                                    <Mail className="h-4 w-4"/> {teacher.email}
                                 </a>
                               )}
                            </div>
                       </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.section>
        )}

        <motion.section 
          id="features" 
          className="w-full py-12 md:py-24 lg:py-32 bg-secondary/30"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
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
                  <Card 
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
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        <motion.section 
          id="contact" 
          className="w-full py-12 md:py-24 lg:py-32"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          variants={itemVariants}
        >
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
                </div>
                </CardContent>
            </Card>
          </div>
        </motion.section>

      </main>
    </div>
  );
}
