'use client';

import { MoreHorizontal, Loader2, CheckCircle, XCircle, ShieldQuestion, Wallet, Upload, User as UserIcon, Check, X, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useCollection, useFirestore, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { Booking } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useState } from 'react';


const statusConfig = {
    Verified: { variant: "default" as const, icon: CheckCircle, className: "text-green-600" },
    Pending: { variant: "secondary" as const, icon: Loader2, className: "animate-spin" },
    Rejected: { variant: "destructive" as const, icon: XCircle, className: "" },
    NotSubmitted: { variant: "outline" as const, icon: ShieldQuestion, className: "" },
};

const bookingStatusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  Confirmed: 'default',
  PaymentPending: 'secondary',
  Cancelled: 'destructive',
};

// Placeholder function for sending emails
const sendEmail = async (to: string, subject: string, body: string) => {
  console.log(`---
SENDING EMAIL (placeholder)
To: ${to}
Subject: ${subject}
Body: ${body}
---`);
  // In a real app, you would replace this with a call to a backend service
  // that sends the email, e.g., using a Cloud Function and an email API like SendGrid.
  return Promise.resolve();
};


function UserDetails({ user, onVerifyId, onVerifyPayment, onCancelBooking }) {
    const firestore = useFirestore();
    
    const bookingsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, `users/${user.id}/bookings`);
    }, [firestore, user.id]);
    
    const { data: bookings, isLoading: bookingsLoading, error: bookingsError } = useCollection<Booking>(bookingsQuery);

    return (
        <div className='grid md:grid-cols-2 gap-6 pt-2 pb-4 px-4'>
            <div>
                <h4 className="font-semibold text-lg mb-2">ID Verification</h4>
                <div className='p-4 border rounded-lg bg-muted/30'>
                    {user.verificationStatus === 'Pending' ? (
                        <div className='space-y-3'>
                             <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-background">
                                <Image 
                                    src={'https://picsum.photos/seed/id-card-demo/600/400'} 
                                    alt="ID Card" 
                                    fill 
                                    className='object-cover'
                                />
                            </div>
                            <p className='text-sm text-muted-foreground'>User submitted the above ID for verification.</p>
                             <div className='flex justify-end gap-2'>
                                <Button size="sm" variant="destructive" onClick={() => onVerifyId(user, 'Rejected')}>
                                    <X className='mr-2 h-4 w-4' />
                                    Reject
                                </Button>
                                <Button size="sm" onClick={() => onVerifyId(user, 'Verified')}>
                                    <Check className='mr-2 h-4 w-4' />
                                    Approve
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className='text-center py-8 flex flex-col items-center justify-center h-full'>
                            <p className='text-muted-foreground'>
                                {user.verificationStatus === 'NotSubmitted' && 'User has not submitted an ID.'}
                                {user.verified && 'User ID has been verified.'}
                                {user.verificationStatus === 'Rejected' && 'User ID submission was rejected.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
             <div>
                <h4 className="font-semibold text-lg mb-2">Booking History</h4>
                <div className='p-4 border rounded-lg bg-muted/30 max-h-96 overflow-y-auto'>
                    {bookingsLoading && <p>Loading bookings...</p>}
                    {bookingsError && <p className='text-destructive'>Error loading bookings.</p>}
                    {!bookingsLoading && !bookingsError && (!bookings || bookings.length === 0) && (
                        <div className='text-center py-8'>
                            <p className='text-muted-foreground'>This user has no bookings.</p>
                        </div>
                    )}
                    <div className='space-y-3'>
                        {(bookings || []).map(booking => (
                             <div key={booking.id} className="p-3 border bg-background rounded-md flex flex-col gap-2">
                                <div className='flex justify-between items-start'>
                                    <div>
                                        <h3 className="font-semibold text-sm">{booking.eventName}</h3>
                                        <p className="text-xs text-muted-foreground">
                                            {booking.eventDate ? format(new Date(booking.eventDate), 'PPP') : 'Date N/A'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {booking.numberOfTickets} Ticket{booking.numberOfTickets > 1 ? 's' : ''} &bull; ${booking.totalAmount.toFixed(2)}
                                        </p>
                                    </div>
                                    <Badge variant={bookingStatusVariant[booking.status] || 'outline'} className="self-start text-xs whitespace-nowrap">
                                        {booking.status}
                                    </Badge>
                                </div>
                                {booking.status === 'PaymentPending' && (
                                     <div className='flex flex-col gap-2'>
                                        <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-background">
                                            {/* In a real app, this src would be the uploaded screenshot URL */}
                                            <Image src={'https://picsum.photos/seed/receipt-demo/600/400'} alt="Payment Screenshot" fill className='object-contain' />
                                        </div>
                                        <div className='flex justify-end gap-2'>
                                            <Button size='sm' className='h-7 text-xs' variant="destructive" onClick={() => onVerifyPayment(user, booking, 'Cancelled')}>
                                                <X className='mr-2 h-3 w-3'/> Reject
                                            </Button>
                                            <Button size='sm' className='h-7 text-xs' onClick={() => onVerifyPayment(user, booking, 'Confirmed')}>
                                                <CheckCircle className='mr-2 h-3 w-3'/> Approve Payment
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                {booking.status !== 'Cancelled' && (
                                    <div className='flex justify-end'>
                                         <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button size="sm" variant="ghost" className="text-destructive h-7 text-xs hover:bg-destructive/10 hover:text-destructive">
                                                    <Ban className='mr-2 h-3 w-3' />
                                                    Cancel Booking
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will cancel the booking and cannot be undone. A notification will be sent to the user.
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Back</AlertDialogCancel>
                                                <AlertDialogAction
                                                    className='bg-destructive hover:bg-destructive/90'
                                                    onClick={() => onCancelBooking(user, booking)}>
                                                    Confirm Cancellation
                                                </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}


export default function AdminUsersPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const usersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'users');
    }, [firestore]);

    const { data: users, isLoading, error } = useCollection(usersQuery);

    const handleVerification = async (user: any, newStatus: 'Verified' | 'Rejected') => {
        if (!firestore) return;
        const userRef = doc(firestore, 'users', user.id);
        updateDocumentNonBlocking(userRef, { 
            verificationStatus: newStatus,
            verified: newStatus === 'Verified' 
        });

        await sendEmail(
            user.email,
            `Your ID Verification has been ${newStatus}`,
            `Hi ${user.name},\n\nYour ID verification status has been updated to: ${newStatus}.\n\n` +
            (newStatus === 'Verified' ? 'You can now book tickets for events.' : 'Please resubmit your ID for verification.') +
            `\n\nThanks,\nThe TicketSwift Team`
        );
        
        toast({
            title: `User ${newStatus}`,
            description: `The user's verification status has been updated.`,
        })
    }

    const handlePaymentVerification = async (user: any, booking: Booking, newStatus: 'Confirmed' | 'Cancelled') => {
        if (!firestore || !user.id) return;
        const bookingRef = doc(firestore, `users/${user.id}/bookings`, booking.id);
        updateDocumentNonBlocking(bookingRef, { status: newStatus });
        
        if (newStatus === 'Confirmed') {
            await sendEmail(
                user.email,
                `Your Booking for ${booking.eventName} is Confirmed!`,
                `Hi ${user.name},\n\nGreat news! Your payment has been confirmed for the event: ${booking.eventName}.\n\n` +
                `You can now download your tickets from your profile page.\n\nEnjoy the event!\n\nThe TicketSwift Team`
            );
        }

        toast({
            title: `Booking ${newStatus}`,
            description: `Booking has been ${newStatus.toLowerCase()}.`,
        });
    };

    const handleCancelBooking = async (user: any, booking: Booking) => {
        if (!firestore || !user.id) return;
        const bookingRef = doc(firestore, `users/${user.id}/bookings`, booking.id);
        updateDocumentNonBlocking(bookingRef, { status: 'Cancelled' });
        
        await sendEmail(
            user.email,
            `Your Booking for ${booking.eventName} has been Cancelled`,
            `Hi ${user.name},\n\nYour booking for the event: ${booking.eventName} has been cancelled by an administrator.\n\n` +
            `If you have any questions, please contact support.\n\nThanks,\nThe TicketSwift Team`
        );

        toast({
            title: `Booking Cancelled`,
            description: `The booking for ${booking.eventName} has been cancelled.`,
            variant: "destructive"
        });
    }
    
    const handleAdminToggle = (user) => {
        if(!firestore) return;

        const userRef = doc(firestore, 'users', user.id);
        const newAdminStatus = !user.isAdmin;
        updateDocumentNonBlocking(userRef, { isAdmin: newAdminStatus });

        toast({
            title: `User Role Updated`,
            description: `${user.name} has been ${newAdminStatus ? 'made an admin' : 'removed as an admin'}.`,
        });
    }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline">Users</h2>
            <p className="text-muted-foreground">Manage user accounts, ID verification, and payments.</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Approve or reject user submissions and manage roles.</CardDescription>
        </CardHeader>
        <CardContent>
            {isLoading && (
                <div className='space-y-2'>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center p-4 space-x-4 border rounded-lg">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                            <Skeleton className="h-6 w-24 rounded-full" />
                            <Skeleton className="h-8 w-8" />
                        </div>
                    ))}
                </div>
            )}
            {error && (
                <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>

                    <AlertDescription>{error.message || 'Failed to load users. Please check your connection or permissions.'}</AlertDescription>
                </Alert>
            )}
          {!isLoading && !error && (
             <Accordion type="single" collapsible className="w-full">
                {(users || []).map((user) => {
                    const status = user.verificationStatus || 'NotSubmitted';
                    const config = statusConfig[status];
                    const Icon = config.icon;

                    return (
                        <AccordionItem value={user.id} key={user.id}>
                            <AccordionTrigger className='px-4 hover:bg-muted/50 rounded-md data-[state=open]:bg-muted/50 data-[state=open]:rounded-b-none transition-colors'>
                                <div className='flex items-center gap-4 flex-1 text-left'>
                                    <Image src={`https://i.pravatar.cc/150?u=${user.id}`} alt={user.name} width={40} height={40} className="rounded-full" />
                                    <div className='flex-1'>
                                        <p className="font-semibold">{user.name}</p>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                    <div className='flex flex-col md:flex-row items-center gap-2'>
                                        <Badge variant={user.verified ? 'default' : config.variant} className='gap-1.5'>
                                            <Icon className={`h-3.5 w-3.5 ${user.verified ? '' : config.className}`} />
                                            {user.verified ? 'Verified' : status}
                                        </Badge>
                                         <Badge variant={user.isAdmin ? "secondary" : "outline"}>
                                            {user.isAdmin ? "Admin" : "User"}
                                        </Badge>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <UserDetails user={user} onVerifyId={handleVerification} onVerifyPayment={handlePaymentVerification} onCancelBooking={handleCancelBooking} />
                            </AccordionContent>
                        </AccordionItem>
                    )
                })}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
