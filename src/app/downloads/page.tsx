
'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getResources, Resource, addToWatchlist, removeFromWatchlist, getWatchlist } from '@/lib/firebase/resources';
import { format } from 'date-fns';
import { ArrowUpRight, Download, BookOpen, Bookmark, BookmarkCheck, Clock, Lock, LogIn, ExternalLink, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
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

const allStreams = ['Science', 'MHT-CET', 'NEET', 'Commerce'];
const allclasses = ['All', '9', '10', '11', '12'];
const allSubjects = [
    'Physics', 'Chemistry', 'Maths', 'Biology',
    'Accountancy', 'Business Studies', 'Economics',
    'History', 'Geography', 'Political Science', 'Sociology'
];
const allCategories = ['Notes', 'Previous Year Questions', 'Syllabus'];
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

  const [selectedStreams, setSelectedStreams] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState('All');
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

  const filteredResources = useMemo(() => {
    setCurrentPage(1); // Reset to first page on filter change
    return resources.filter(resource => {
      const streamMatch = selectedStreams.length === 0 || resource.stream.some(s => selectedStreams.includes(s));
      const classMatch = selectedClass === 'All' || !resource.class || resource.class === selectedClass;
      const categoryMatch = selectedCategories.length === 0 || resource.category.some(c => selectedCategories.includes(c));
      const subjectMatch = selectedSubjects.length === 0 || resource.subject.some(s => selectedSubjects.includes(s));
      
      return streamMatch && classMatch && categoryMatch && subjectMatch;
    });
  }, [resources, selectedStreams, selectedClass, selectedCategories, selectedSubjects]);

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
        <div className="container mx-auto px-4 py-8 max-w-screen-xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-foreground tracking-tight">Downloads</h1>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
              A curated list of study materials and useful links to accelerate your learning.
            </p>
          </div>

          <Card className="mb-8 shadow-lg bg-card">
            <CardHeader>
                <CardTitle className="text-xl">Select Your Criteria</CardTitle>
                <CardDescription>Narrow down the study materials to find exactly what you need.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                        <Label className='text-base font-medium'>Stream(s)</Label>
                        <MultiSelect
                            options={allStreams.map(s => ({ value: s, label: s }))}
                            onValueChange={setSelectedStreams}
                            defaultValue={selectedStreams}
                            placeholder="Filter streams..."
                            className="mt-2"
                        />
                    </div>
                    <div>
                      <Label className='text-base font-medium'>Class</Label>
                      <Select onValueChange={setSelectedClass} value={selectedClass}>
                        <SelectTrigger className='mt-2'>
                            <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {allclasses.map(c => <SelectItem key={c} value={c}>{c === 'All' ? 'All Classes' : `Class ${c}`}</SelectItem>)}
                            </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className='text-base font-medium'>Categories</Label>
                    <MultiSelect
                      options={allCategories.map(c => ({ value: c, label: c }))}
                      onValueChange={setSelectedCategories}
                      defaultValue={selectedCategories}
                      placeholder="Filter categories..."
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className='text-base font-medium'>Subjects</Label>
                    <MultiSelect
                      options={allSubjects.map(s => ({ value: s, label: s }))}
                      onValueChange={setSelectedSubjects}
                      defaultValue={selectedSubjects}
                      placeholder="Filter subjects..."
                      className="mt-2"
                    />
                  </div>
                </div>
            </CardContent>
          </Card>

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
