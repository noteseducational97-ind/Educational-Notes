import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getResources } from '@/lib/firebase/resources';
import { format } from 'date-fns';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default async function ResourcesPage() {
  const resources = await getResources();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary">Resources</h1>
            <p className="mt-2 text-muted-foreground">
              A curated list of study materials and useful links.
            </p>
          </div>

          {resources.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {resources.map((resource) => (
                <Card key={resource.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-xl">
                       <Link
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-2 hover:text-primary transition-colors"
                      >
                        {resource.title}
                        <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <CardDescription>{resource.description}</CardDescription>
                  </CardContent>
                  <CardFooter>
                    <p className="text-xs text-muted-foreground">
                      Added on {format(resource.createdAt, 'PPP')}
                    </p>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-10 text-center shadow-sm">
              <h2 className="text-2xl font-semibold">No Resources Yet</h2>
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
