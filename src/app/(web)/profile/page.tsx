'use client';

import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MailWarning, Edit } from 'lucide-react';
import { sendEmailVerification } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleSignOut = () => {
    auth.signOut();
    router.push('/');
  };

  const handleResendVerification = async () => {
    if (user) {
      try {
        await sendEmailVerification(user);
        toast({
          title: 'Verification Email Sent',
          description: 'A new verification link has been sent to your email address.',
        });
      } catch (error) {
        console.error('Error sending verification email:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to send verification email. Please try again later.',
        });
      }
    }
  };

  if (isUserLoading || !user) {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-xl mx-auto">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64 mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-10 w-24 mt-4" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-xl mx-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="font-headline text-2xl">User Profile</CardTitle>
                <CardDescription>View and manage your account details.</CardDescription>
            </div>
            <Button asChild variant="outline" size="icon">
                <Link href="/profile/edit">
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit Profile</span>
                </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {!user.emailVerified && (
                <Alert variant="destructive">
                    <MailWarning className="h-4 w-4" />
                    <AlertTitle>Email Not Verified</AlertTitle>
                    <AlertDescription>
                        Your email address is not verified. Please check your inbox for a verification link.
                        <Button variant="link" className="p-0 h-auto ml-2" onClick={handleResendVerification}>Resend verification email</Button>
                    </AlertDescription>
                </Alert>
            )}
            <div>
              <p className="font-semibold">Display Name:</p>
              <p>{user.displayName || 'Not set'}</p>
            </div>
            <div>
              <p className="font-semibold">Email:</p>
              <p>{user.email}</p>
            </div>
            <div>
              <p className="font-semibold">Email Verified:</p>
              <p>{user.emailVerified ? 'Yes' : 'No'}</p>
            </div>
            <Button onClick={handleSignOut} variant="destructive">
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
