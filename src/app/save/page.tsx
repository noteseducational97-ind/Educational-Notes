
'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getWatchlist, Resource, removeFromWatchlist } from '@/lib/firebase/resources';
import { useAuth } from '@/hooks/use-auth';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { ArrowUpRight, Download, BookOpen, BookmarkX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export default function SavePage() {
  const { user, loading: authLoading } = useAuth();
  const [watchlist, setWatchlist] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else {
        const fetchWatchlist = async () => {
          try {
            setLoading(true);
            const items = await getWatchlist(user.uid);
            setWatchlist(items);
          } catch (error) {
            console.error('Failed to fetch watchlist', error);
          } finally {
            setLoading(false);
          }
        };
        fetchWatchlist();
      }
    }
  }, [user, authLoading, router]);

  const handleRemoveFromWatchlist = async (resourceId: string, resourceTitle: string) => {
    if (!user) return;
    setRemoving(resourceId);
    try {
      await removeFromWatchlist(user.uid, resourceId);
      setWatchlist((prev) => prev.filter((item) => item.id !== resourceId));
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
    return resource.pdfUrl || '#';
  };

  const getDownloadUrl = (resource: Resource) => {
    return resource.pdfUrl || '#';
  };

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

          {watchlist.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {watchlist.map((resource) => (
                <Card key={resource.id} className="flex flex-col hover:border-primary/50 transition-colors duration-300 overflow-hidden">
                   <Link
                    href={getPreviewUrl(resource)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block"
                  >
                    <div className="relative aspect-video">
                        <Image 
                            src={resource.imageUrl || 'https://placehold.co/600x400.png'}
                            alt={resource.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
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
                        <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </CardTitle>
                    <CardDescription asChild>
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Badge variant="secondary">Class {resource.class.replace('class','')}</Badge>
                        {resource.stream && <Badge variant="outline">{resource.stream}</Badge>}
                        {resource.subject && <Badge variant="default">{resource.subject}</Badge>}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className='text-sm text-muted-foreground'>{resource.description}</p>
                     <div className="flex flex-wrap gap-1 mt-2">
                        {resource.category && <Badge variant="secondary">{resource.category}</Badge>}
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between">
                     <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFromWatchlist(resource.id, resource.title)}
                        disabled={removing === resource.id}
                      >
                        <BookmarkX className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                     <Link
                      href={getDownloadUrl(resource)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1 text-primary text-sm font-medium hover:underline"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Link>
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
