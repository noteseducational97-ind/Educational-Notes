
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
import { ArrowUpRight, Download, BookOpen, BookmarkX, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const GUEST_WATCHLIST_KEY = 'guest-watchlist';

export default function SavePage() {
  const { user, loading: authLoading } = useAuth();
  const [watchlistItems, setWatchlistItems] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const [removing, setRemoving] = useState<string | null>(null);

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
    return resource.isComingSoon ? '#' : resource.viewPdfUrl || resource.pdfUrl || '#';
  };

  const getDownloadUrl = (resource: Resource) => {
    return resource.isComingSoon ? '#' : resource.pdfUrl || '#';
  };
  
  const isLinkDisabled = (resource: Resource) => resource.isComingSoon || !resource.pdfUrl;

  const displayedItems = useMemo(() => {
    return watchlistItems;
  }, [watchlistItems]);


  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground tracking-tight">My Watchlist</h1>
            <p className="mt-2 text-muted-foreground">
              Your curated collection of saved resources.
            </p>
          </div>

          {displayedItems.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {displayedItems.map((resource) => (
                <Card key={resource.id} className="flex flex-col hover:border-primary/50 transition-colors duration-300 overflow-hidden">
                   <Link
                    href={getPreviewUrl(resource)}
                    target="_blank"
                    rel="noopener noreferrer"
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
                   <CardHeader>
                    <CardTitle className="text-xl">
                       <Link
                        href={getPreviewUrl(resource)}
                        target="_blank"
                        rel="noopener noreferrer"
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
                  <CardContent className="flex-grow">
                     <p className="text-sm text-muted-foreground">
                        Added on {format(new Date(resource.createdAt), 'MMM dd, yyyy')}
                      </p>
                  </CardContent>
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
                        <Button asChild size="sm" variant="outline" disabled={isLinkDisabled(resource)}>
                           <Link
                           href={getPreviewUrl(resource)}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="group inline-flex items-center gap-1"
                           >
                           <BookOpen className="h-4 w-4" />
                           View
                           </Link>
                        </Button>
                        {user && (
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
                        )}
                      </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
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
    </div>
  );
}
