
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type PasswordPromptProps = {
  formId: string;
  correctPassword?: string;
  onSuccess: () => void;
};

export default function PasswordPrompt({ formId, correctPassword, onSuccess }: PasswordPromptProps) {
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === correctPassword) {
      // Save to session storage to avoid re-prompting on refresh
      sessionStorage.setItem(`admission-password-${formId}`, password);
      onSuccess();
    } else {
      toast({
        variant: 'destructive',
        title: 'Incorrect Password',
        description: 'Please try again.',
      });
    }
  };

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2"><ShieldCheck/> This Batch is Password Protected</CardTitle>
          <CardDescription>Please enter the password to continue.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
            <CardContent>
                <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="password"
                        placeholder="Enter batch password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </CardContent>
            <CardFooter>
            <Button type="submit" className="w-full">
                Unlock
            </Button>
            </CardFooter>
        </form>
      </Card>
    </div>
  );
}
