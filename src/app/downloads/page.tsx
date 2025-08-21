
'use client';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getResources } from '@/lib/firebase/resources';
import { format } from 'date-fns';
import { ArrowUpRight, Download, BookOpen, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Resource } from '@/lib/firebase/resources';
import LoadingSpinner from '@/components/shared/LoadingSpinner';


export default function DownloadsPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

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
                <CardTitle className="text-xl">Filter Resources</CardTitle>
                <CardDescription>Narrow down the study materials to find exactly what you need.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="9">Class 9</SelectItem>
                                <SelectItem value="10">Class 10</SelectItem>
                                <SelectItem value="11">Class 11</SelectItem>
                                <SelectItem value="12">Class 12</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Stream" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="science">Science</SelectItem>
                                <SelectItem value="commerce">Commerce</SelectItem>
                                <SelectItem value="arts">Arts</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="notes">Notes</SelectItem>
                                <SelectItem value="pyq">Previous Year Questions</SelectItem>
                                <SelectItem value="syllabus">Syllabus</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Subject" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="physics">Physics</SelectItem>
                                <SelectItem value="chemistry">Chemistry</SelectItem>
                                <SelectItem value="maths">Maths</SelectItem>
                                <SelectItem value="biology">Biology</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
          </Card>

          {loading ? (
            <LoadingSpinner />
          ) : resources.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {resources.map((resource: any) => (
                <Card key={resource.id} className="flex flex-col hover:border-primary/50 transition-colors duration-300">
                  <CardHeader>
                    <CardTitle className="text-xl">
                       <Link
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-2 hover:text-primary transition-colors"
                      >
                         <BookOpen className="h-5 w-5 text-primary/80" />
                        {resource.title}
                        <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <CardDescription>{resource.description}</CardDescription>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Added on {format(new Date(resource.createdAt), 'PPP')}
                    </p>
                    <Link
                      href={resource.url}
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
              <h2 className="text-2xl font-semibold">No Downloads Yet</h2>
              <p className="mt-2 text-muted-foreground">
                Check back later, or if you're an admin, add some new study materials!
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
