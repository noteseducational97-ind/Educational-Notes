'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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

const criteria = ['Class 11', 'Class 12', 'MHT-CET'];
const contentCategories = [
    'Notes', 'Previous Year Questions', 'Syllabus', 'Text Book', 'Textual Answer', 'Important Point', 'Other Study Material'
];

const scienceSubjects = ['Physics', 'Chemistry', 'Math-1', 'Math-2', 'Biology'];

const GUEST_WATCHLIST_KEY = 'guest-watchlist';
const ITEMS_PER_PAGE = 8;

export default function AdminDownloadsPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading, isAdmin } = useAuth();
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
      // Admin sees all resources, including private ones and coming soon ones
      const fetchedResources = await getResources({ isAdmin: true });
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
    if (!authLoading && !isAdmin) {
        toast({ variant: 'destructive', title: 'Unauthorized' });
        router.push('/admin/login');
    } else {
        fetchInitialData();
    }
  }, [fetchInitialData, authLoading, isAdmin, router, toast]);

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
            // This case shouldn't happen in admin view, but keep for safety
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
    let resourcesToFilter = resources;
    // For admin, we show everything initially, then filter.
    
    if (!hasFilters) {
      return resourcesToFilter;
    }
    return resourcesToFilter.filter(resource => {
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

  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground tracking-tight">Public Downloads View</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
            This is a preview of the public downloads page. All resources, including private and upcoming ones, are shown here.
        </p>
      </div>
      
       <Card className="mb-12 bg-secondary/30 border-border/50">
        <CardHeader>
          <CardTitle>Filter Resources</CardTitle>
          <CardDescription>Narrow down the study materials to find exactly what you need.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {paginatedResources.length > 0 ? (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {paginatedResources.map((resource: Resource) => {
                const isSaved = watchlistIds.has(resource.id);
                const disabled = isLinkDisabled(resource);
                return (
                <Card key={resource.id} className="flex flex-col hover:border-primary/50 transition-all duration-300 overflow-hidden bg-secondary/30 border-border/50 shadow-md hover:shadow-primary/20">
                    <CardHeader>
                        <CardTitle className="text-xl">
                            <Link
                            href={`/resources/${resource.id}?from=admin`}
                            className={cn("group inline-flex items-center gap-2 hover:text-primary transition-colors", disabled && "pointer-events-none text-muted-foreground")}
                            >
                            <BookOpen className="h-5 w-5 text-primary/80" />
                            {resource.title}
                            {!disabled && <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
                            </Link>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-2">
                        <div className="flex flex-wrap gap-2">
                            {resource.visibility === 'private' && <Badge variant="destructive"><Lock className="h-3 w-3 mr-1" />Private</Badge>}
                            {resource.isComingSoon && <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Coming Soon</Badge>}
                            {resource.category.map(c => <Badge key={c} variant="secondary">{c}</Badge>)}
                            {resource.stream.map(s => <Badge key={s} variant="outline">{s}</Badge>)}
                            {resource.subject.map(s => <Badge key={s} variant="default">{s}</Badge>)}
                        </div>
                    </CardContent>
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
                                <Link href={`/resources/${resource.id}?from=admin`}>
                                    <ExternalLink className="h-4 w-4" />
                                    View
                                </Link>
                            </Button>
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
    </>
  );
}
