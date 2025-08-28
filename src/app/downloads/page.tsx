
'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getResources, Resource, addToWatchlist, removeFromWatchlist, getWatchlist } from '@/lib/firebase/resources';
import { format } from 'date-fns';
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

const contentCategories = [
    'Notes', 'Text Book', 'Textual Answer', 'Important Point', 
    'PYQ', 'Syllabus', 'Test', 'Other Study Material'
];

const subjects = ['Physics', 'Chemistry', 'Mathematics', 'Biology'];

const GUEST_WATCHLIST_KEY = 'guest-watchlist';
const ITEMS_PER_PAGE = 9;

export default function DownloadsPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [saving, setSaving] = useState<string | null>(null);
  const [watchlistIds, setWatchlistIds] = useState<Set<string>>(new Set());
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

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
  
  const toggleFilter = (value: string, type: 'category' | 'subject') => {
    const updater = type === 'category' ? setSelectedCategories : setSelectedSubjects;
    updater(prev => 
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    );
  };

  const filteredResources = useMemo(() => {
    setCurrentPage(1); // Reset to first page on filter change
    return resources.filter(resource => {
      const categoryMatch = selectedCategories.length === 0 || resource.category.some(c => selectedCategories.includes(c));
      const subjectMatch = selectedSubjects.length === 0 || resource.subject.some(s => selectedSubjects.includes(s));
      
      return categoryMatch && subjectMatch;
    });
  }, [resources, selectedCategories, selectedSubjects]);

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

  const FilterCard = ({ label, type, selectedItems }: { label: string; type: 'category' | 'subject'; selectedItems: string[] }) => {
    const isSelected = selectedItems.includes(label);
    return (
      <Card
        onClick={() => toggleFilter(label, type)}
        className={cn(
          'cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1',
          isSelected ? 'border-primary ring-2 ring-primary/50 bg-primary/5' : 'bg-card'
        )}
      >
        <CardContent className="p-4 flex items-center justify-between">
          <span className={cn('font-medium', isSelected && 'text-primary')}>{label}</span>
          {isSelected && <CheckCircle className="h-5 w-5 text-primary" />}
        </CardContent>
      </Card>
    );
  };


  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-screen-xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-foreground tracking-tight">Downloads</h1>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
              A curated list of study materials and useful links to accelerate your learning.
            </p>
          </div>
          
          <div className="mb-12 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-center mb-6">Select Your Criteria</h2>
              <div className='mb-6'>
                <h3 className="text-lg font-semibold text-muted-foreground mb-4">Content Type</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {contentCategories.map(cat => (
                    <FilterCard key={cat} label={cat} type="category" selectedItems={selectedCategories} />
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-muted-foreground mb-4">Subject</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {subjects.map(sub => (
                    <FilterCard key={sub} label={sub} type="subject" selectedItems={selectedSubjects} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {authLoading || loading ? (
            <LoadingSpinner />
          ) : paginatedResources.length > 0 ? (
            <>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {paginatedResources.map((resource: Resource) => {
                    const isSaved = watchlistIds.has(resource.id);
                    const disabled = isLinkDisabled(resource);
                    return (
                    <Card key={resource.id} className="flex flex-col hover:border-primary/50 transition-colors duration-300 overflow-hidden bg-card">
                        
                        <CardHeader className="flex-grow">
                        <CardTitle className="text-xl">
                            <Link
                            href={`/resources/${resource.id}`}
                            className={cn("group inline-flex items-center gap-2 hover:text-primary transition-colors", disabled && "pointer-events-none text-muted-foreground")}
                            >
                            <BookOpen className="h-5 w-5 text-primary/80" />
                            {resource.title}
                            {!disabled && <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
                            </Link>
                        </CardTitle>
                        <CardDescription asChild>
                            <div className="flex flex-wrap gap-2 pt-2">
                            <div className='flex flex-wrap gap-1'>
                                {resource.category.map(c => <Badge key={c} variant="secondary">{c}</Badge>)}
                            </div>
                            {resource.class && <Badge variant="outline">Class {resource.class}</Badge>}
                            <div className='flex flex-wrap gap-1'>
                                {resource.stream.map(s => <Badge key={s} variant="outline">{s}</Badge>)}
                            </div>
                            <div className='flex flex-wrap gap-1 mt-1'>
                                {resource.subject.map(s => <Badge key={s} variant="default">{s}</Badge>)}
                            </div>
                            </div>
                        </CardDescription>
                        </CardHeader>
                        <CardFooter className="flex items-center justify-between mt-auto border-t pt-4">
                        <Button variant={isSaved ? "secondary" : "outline"} size="sm" onClick={() => handleToggleWatchlist(resource)} disabled={saving === resource.id}>
                            {isSaved ? <BookmarkCheck className="h-4 w-4 mr-1" /> : <Bookmark className="h-4 w-4 mr-1" />}
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
                    )
                })}
                </div>
                <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
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
