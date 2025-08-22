
'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getResources, Resource, addToWatchlist, removeFromWatchlist, getWatchlist } from '@/lib/firebase/resources';
import { format } from 'date-fns';
import { ArrowUpRight, Download, BookOpen, Bookmark, BookmarkCheck } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const allStreams = ['All', 'Science', 'MHT-CET', 'NEET', 'Commerce'];
const scienceClasses = ['All', '9', '10', '11', '12'];
const commerceClasses = ['All', '11', '12'];
const allSubjects = [
    'Physics', 'Chemistry', 'Maths', 'Biology',
    'Accountancy', 'Business Studies', 'Economics',
    'History', 'Geography', 'Political Science', 'Sociology'
];
const allCategories = ['Notes', 'Previous Year Questions', 'Syllabus'];

export default function DownloadsPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState<string | null>(null);
  const [watchlistIds, setWatchlistIds] = useState<Set<string>>(new Set());

  const [selectedStream, setSelectedStream] = useState('All');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedResources = await getResources();
      setResources(fetchedResources);

      if (user) {
        const watchlistItems = await getWatchlist(user.uid);
        setWatchlistIds(new Set(watchlistItems.map(item => item.id)));
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
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Not logged in',
            description: 'You must be logged in to save items.',
        });
        return;
    }
    setSaving(resource.id);

    const isSaved = watchlistIds.has(resource.id);

    try {
        if (isSaved) {
            await removeFromWatchlist(user.uid, resource.id);
            setWatchlistIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(resource.id);
                return newSet;
            });
            toast({
                title: 'Removed',
                description: `"${resource.title}" has been removed from your watchlist.`,
            });
        } else {
            await addToWatchlist(user.uid, resource.id);
            setWatchlistIds(prev => new Set(prev).add(resource.id));
            toast({
                title: 'Saved!',
                description: `"${resource.title}" has been added to your watchlist.`,
            });
        }
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
    return resources.filter(resource => {
      const streamMatch = selectedStream === 'All' || resource.stream === selectedStream;
      const classMatch = selectedClass === 'All' || !resource.class || resource.class === selectedClass;
      const categoryMatch = selectedCategories.length === 0 || resource.category.some(c => selectedCategories.includes(c));
      const subjectMatch = selectedSubjects.length === 0 || resource.subject.some(s => selectedSubjects.includes(s));
      return streamMatch && classMatch && categoryMatch && subjectMatch;
    });
  }, [resources, selectedStream, selectedClass, selectedCategories, selectedSubjects]);

  const getPreviewUrl = (resource: Resource) => {
    return resource.pdfUrl || '#';
  };

  const getDownloadUrl = (resource: Resource) => {
    return resource.pdfUrl || '#';
  };
  
  const handleStreamChange = (value: string) => {
    setSelectedStream(value);
    setSelectedClass('All');
  }

  const getClassOptions = () => {
    if (selectedStream === 'Science') return scienceClasses;
    if (selectedStream === 'Commerce') return commerceClasses;
    return [];
  }

  const showClassFilter = selectedStream === 'Science' || selectedStream === 'Commerce';


  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-foreground tracking-tight">Downloads</h1>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
              A curated list of study materials and useful links to accelerate your learning.
            </p>
          </div>

          <Card className="mb-8 shadow-lg">
            <CardHeader>
                <CardTitle className="text-xl">Select Your Criteria</CardTitle>
                <CardDescription>Narrow down the study materials to find exactly what you need.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Select onValueChange={handleStreamChange} value={selectedStream}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Stream" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {allStreams.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    {showClassFilter && (
                      <Select onValueChange={setSelectedClass} value={selectedClass}>
                          <SelectTrigger>
                              <SelectValue placeholder="Select Class" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectGroup>
                                  {getClassOptions().map(c => <SelectItem key={c} value={c}>{c === 'All' ? 'All Classes' : `Class ${c}`}</SelectItem>)}
                              </SelectGroup>
                          </SelectContent>
                      </Select>
                    )}
                </div>
                <div>
                  <Label className='text-base font-medium'>Categories</Label>
                  <div className='flex flex-wrap gap-x-4 gap-y-2 pt-2'>
                    {allCategories.map(category => (
                      <div key={category} className='flex items-center space-x-2'>
                          <Checkbox
                              id={`category-${category}`}
                              checked={selectedCategories.includes(category)}
                              onCheckedChange={(checked) => {
                                  setSelectedCategories(prev => 
                                      checked ? [...prev, category] : prev.filter(c => c !== category)
                                  );
                              }}
                          />
                          <Label htmlFor={`category-${category}`} className='font-normal'>{category}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                 <div>
                  <Label className='text-base font-medium'>Subjects</Label>
                  <div className='flex flex-wrap gap-x-4 gap-y-2 pt-2'>
                    {allSubjects.map(subject => (
                      <div key={subject} className='flex items-center space-x-2'>
                          <Checkbox
                              id={`subject-${subject}`}
                              checked={selectedSubjects.includes(subject)}
                              onCheckedChange={(checked) => {
                                  setSelectedSubjects(prev => 
                                      checked ? [...prev, subject] : prev.filter(s => s !== subject)
                                  );
                              }}
                          />
                          <Label htmlFor={`subject-${subject}`} className='font-normal'>{subject}</Label>
                      </div>
                    ))}
                  </div>
                </div>
            </CardContent>
          </Card>

          {loading ? (
            <LoadingSpinner />
          ) : filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredResources.map((resource: Resource) => {
                const isSaved = watchlistIds.has(resource.id);
                return (
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
                          {resource.class && <Badge variant="secondary">Class {resource.class}</Badge>}
                          {resource.stream && <Badge variant="outline">{resource.stream}</Badge>}
                          <div className='flex flex-wrap gap-1 mt-1'>
                             {resource.subject.map(s => <Badge key={s} variant="default">{s}</Badge>)}
                          </div>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className='text-sm text-muted-foreground'>{resource.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                          {resource.category.map(c => <Badge key={c} variant="secondary">{c}</Badge>)}
                      </div>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        Added on {format(new Date(resource.createdAt), 'PP')}
                      </p>
                      <div className="flex items-center gap-2">
                          {user && (
                              <Button variant={isSaved ? "secondary" : "ghost"} size="sm" onClick={() => handleToggleWatchlist(resource)} disabled={saving === resource.id}>
                                  {isSaved ? <BookmarkCheck className="h-4 w-4 mr-1" /> : <Bookmark className="h-4 w-4 mr-1" />}
                                  {isSaved ? 'Saved' : 'Save'}
                              </Button>
                          )}
                          <Link
                          href={getDownloadUrl(resource)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-1 text-primary text-sm font-medium hover:underline"
                          >
                          <Download className="h-4 w-4" />
                          Download
                          </Link>
                      </div>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted bg-card/50 p-12 text-center">
              <h2 className="text-2xl font-semibold">No Matching Resources Found</h2>
              <p className="mt-2 text-muted-foreground">
                Try adjusting your filters or check back later.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
