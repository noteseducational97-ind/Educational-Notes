
'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wrench, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Footer from '@/components/layout/Footer';

export default function ComingSoonPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md mx-auto p-4"
            viewport={{ once: false }}
        >
            <Card className="text-center shadow-lg">
                <CardHeader>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Wrench className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="mt-4 text-2xl font-bold">Coming Soon!</CardTitle>
                    <CardDescription>
                        This tool is currently under development. We're working hard to bring it to you.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Please check back later.</p>
                </CardContent>
                <CardFooter>
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/tools">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Tools
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
