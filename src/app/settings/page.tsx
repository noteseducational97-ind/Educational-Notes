
'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Sun, Moon, Laptop, Type, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  
  // This is to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user || !mounted) {
    return <LoadingSpinner />;
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    toast({
        title: "Theme Updated",
        description: `Switched to ${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} theme.`
    })
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:px-6">
          <h1 className="mb-6 text-3xl font-bold text-foreground">Settings</h1>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize the look and feel of your application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-lg font-semibold flex items-center gap-2"><Type /> Theme</Label>
                <RadioGroup
                  defaultValue={theme}
                  onValueChange={handleThemeChange}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2"
                >
                  <Label
                    htmlFor="light"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <RadioGroupItem value="light" id="light" className="sr-only" />
                    <Sun className="mb-3 h-6 w-6" />
                    Light
                  </Label>
                  <Label
                    htmlFor="dark"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <RadioGroupItem value="dark" id="dark" className="sr-only" />
                    <Moon className="mb-3 h-6 w-6" />
                    Dark
                  </Label>
                   <Label
                    htmlFor="system"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <RadioGroupItem value="system" id="system" className="sr-only" />
                    <Laptop className="mb-3 h-6 w-6" />
                    System
                  </Label>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
