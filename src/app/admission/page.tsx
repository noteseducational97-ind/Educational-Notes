
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdmissionPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl font-bold">Admission Form</CardTitle>
              <CardDescription>
                This page is under construction. Please check back later for the admission form.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We are working hard to bring you a seamless admission process. Stay tuned!
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
