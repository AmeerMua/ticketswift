
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, MapPin, Ticket, Minus, Plus, AlertTriangle } from 'lucide-react';
import { format, differenceInDays, isPast } from 'date-fns';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { PaymentSubmissionDialog } from '@/components/events/payment-submission-dialog';
import { collection } from 'firebase/firestore';
import { logAuditEvent } from '@/lib/audit';
import { Event } from '@/lib/types';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EventDetailDialogProps {
    event: Event;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EventDetailDialog({ event, isOpen, onOpenChange }: EventDetailDialogProps) {
  const { user, userData } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [ticketQuantities, setTicketQuantities] = useState<Record<string, number>>({});
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  useEffect(() => {
    if (event && event.ticketCategories) {
        setTicketQuantities(
            event.ticketCategories.reduce((acc, cat) => ({ ...acc, [cat.id]: 0 }), {})
        );
    }
  }, [event]);

  if (!event) {
    return null;
  }
  
  const handleQuantityChange = (categoryId: string, delta: number) => {
    setTicketQuantities((prev) => {
      const currentTotal = Object.values(prev).reduce((sum, qty) => sum + qty, 0);

      if (delta > 0 && currentTotal >= 3) {
        toast({
          variant: 'destructive',
          title: 'Booking Limit Reached',
          description: 'You can book a maximum of 3 tickets per event.',
        });
        return prev;
      }

      const currentQuantity = prev[categoryId] || 0;
      const newQuantity = Math.max(0, currentQuantity + delta);
      
      const newTotal = currentTotal - currentQuantity + newQuantity;

      if (newTotal > 3) {
         toast({
          variant: 'destructive',
          title: 'Booking Limit Exceeded',
          description: 'You can book a maximum of 3 tickets per event.',
        });
        const adjustedNewQuantity = newQuantity - (newTotal - 3);
        return { ...prev, [categoryId]: adjustedNewQuantity };
      }

      return { ...prev, [categoryId]: newQuantity };
    });
  };

  const totalTickets = Object.values(ticketQuantities).reduce((acc, q) => acc + q, 0);
  const totalPrice = event.ticketCategories.reduce((acc, cat) => {
    return acc + (ticketQuantities[cat.id] || 0) * cat.price;
  }, 0);
  
  const isDeadlinePassed = isPast(new Date(event.bookingDeadline));

  const isBookingDisabled = () => {
    if (isDeadlinePassed) return true;
    if (!user || !userData || userData.verified !== true) return true;
    return false;
  };

  const bookingDisabled = isBookingDisabled();

  const getDisabledMessage = () => {
    if (isDeadlinePassed) {
        return <p>Booking for this event has closed.</p>;
    }
    if (!user) {
        return <p>Please <Link href="/login" className="font-bold underline">log in</Link> to book tickets.</p>;
    }
    if (!userData?.verified) {
        switch (userData?.verificationStatus) {
            case 'Pending':
                return <p>Your ID verification is pending. You can book tickets once approved.</p>;
            case 'Rejected':
                return <p>Your ID verification was rejected. Please <Link href="/verify-id" className="font-bold underline">resubmit your ID</Link>.</p>;
            default:
                return <p>Please complete your <Link href="/verify-id" className="font-bold underline">ID verification</Link> to book tickets.</p>;
        }
    }
    return null;
  };
  
  const daysLeft = differenceInDays(new Date(event.bookingDeadline), new Date());
  const deadlineText = isDeadlinePassed
    ? 'Booking closed'
    : daysLeft === 0
    ? 'Ends today'
    : `${daysLeft} day${daysLeft > 1 ? 's' : ''} left to book`;


  const handleBookingSubmit = async (screenshotFile: File) => {
    if (!user || !firestore) return;

    // In a real app, you would upload this file to Firebase Storage first
    const screenshotUrl = 'placeholder/screenshot.jpg';
    
    const tickets = Object.entries(ticketQuantities)
      .filter(([, qty]) => qty > 0)
      .flatMap(([categoryId, quantity]) => {
        const category = event.ticketCategories.find(c => c.id === categoryId);
        if (!category) return [];

        return Array.from({ length: quantity }, (_, i) => ({
          id: `${categoryId}-${Date.now()}-${i}`,
          bookingId: '', // This will be set after booking is created
          eventId: event.id,
          userId: user.uid,
          categoryName: category.name,
          price: category.price,
        }));
      });
      
    const bookingData = {
        userId: user.uid,
        eventId: event.id,
        eventName: event.name,
        eventDate: event.date,
        tickets: tickets,
        totalAmount: totalPrice,
        bookingDate: new Date().toISOString(),
        status: 'PaymentPending',
        paymentScreenshotUrl: screenshotUrl,
        numberOfTickets: totalTickets,
    };

    const bookingsRef = collection(firestore, `users/${user.uid}/bookings`);
    const bookingDocRef = await addDocumentNonBlocking(bookingsRef, bookingData);

    if (bookingDocRef) {
        logAuditEvent(firestore, {
          userId: user.uid,
          action: 'create-booking',
          details: {
            bookingId: bookingDocRef.id,
            eventId: event.id,
            numberOfTickets: totalTickets,
            totalPrice: totalPrice,
          },
        });

        setIsPaymentDialogOpen(false);
        toast({
          title: 'Submission Received!',
          description: 'Thank you for purchasing tickets. After confirmation of your payment, you will be able to download them from your profile.',
        });

        setTicketQuantities(event.ticketCategories.reduce((acc, cat) => ({ ...acc, [cat.id]: 0 }), {}));
        onOpenChange(false); // Close the dialog on successful booking
    }
  };

  return (
    <>
      <PaymentSubmissionDialog 
          isOpen={isPaymentDialogOpen}
          onOpenChange={setIsPaymentDialogOpen}
          onSubmit={handleBookingSubmit}
          totalPrice={totalPrice}
      />
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl w-full h-[90vh] flex flex-col p-0">
          <ScrollArea className="h-full">
            <div className="p-6 md:p-8">
                <div className='grid md:grid-cols-5 gap-8'>

                    <div className="md:col-span-3 space-y-6">
                        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl">
                            <Image
                                src={event.imageUrl}
                                alt={event.name}
                                data-ai-hint={event.imageHint}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className='space-y-2'>
                            <h1 className="text-4xl font-bold font-headline">{event.name}</h1>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground">
                                <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{format(new Date(event.date), 'PPP')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{event.time}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{event.venue}</span>
                                </div>
                            </div>
                        </div>

                        <Separator />
                        
                        <div>
                            <h2 className="text-xl font-bold font-headline mb-2">About this event</h2>
                            <p className="text-muted-foreground leading-relaxed">{event.description}</p>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <div className="sticky top-6 space-y-4">
                            <h3 className="font-headline text-2xl flex items-center gap-2">
                                <Ticket className="h-6 w-6 text-primary" />
                                Get Your Tickets
                            </h3>
                            <div className='p-3 border rounded-lg flex justify-between items-center bg-muted/30 text-sm'>
                                <div className='flex items-center gap-2'>
                                    <AlertTriangle className={`h-4 w-4 ${isDeadlinePassed ? 'text-destructive' : 'text-amber-600'}`}/>
                                    <span className='font-medium'>Booking Deadline</span>
                                </div>
                                <span className={`${isDeadlinePassed ? 'text-destructive' : 'text-muted-foreground'}`}>{deadlineText}</span>
                            </div>
                            <div className="space-y-3">
                                {event.ticketCategories.map((category) => (
                                    <div key={category.id} className="p-4 border rounded-lg flex justify-between items-center bg-muted/20">
                                    <div>
                                        <h3 className="font-semibold">{category.name}</h3>
                                        <p className="text-sm text-primary font-bold">
                                        Rs.{category.price.toFixed(2)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                        {category.limit - (category.sold || 0)} remaining
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleQuantityChange(category.id, -1)}
                                        disabled={(ticketQuantities[category.id] || 0) === 0}
                                        >
                                        <Minus className="h-4 w-4" />
                                        </Button>
                                        <Input
                                        type="number"
                                        className="h-8 w-12 text-center"
                                        value={ticketQuantities[category.id] || 0}
                                        readOnly
                                        />
                                        <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleQuantityChange(category.id, 1)}
                                        disabled={totalTickets >= 3 || (category.limit - (category.sold || 0)) <= (ticketQuantities[category.id] || 0) }
                                        >
                                        <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    </div>
                                ))}
                            </div>
                             <div className="flex flex-col gap-4 items-stretch">
                                {totalTickets > 0 && (
                                    <div className="flex justify-between items-center text-lg font-bold">
                                        <span>Total:</span>
                                        <span>Rs.{totalPrice.toFixed(2)}</span>
                                    </div>
                                )}
                                {bookingDisabled && (
                                    <div className="text-center p-3 rounded-md border border-destructive/50 bg-destructive/10 text-destructive-foreground text-sm">
                                        {getDisabledMessage()}
                                    </div>

                                )}
                                <Button size="lg" disabled={totalTickets === 0 || bookingDisabled} onClick={() => setIsPaymentDialogOpen(true)}>
                                    {totalTickets > 0 ? `Book ${totalTickets} Ticket${totalTickets > 1 ? 's' : ''}` : 'Select Tickets'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
