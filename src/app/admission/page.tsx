

'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import { Card, CardDescription, CardTitle, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Info, Calendar, Book, Receipt } from 'lucide-react';
import Link from 'next/link';
import { getAdmissionForms, getApplicationsForUser } from '@/lib/firebase/admissions';
import type { AdmissionForm, AdmissionApplication } from '@/types';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { format } from 'date-fns';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

export default function AdmissionPage() {
    const { user, loading: authLoading } = useAuth();
    const [admissionForms, setAdmissionForms] = useState<AdmissionForm[]>([]);
    const [joinedApplicationsMap, setJoinedApplicationsMap] = useState<Map<string, AdmissionApplication>>(new Map());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const forms = await getAdmissionForms();
            setAdmissionForms(forms);

            if (user) {
                const joinedBatches = await getApplicationsForUser(user.uid);
                const appMap = new Map(joinedBatches.map(({ form, application }) => [form.id, application]));
                setJoinedApplicationsMap(appMap);
            }
            setLoading(false);
        };
        fetchData();
    }, [user]);

    if (authLoading || loading) {
        return <LoadingSpinner />;
    }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <motion.div 
            className="container mx-auto px-4 py-12"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <motion.div variants={itemVariants} className="text-center mb-12">
                <h1 className="text-4xl font-bold tracking-tight text-primary">Admissions Open</h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    Choose the program you are interested in and proceed with the admission process.
                </p>
            </motion.div>

            {admissionForms.length > 0 ? (
                 <motion.div 
                    variants={containerVariants}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
                 >
                    {admissionForms.map((form) => {
                        const application = joinedApplicationsMap.get(form.id);
                        const hasJoined = !!application;
                        const buttonText = hasJoined ? 'View Receipt' : 'Apply Now';
                        const buttonIcon = hasJoined ? <Receipt className="ml-2 h-4 w-4" /> : <ArrowRight className="ml-2 h-4 w-4" />;
                        const buttonLink = hasJoined ? `/admission/receipt/${form.id}/${application.id}` : `/admission/${form.id}`;

                        return (
                        <motion.div variants={itemVariants} key={form.id}>
                            <Card 
                                className="flex flex-col justify-between bg-secondary/30 h-full transition-all hover:border-primary/50 hover:shadow-xl overflow-hidden"
                            >
                                <CardHeader className="p-0">
                                    {form.imageUrl && (
                                        <div className="aspect-video relative w-full">
                                            <Image src={form.imageUrl} alt={form.title} layout="fill" objectFit="cover" />
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent className="p-6 flex-grow">
                                    <CardTitle className="text-2xl">{form.title}</CardTitle>
                                    <div className="mt-4">
                                      <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                                          <Book className="h-3 w-3" />
                                          {form.subject}
                                      </Badge>
                                    </div>
                                    <div className="mt-4 flex items-center text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        <span>Starts: {form.startMonth} {form.year}</span>
                                    </div>
                                </CardContent>
                                <div className="p-6 pt-0">
                                    <Button asChild className="w-full mt-6">
                                        <Link href={buttonLink}>
                                            {buttonText} {buttonIcon}
                                        </Link>
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    )})}
                </motion.div>
            ) : (
                <motion.div 
                    variants={itemVariants} 
                    className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted bg-card/50 p-12 text-center max-w-2xl mx-auto"
                >
                    <Info className="h-12 w-12 text-muted-foreground mb-4" />
                    <h2 className="text-2xl font-semibold">No Admissions Currently Open</h2>
                    <p className="mt-2 text-muted-foreground">
                        Please check back later for new admission announcements.
                    </p>
                </motion.div>
            )}

             <motion.div variants={itemVariants} className="text-center mt-16">
                 <h2 className="text-2xl font-semibold">Have Questions?</h2>
                 <p className="mt-2 text-muted-foreground">
                     Feel free to contact us for any admission-related inquiries.
                 </p>
                 <Button variant="outline" className="mt-4" asChild>
                    <a href="mailto:noteseducational97@gmail.com">Contact Us</a>
                 </Button>
            </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
