'use client';

import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Button } from '@/components/ui/button';
import { useAuth, useFirestore } from '@/firebase';
import {
  initiateEmailSignUp,
  setDocumentNonBlocking,
} from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, sendEmailVerification, updateProfile } from 'firebase/auth';
import { Eye, EyeOff, XCircle, CheckCircle2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long.' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter.' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number.' })
    .regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character.' }),
});

const passwordRules = [
    { text: 'At least 8 characters long', regex: /.{8,}/ },
    { text: 'At least one lowercase letter', regex: /[a-z]/ },
    { text: 'At least one uppercase letter', regex: /[A-Z]/ },
    { text: 'At least one number', regex: /[0-9]/ },
    { text: 'At least one special character', regex: /[^A-Za-z0-9]/ },
];

const PasswordValidationRules = ({ password }: { password?: string }) => {
    const value = password || '';
    
    return (
        <div className="space-y-1 mt-2">
            {passwordRules.map((rule, index) => {
                const isValid = rule.regex.test(value);
                return (
                    <div key={index} className={`flex items-center text-sm ${isValid ? 'text-green-600' : 'text-red-500'}`}>
                        {isValid ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                        <span>{rule.text}</span>
                    </div>
                );
            })}
        </div>
    );
};


export default function RegisterPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
    mode: 'onTouched'
  });
  
  const passwordValue = form.watch('password');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email && !user.displayName) {
        // This is a new user, set display name and create firestore doc
        const name = form.getValues('name');
        updateProfile(user, { displayName: name }).then(() => {
          const userRef = doc(firestore, 'users', user.uid);
          setDocumentNonBlocking(
            userRef,
            {
              id: user.uid,
              email: user.email,
              verified: false,
              isAdmin: false, // Default to not an admin
              name: name,
            },
            { merge: true }
          );
          if (!user.emailVerified) {
            sendEmailVerification(user);
            router.push('/verify-email');
          } else {
             router.push('/profile');
          }
        });
      } else if (user && user.emailVerified) {
        router.push('/profile');
      } else if (user && !user.emailVerified) {
        router.push('/verify-email');
      }
    });

    return () => unsubscribe();
  }, [auth, firestore, router, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    initiateEmailSignUp(auth, values.email, values.password);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-headline">
          Create an Account
        </CardTitle>
        <CardDescription>
          Join TicketSwift to start booking your next experience.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="m@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input type={showPassword ? 'text' : 'password'} {...field} />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <FormMessage />
                  { (form.formState.touchedFields.password || passwordValue) && <PasswordValidationRules password={passwordValue} /> }
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full !mt-6" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <div className="text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="underline hover:text-primary">
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
