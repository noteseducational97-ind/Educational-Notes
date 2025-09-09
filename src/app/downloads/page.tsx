
'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getResources, Resource, addToWatchlist, removeFromWatchlist, getWatchlist } from '@/lib/firebase/resources';
import { ArrowUpRight, Download, BookOpen, Bookmark, BookmarkCheck, Clock, Lock, LogIn, ExternalLink, HelpCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useMemo, useCallback } from 'react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Pagination from '@/components/shared/Pagination';
import { MultiSelect } from '@/components/ui/multi-select';
import { motion } from 'framer-motion';

const criteria = ['Class 11', 'Class 12', 'MHT-CET'];
const contentCategories = [
    'Notes', 'Previous Year Questions', 'Syllabus', 'Text Book', 'Textual Answer', 'Important Point', 'Other Study Material'
];

const scienceSubjects = ['Physics', 'Chemistry', 'Math-1', 'Math-2', 'Biology'];

const GUEST_WATCHLIST_KEY = 'guest-watchlist';
const ITEMS_PER_PAGE = 9;

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


export default function DownloadsPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [saving, setSaving] = useState<string | null>(null);
  const [watchlistIds, setWatchlistIds] = useState<Set<string>>(new Set());
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasFilters, setHasFilters] = useState(false);

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedResources = await getResources({ includePrivate: !!user });
      setResources(fetchedResources);
      
      if (user) {
        const watchlistItems = await getWatchlist(user.uid);
        setWatchlistIds(new Set(watchlistItems.map(item => item.id)));
      } else {
        const guestWatchlist = JSON.parse(localStorage.getItem(GUEST_WATCHLIST_KEY) || '[]');
        setWatchlistIds(new Set(guestWatchlist));
      }

    } catch (error) {
      console.error("Failed to fetch data", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load resources. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const availableSubjects = useMemo(() => {
    const subjects = new Set<string>();
    if (selectedCriteria.some(c => ['Class 11', 'Class 12', 'MHT-CET'].includes(c))) {
      scienceSubjects.forEach(s => subjects.add(s));
    }
    
    if(subjects.size === 0) { // If no class is selected, show all
        return [...scienceSubjects];
    }
    return Array.from(subjects);
  }, [selectedCriteria]);

  useEffect(() => {
    // When available subjects change, filter out any selected subjects that are no longer available.
    setSelectedSubjects(prev => prev.filter(subject => availableSubjects.includes(subject)));
  }, [availableSubjects]);
  
  useEffect(() => {
    setHasFilters(selectedCriteria.length > 0 || selectedCategories.length > 0 || selectedSubjects.length > 0);
  }, [selectedCriteria, selectedCategories, selectedSubjects]);

  const handleToggleWatchlist = async (resource: Resource) => {
    setSaving(resource.id);
    const isSaved = watchlistIds.has(resource.id);

    try {
        if (user) {
            if (isSaved) {
                await removeFromWatchlist(user.uid, resource.id);
            } else {
                await addToWatchlist(user.uid, resource.id);
            }
        } else {
            const guestWatchlist = new Set(JSON.parse(localStorage.getItem(GUEST_WATCHLIST_KEY) || '[]'));
            if (isSaved) {
                guestWatchlist.delete(resource.id);
            } else {
                guestWatchlist.add(resource.id);
            }
            localStorage.setItem(GUEST_WATCHLIST_KEY, JSON.stringify(Array.from(guestWatchlist)));
        }

        setWatchlistIds(prev => {
            const newSet = new Set(prev);
            if (isSaved) {
                newSet.delete(resource.id);
            } else {
                newSet.add(resource.id);
            }
            return newSet;
        });

        toast({
            title: isSaved ? 'Removed' : 'Saved!',
            description: `"${resource.title}" has been ${isSaved ? 'removed from' : 'added to'} your watchlist.`,
        });

    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message,
        });
    } finally {
        setSaving(null);
    }
  };
  
  const filteredResources = useMemo(() => {
    if (!hasFilters) {
      return resources;
    }
    return resources.filter(resource => {
      const criteriaMatch = selectedCriteria.length === 0 || 
        selectedCriteria.some(crit => 
            resource.stream.some(s => s.toLowerCase().includes(crit.toLowerCase()))
        );
      const categoryMatch = selectedCategories.length === 0 || resource.category.some(c => selectedCategories.includes(c));
      const subjectMatch = selectedSubjects.length === 0 || resource.subject.some(s => selectedSubjects.includes(s));
      
      return criteriaMatch && categoryMatch && subjectMatch;
    });
  }, [resources, selectedCriteria, selectedCategories, selectedSubjects, hasFilters]);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page on filter change
  }, [filteredResources]);


  const paginatedResources = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredResources.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredResources, currentPage]);

  const totalPages = Math.ceil(filteredResources.length / ITEMS_PER_PAGE);
  
  const getDownloadUrl = (resource: Resource) => {
    return resource.isComingSoon ? '#' : resource.pdfUrl || '#';
  };
  
  const isLinkDisabled = (resource: Resource) => resource.isComingSoon || !resource.pdfUrl;

  const handleDownloadClick = () => {
    if (!user) {
      setShowLoginDialog(true);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-screen-xl px-4 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Downloads</h1>
            <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
              A curated list of study materials and useful links to accelerate your learning.
            </p>
          </div>
          
           <Card className="mb-12 border-border/50 bg-secondary/30">
            <CardHeader>
              <CardTitle>Select Your Criteria</CardTitle>
              <CardDescription>Narrow down the study materials to find exactly what you need.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <MultiSelect
                    options={criteria.map(c => ({ label: c, value: c }))}
                    onValueChange={setSelectedCriteria}
                    defaultValue={selectedCriteria}
                    placeholder="Select criteria..."
                />
                <MultiSelect
                    options={contentCategories.map(c => ({ label: c, value: c }))}
                    onValueChange={setSelectedCategories}
                    defaultValue={selectedCategories}
                    placeholder="Select category..."
                />
                <MultiSelect
                    options={availableSubjects.map(s => ({ label: s, value: s }))}
                    onValueChange={setSelectedSubjects}
                    defaultValue={selectedSubjects}
                    placeholder="Select subjects..."
                />
            </CardContent>
          </Card>

          {authLoading || loading ? (
            <LoadingSpinner />
          ) : paginatedResources.length > 0 ? (
            <>
                <motion.div 
                  className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: false, amount: 0.1 }}
                >
                {paginatedResources.map((resource: Resource, i: number) => {
                    const isSaved = watchlistIds.has(resource.id);
                    const disabled = isLinkDisabled(resource);
                    return (
                      <motion.div key={resource.id} variants={itemVariants} className="flex">
                        <Card 
                          className="flex h-full w-full flex-col overflow-hidden border-border/50 bg-secondary/30 shadow-md transition-all duration-300 hover:border-primary/50 hover:shadow-primary/20"
                        >
                            <div className="relative aspect-video bg-muted/50">
                                <Image
                                    src={resource.imageUrl}
                                    alt={resource.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                />
                            </div>
                            <CardHeader>
                                <CardTitle className="text-xl">
                                    <Link
                                    href={`/resources/${resource.id}`}
                                    className={cn("group inline-flex items-center gap-2 transition-colors hover:text-primary", disabled && "pointer-events-none text-muted-foreground")}
                                    >
                                    <BookOpen className="h-5 w-5 text-primary/80" />
                                    {resource.title}
                                    {!disabled && <ArrowUpRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />}
                                    </Link>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <div className='flex flex-wrap gap-2'>
                                    {resource.category.map(c => <Badge key={c} variant="secondary">{c}</Badge>)}
                                    {resource.stream.map(s => <Badge key={s} variant="outline">{s}</Badge>)}
                                    {resource.subject.map(s => <Badge key={s} variant="default">{s}</Badge>)}
                                </div>
                            </CardContent>
                            <CardFooter className="mt-auto flex items-center justify-between border-t pt-4">
                            <Button variant={isSaved ? "secondary" : "outline"} size="sm" onClick={() => handleToggleWatchlist(resource)} disabled={saving === resource.id}>
                                {isSaved ? <BookmarkCheck className="mr-1 h-4 w-4" /> : <Bookmark className="mr-1 h-4 w-4" />}
                                {isSaved ? 'Saved' : 'Save'}
                            </Button>
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={disabled}
                                    asChild
                                >
                                    <Link href={`/resources/${resource.id}`}>
                                        <ExternalLink className="h-4 w-4" />
                                        View
                                    </Link>
                                </Button>
                                {user ? (
                                        <Button asChild size="sm" disabled={disabled}>
                                        <Link
                                            href={getDownloadUrl(resource)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group inline-flex items-center gap-1"
                                        >
                                            <Download className="h-4 w-4" />
                                            Download
                                        </Link>
                                        </Button>
                                    ) : (
                                        <Button size="sm" disabled={disabled} onClick={handleDownloadClick}>
                                        <Download className="h-4 w-4" />
                                        Download
                                        </Button>
                                )}
                            </div>
                            </CardFooter>
                        </Card>
                      </motion.div>
                    )
                })}
                </motion.div>
                {totalPages > 1 && (
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted bg-card/50 p-12 text-center">
              <h2 className="text-2xl font-semibold">No Matching Resources Found</h2>
              <p className="mt-2 text-muted-foreground">
                Try adjusting your filters or check back later for new materials.
              </p>
            </div>
          )}
        </div>
      </main>
      <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Authentication Required</AlertDialogTitle>
            <AlertDialogDescription>
              You need to be signed in to download PDF. Please sign in to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/login')}>
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
