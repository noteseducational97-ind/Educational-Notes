
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { KeyRound, Trash2, Send, CheckCircle } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import DeleteAccountDialog from './DeleteAccountDialog';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export default function ProfileCard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [passwordResetSent, setPasswordResetSent] = useState(false);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  const handleChangePassword = async () => {
    if (!user?.email) return;
    try {
      await sendPasswordResetEmail(auth, user.email);
      setPasswordResetSent(true);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Card className="w-full shadow-2xl">
        <CardHeader className="text-center items-center">
            <Avatar className="h-24 w-24 border-4 border-primary/20">
              <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
              <AvatarFallback className="text-3xl">{getInitials(user.displayName)}</AvatarFallback>
            </Avatar>
            <div className="pt-4">
                <CardTitle className="text-2xl">{user.displayName}</CardTitle>
                <CardDescription className="text-base">{user.email}</CardDescription>
            </div>
        </CardHeader>
        <CardContent className="space-y-4">
             {passwordResetSent ? (
                <Alert variant="default" className="border-green-500/50 text-green-700">
                    <CheckCircle className="h-4 w-4 !text-green-600" />
                    <AlertTitle className="!text-green-800 dark:!text-green-300">Email Sent</AlertTitle>
                    <AlertDescription className="!text-green-700 dark:!text-green-400">
                        A password reset link has been sent to your email.
                    </AlertDescription>
                </Alert>
            ) : (
                <Button onClick={handleChangePassword} variant="outline" className="w-full">
                    <Send className="mr-2 h-4 w-4" />
                    Send Password Reset Email
                </Button>
            )}
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-2 border-t pt-4">
            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)} className="w-full">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
            </Button>
        </CardFooter>
      </Card>
      <DeleteAccountDialog isOpen={isDeleteDialogOpen} setIsOpen={setIsDeleteDialogOpen} />
    </>
  );
}
