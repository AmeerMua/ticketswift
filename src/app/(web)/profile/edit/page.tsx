'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useUser, useAuth, useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { updateProfile } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  displayName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
});

export default function EditProfilePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: '',
    },
  });

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
    if (user) {
      form.reset({ displayName: user.displayName || '' });
    }
  }, [user, isUserLoading, router, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;

    try {
      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: values.displayName,
      });

      // Update Firestore document
      const userRef = doc(firestore, 'users', user.uid);
      updateDocumentNonBlocking(userRef, { name: values.displayName });

      toast({
        title: 'Profile Updated',
        description: 'Your display name has been successfully updated.',
      });
      router.push('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
      });
    }
  }
  
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
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-32 mt-4" />
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
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Edit Profile</CardTitle>
            <CardDescription>Update your display name.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className='flex gap-2'>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
