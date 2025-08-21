
'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getResources, Resource } from '@/lib/firebase/resources';
import { format } from 'date-fns';
import { ArrowUpRight, Download, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
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

const classes = ['All', 'class9', 'class10', 'class11', 'class12'];
const streams = ['All', 'Science', 'Commerce', 'Arts'];
const categories = ['All', 'Notes', 'PYQ', 'Syllabus'];
const subjects = ['All', 'Physics', 'Chemistry', 'Mathematics', 'Biology', 'History', 'Computer Science'];

export default function DownloadsPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedStream, setSelectedStream] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');

  useEffect(() => {
    async function fetchResources() {
      try {
        const fetchedResources = await getResources();
        setResources(fetchedResources);
      } catch (error) {
        console.error("Failed to fetch resources", error);
      } finally {
        setLoading(false);
      }
    }
    fetchResources();
  }, []);

  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      const classMatch = selectedClass === 'All' || resource.class === selectedClass;
      const streamMatch = selectedStream === 'All' || resource.stream === 'All' || resource.stream === selectedStream;
      const categoryMatch = selectedCategory === 'All' || resource.category === 'All' || resource.category === selectedCategory;
      const subjectMatch = selectedSubject === 'All' || resource.subject === 'All' || resource.subject === selectedSubject;
      return classMatch && streamMatch && categoryMatch && subjectMatch;
    });
  }, [resources, selectedClass, selectedStream, selectedCategory, selectedSubject]);

  const getPreviewUrl = (resource: Resource) => {
    return resource.pdfUrl || resource.downloadUrl || '#';
  };

  const getDownloadUrl = (resource: Resource) => {
    return resource.downloadUrl || resource.pdfUrl || '#';
  };

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
            <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Select onValueChange={setSelectedClass} value={selectedClass}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="All">All Classes</SelectItem>
                                {classes.filter(c => c !== 'All').map(c => <SelectItem key={c} value={c}>Class {c.replace('class','')}</SelectItem>)}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Select onValueChange={setSelectedStream} value={selectedStream}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Stream" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                 <SelectItem value="All">All Streams</SelectItem>
                                {streams.filter(s => s !== 'All').map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Select onValueChange={setSelectedCategory} value={selectedCategory}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="All">All Categories</SelectItem>
                                {categories.filter(c => c !== 'All').map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Select onValueChange={setSelectedSubject} value={selectedSubject}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Subject" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                 <SelectItem value="All">All Subjects</SelectItem>
                                {subjects.filter(s => s !== 'All').map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
          </Card>

          {loading ? (
            <LoadingSpinner />
          ) : filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredResources.map((resource: Resource) => (
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
                    <p className="text-xs text-muted-foreground">
                      Added on {format(new Date(resource.createdAt), 'PPP')}
                    </p>
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
