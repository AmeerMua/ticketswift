'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { mockEvents } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, MapPin, Ticket, Minus, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useUser } from '@/firebase';
import Link from 'next/link';

export default function EventDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { user, userData } = useUser();

  const event = useMemo(() => mockEvents.find((e) => e.id === id), [id]);

  const [ticketQuantities, setTicketQuantities] = useState<Record<string, number>>(
    event?.ticketCategories.reduce((acc, cat) => ({ ...acc, [cat.id]: 0 }), {}) || {}
  );

  if (!event) {
    return notFound();
  }
  
  const handleQuantityChange = (categoryId: string, delta: number) => {
    setTicketQuantities((prev) => {
      const currentQuantity = prev[categoryId] || 0;
      const newQuantity = Math.max(0, currentQuantity + delta);
      // Optional: Add a check against ticket limits here in a real app
      return { ...prev, [categoryId]: newQuantity };
    });
  };

  const totalTickets = Object.values(ticketQuantities).reduce((acc, q) => acc + q, 0);
  const totalPrice = event.ticketCategories.reduce((acc, cat) => {
    return acc + (ticketQuantities[cat.id] || 0) * cat.price;
  }, 0);
  
  const isBookingDisabled = () => {
    if (!user) return true;
    if (!userData) return true;
    // Check for the `verified` field which is a boolean, not verificationStatus
    return userData.verified !== true;
  };

  const bookingDisabled = isBookingDisabled();

  const getDisabledMessage = () => {
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


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-5 gap-8">
        <div className="md:col-span-3">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl mb-6 shadow-lg">
            <Image
              src={event.imageUrl}
              alt={event.name}
              data-ai-hint={event.imageHint}
              fill
              className="object-cover"
            />
          </div>
          <h1 className="text-4xl font-bold font-headline mb-4">{event.name}</h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground mb-6">
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
          <Separator className="my-6" />
          <h2 className="text-2xl font-bold font-headline mb-4">About this event</h2>
          <p className="text-muted-foreground leading-relaxed">{event.description}</p>
        </div>
        <div className="md:col-span-2">
          <Card className="sticky top-24 shadow-md">
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center gap-2">
                <Ticket className="h-6 w-6 text-primary" />
                Get Your Tickets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {event.ticketCategories.map((category) => (
                <div key={category.id} className="p-4 border rounded-md flex justify-between items-center bg-muted/20">
                  <div>
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="text-sm text-primary font-bold">
                      ${category.price.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {category.limit - category.sold} remaining
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleQuantityChange(category.id, -1)}
                      disabled={ticketQuantities[category.id] === 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      className="h-8 w-14 text-center"
                      value={ticketQuantities[category.id]}
                      readOnly
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleQuantityChange(category.id, 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex flex-col gap-4 items-stretch">
                {totalTickets > 0 && (
                    <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total:</span>
                        <span>${totalPrice.toFixed(2)}</span>
                    </div>
                )}
                 {bookingDisabled && (
                    <div className="text-center p-3 rounded-md border border-destructive/50 bg-destructive/10 text-destructive-foreground text-sm">
                        {getDisabledMessage()}
                    </div>
                 )}
              <Button size="lg" disabled={totalTickets === 0 || bookingDisabled}>
                {totalTickets > 0 ? `Book ${totalTickets} Ticket${totalTickets > 1 ? 's' : ''}` : 'Select Tickets'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
