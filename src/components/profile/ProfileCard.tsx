
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { KeyRound, Trash2 } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import DeleteAccountDialog from './DeleteAccountDialog';

export default function ProfileCard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
      toast({
        title: 'Password Reset Email Sent',
        description: 'Please check your inbox to reset your password.',
      });
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
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
              <AvatarFallback className="text-3xl">{getInitials(user.displayName)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-3xl">{user.displayName}</CardTitle>
              <CardDescription className="text-lg">{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardFooter className="flex flex-col sm:flex-row gap-2 border-t border-border pt-6">
          <Button onClick={handleChangePassword}>
            <KeyRound />
            Change Password
          </Button>
          <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 />
            Delete Account
          </Button>
        </CardFooter>
      </Card>
      <DeleteAccountDialog isOpen={isDeleteDialogOpen} setIsOpen={setIsDeleteDialogOpen} />
    </>
  );
}
