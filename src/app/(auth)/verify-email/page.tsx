'use client';

import { useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { sendEmailVerification } from 'firebase/auth';
import { MailCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function VerifyEmailPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (auth.currentUser && auth.currentUser.emailVerified) {
      router.push('/profile');
    }
  }, [auth, router]);

  const handleResend = async () => {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
        toast({
          title: 'Verification Email Sent',
          description: 'A new verification link has been sent to your email address.',
        });
      } catch (error) {
        console.error("Error sending verification email: ", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "There was a problem sending the verification email.",
        });
      }
    }
  };

  const handleCheckVerification = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      if(auth.currentUser.emailVerified) {
        router.push('/profile');
      } else {
        toast({
          variant: 'destructive',
          title: 'Not Verified',
          description: "Your email is still not verified. Please check your inbox.",
        })
      }
    }
  }

  return (
    <Card>
      <CardHeader className="items-center text-center">
        <MailCheck className="h-12 w-12 text-primary mb-4" />
        <CardTitle className="text-2xl font-headline">Verify Your Email</CardTitle>
        <CardDescription>
          A verification link has been sent to{' '}
          <span className="font-semibold">{auth.currentUser?.email}</span>.
          Please check your inbox and follow the link to activate your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button onClick={handleCheckVerification}>I've verified, continue</Button>
        <p className="text-center text-sm text-muted-foreground">
          Didn&apos;t receive the email?{' '}
          <Button variant="link" className="p-0 h-auto" onClick={handleResend}>
            Resend it
          </Button>
        </p>
      </CardContent>
    </Card>
  );
}
