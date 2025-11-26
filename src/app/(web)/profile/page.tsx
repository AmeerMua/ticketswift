'use client';

import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MailWarning, Edit, Shield, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import { sendEmailVerification } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

const verificationStatusConfig = {
    Verified: { icon: ShieldCheck, title: 'ID Verified', description: 'Your identity has been successfully verified.', variant: 'default' as const, badgeVariant: 'default' as const},
    Pending: { icon: ShieldAlert, title: 'ID Verification Pending', description: 'Your ID is under review. This usually takes 1-2 business days.', variant: 'default' as const, badgeVariant: 'secondary' as const },
    Rejected: { icon: ShieldX, title: 'ID Verification Rejected', description: 'Your ID could not be verified. Please try uploading again.', variant: 'destructive' as const, badgeVariant: 'destructive' as const },
    NotSubmitted: { icon: Shield, title: 'ID Not Submitted', description: 'Please upload your ID to get full access to booking tickets.', variant: 'default' as const, badgeVariant: 'secondary' as const},
};


export default function ProfilePage() {
  const { user, isUserLoading, userData, isUserDataLoading } = useUser();
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

  if (isUserLoading || !user || isUserDataLoading) {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-xl mx-auto">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64 mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-10 w-24 mt-4" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
  }

  const verificationStatus = userData?.verificationStatus || 'NotSubmitted';
  const statusConfig = verificationStatusConfig[verificationStatus];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-xl mx-auto">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
                <CardTitle className="font-headline text-2xl">User Profile</CardTitle>
                <CardDescription>View and manage your account details.</CardDescription>
            </div>
            <div className='flex items-center gap-2'>
                <Badge variant={statusConfig.badgeVariant}>{verificationStatus}</Badge>
                <Button asChild variant="outline" size="icon">
                    <Link href="/profile/edit">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit Profile</span>
                    </Link>
                </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant={statusConfig.variant}>
                <statusConfig.icon className="h-4 w-4" />
                <AlertTitle>{statusConfig.title}</AlertTitle>
                <AlertDescription>
                    {statusConfig.description}
                    {verificationStatus !== 'Verified' && verificationStatus !== 'Pending' && (
                        <Button asChild variant="link" className='p-0 h-auto ml-1'>
                            <Link href="/verify-id">Verify Now</Link>
                        </Button>
                    )}
                </AlertDescription>
            </Alert>
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
