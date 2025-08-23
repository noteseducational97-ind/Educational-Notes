
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getWatchlist, Resource, removeFromWatchlist } from '@/lib/firebase/resources';
import { useAuth } from '@/hooks/use-auth';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { ArrowUpRight, Download, BookOpen, BookmarkX, Lock, LogIn, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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

const GUEST_WATCHLIST_KEY = 'guest-watchlist';
const ITEMS_PER_PAGE = 9;

export default function SavePage() {
  const { user, loading: authLoading } = useAuth();
  const [watchlistItems, setWatchlistItems] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const [removing, setRemoving] = useState<string | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchWatchlist = useCallback(async () => {
    try {
      setLoading(true);
      let items;
      if (user) {
        items = await getWatchlist(user.uid);
      } else {
        const guestResourceIds = JSON.parse(localStorage.getItem(GUEST_WATCHLIST_KEY) || '[]');
        items = await getWatchlist(undefined, guestResourceIds);
      }
      setWatchlistItems(items);
    } catch (error) {
      console.error('Failed to fetch watchlist', error);
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load your watchlist. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);


  useEffect(() => {
    // This effect should only run on the client
    if (typeof window !== 'undefined') {
        fetchWatchlist();
    }
  }, [user, fetchWatchlist]);

  const handleRemoveFromWatchlist = async (resourceId: string, resourceTitle: string) => {
    setRemoving(resourceId);
    try {
        if (user) {
            await removeFromWatchlist(user.uid, resourceId);
        } else {
            const guestWatchlist = new Set(JSON.parse(localStorage.getItem(GUEST_WATCHLIST_KEY) || '[]'));
            guestWatchlist.delete(resourceId);
            localStorage.setItem(GUEST_WATCHLIST_KEY, JSON.stringify(Array.from(guestWatchlist)));
        }
        
      setWatchlistItems((prev) => prev.filter((item) => item.id !== resourceId));
      toast({
        title: 'Removed',
        description: `"${resourceTitle}" has been removed from your watchlist.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setRemoving(null);
    }
  };

  const getPreviewUrl = (resource: Resource) => {
    return resource.isComingSoon ? '#' : resource.viewPdfUrl || '#';
  };

  const getDownloadUrl = (resource: Resource) => {
    return resource.isComingSoon ? '#' : resource.pdfUrl || '#';
  };
  
  const isLinkDisabled = (resource: Resource) => resource.isComingSoon || !resource.pdfUrl;

  const handleDownloadClick = () => {
    if (!user) {
      setShowLoginDialog(true);
    }
  }

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return watchlistItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [watchlistItems, currentPage]);

  const totalPages = Math.ceil(watchlistItems.length / ITEMS_PER_PAGE);

  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-screen-xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground tracking-tight">My Watchlist</h1>
            <p className="mt-2 text-muted-foreground">
              Your curated collection of saved resources.
            </p>
          </div>

          {paginatedItems.length > 0 ? (
            <>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {paginatedItems.map((resource) => (
                    <Card key={resource.id} className="flex flex-col hover:border-primary/50 transition-colors duration-300 overflow-hidden">
                    <Link
                        href={`/resources/${resource.id}`}
                        className="group block"
                    >
                        <div className="relative aspect-video">
                            <Image 
                                src={resource.isComingSoon ? 'https://placehold.co/600x400.png' : resource.imageUrl || 'https://placehold.co/600x400.png'}
                                alt={resource.title}
                                fill
                                className={cn(
                                    "object-cover group-hover:scale-105 transition-transform duration-300",
                                    isLinkDisabled(resource) && "filter grayscale"
                                )}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            {resource.visibility === 'private' && (
                            <div className="absolute top-2 right-2">
                                    <Badge variant="destructive" className="text-lg py-1 px-3"><Lock className="mr-1 h-4 w-4" />Private</Badge>
                                </div>
                            )}
                        </div>
                    </Link>
                    <CardHeader className="flex-grow">
                        <CardTitle className="text-xl">
                        <Link
                            href={`/resources/${resource.id}`}
                            className="group inline-flex items-center gap-2 hover:text-primary transition-colors"
                        >
                            <BookOpen className="h-5 w-5 text-primary/80" />
                            {resource.title}
                            {!isLinkDisabled(resource) && <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
                        </Link>
                        </CardTitle>
                        <CardDescription asChild>
                        <div className="flex flex-wrap gap-2 pt-2">
                            <div className="flex flex-wrap gap-1">
                                {resource.category.map(c => <Badge key={c} variant="secondary">{c}</Badge>)}
                            </div>
                            {resource.class && <Badge variant="outline">Class {resource.class}</Badge>}
                            <div className="flex flex-wrap gap-1">
                                {resource.stream.map(s => <Badge key={s} variant="outline">{s}</Badge>)}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                            {resource.subject.map(s => <Badge key={s} variant="default">{s}</Badge>)}
                            </div>
                        </div>
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex items-center justify-between mt-auto border-t pt-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFromWatchlist(resource.id, resource.title)}
                            disabled={removing === resource.id}
                        >
                            <BookmarkX className="h-4 w-4 mr-1" />
                            Remove
                        </Button>
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={isLinkDisabled(resource)}
                                asChild
                            >
                                <Link href={`/resources/${resource.id}`}>
                                    <ExternalLink className="h-4 w-4" />
                                    View
                                </Link>
                            </Button>
                            {user ? (
                            <Button asChild size="sm" disabled={isLinkDisabled(resource)}>
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
                            <Button size="sm" disabled={isLinkDisabled(resource)} onClick={handleDownloadClick}>
                                <Download className="h-4 w-4" />
                                Download
                            </Button>
                            )}
                        </div>
                    </CardFooter>
                    </Card>
                ))}
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted bg-card/50 p-12 text-center">
                <BookmarkX className="h-16 w-16 text-muted-foreground" />
              <h2 className="mt-6 text-2xl font-semibold">Your Watchlist is Empty</h2>
              <p className="mt-2 text-muted-foreground">
                Browse our resources and save your favorites to find them here later.
              </p>
              <Button asChild className="mt-6">
                <Link href="/downloads">Explore Resources</Link>
              </Button>
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
