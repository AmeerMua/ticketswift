'use client';

import { useState } from 'react';
import { useUser, cancelUserBooking, useFirestore } from '@/firebase';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Download, Loader2, Ban } from 'lucide-react';
import { format } from 'date-fns';
import { TicketPDF } from './ticket-pdf';
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
import { useToast } from '@/hooks/use-toast';
import { doc } from 'firebase/firestore';


const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  Confirmed: 'default',
  PaymentPending: 'secondary',
  Cancelled: 'destructive',
};

export function BookingHistory() {
  const { user, userBookings, isUserBookingsLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const handleDownload = async (booking: any) => {
    if (!user) return;
    setIsGenerating(booking.id);

    // Dynamically import libraries for client-side PDF generation
    const jsPDF = (await import('jspdf')).default;
    const html2canvas = (await import('html2canvas')).default;

    const ticketElements = document.querySelectorAll<HTMLElement>(`[data-ticket-booking-id="${booking.id}"]`);
    if (ticketElements.length === 0) {
      console.error('Could not find ticket elements to generate PDF.');
      setIsGenerating(null);
      return;
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    for (let i = 0; i < ticketElements.length; i++) {
      const ticketElement = ticketElements[i];
      const canvas = await html2canvas(ticketElement, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;
      const widthInPdf = pdfWidth - 40; // with margin
      const heightInPdf = widthInPdf / ratio;

      if (i > 0) {
        pdf.addPage();
      }
      pdf.addImage(imgData, 'PNG', 20, 20, widthInPdf, heightInPdf);
    }
    
    pdf.save(`TicketSwift-Tickets-${booking.id}.pdf`);
    setIsGenerating(null);
  };
  
  const handleCancelBooking = (bookingId: string) => {
    if (!user || !firestore) return;
    
    const bookingRef = doc(firestore, `users/${user.uid}/bookings`, bookingId);
    cancelUserBooking(bookingRef);

    toast({
        title: "Booking Cancelled",
        description: "Your booking has been successfully cancelled.",
    });
  }

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">My Bookings</CardTitle>
        <CardDescription>View your past and upcoming event bookings.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isUserBookingsLoading && <p>Loading bookings...</p>}
        {!isUserBookingsLoading && (!userBookings || userBookings.length === 0) && (
          <div className='text-center py-8 bg-muted/50 rounded-lg'>
            <p className='text-muted-foreground'>You haven't booked any tickets yet.</p>
          </div>
        )}
        {!isUserBookingsLoading && userBookings && userBookings.map((booking) => (
          <div key={booking.id} className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-grow">
              <h3 className="font-semibold">{booking.eventName || `Event ID: ${booking.eventId}`}</h3>
              <p className="text-sm text-muted-foreground">
                {booking.eventDate ? format(new Date(booking.eventDate), 'PPP') : 'Date not available'}
              </p>
              <p className="text-sm text-muted-foreground">
                {booking.tickets.length} Ticket{booking.tickets.length > 1 ? 's' : ''} &bull; Total: ${booking.totalAmount.toFixed(2)}
              </p>
            </div>
            <div className="flex flex-col items-stretch sm:items-end gap-2 w-full sm:w-auto">
                <Badge variant={statusVariant[booking.status] || 'outline'} className="self-end">
                    {booking.status}
                </Badge>
                {booking.status === 'Confirmed' && (
                    <Button 
                        size="sm"
                        disabled={isGenerating === booking.id}
                        onClick={() => handleDownload(booking)}
                        className='mt-2'
                    >
                        {isGenerating === booking.id ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Download className="mr-2 h-4 w-4" />
                                Download Ticket
                            </>
                        )}
                    </Button>
                )}
                {booking.status !== 'Cancelled' && (
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive h-8 text-xs hover:bg-destructive/10 hover:text-destructive mt-1"
                            >
                                <Ban className='mr-2 h-3 w-3' />
                                Cancel Booking
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently cancel your booking for "{booking.eventName}". This action cannot be undone.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Back</AlertDialogCancel>
                            <AlertDialogAction
                                className='bg-destructive hover:bg-destructive/90'
                                onClick={() => handleCancelBooking(booking.id)}>
                                Yes, Cancel Booking
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>

    {/* Hidden tickets for PDF generation */}
    <div className='absolute -left-[9999px] top-0'>
      {userBookings?.filter(b => b.status === 'Confirmed').map(booking => (
        booking.tickets.map(ticket => (
          <TicketPDF key={ticket.id} booking={booking} ticket={ticket} user={user} />
        ))
      ))}
    </div>
    </>
  );
}
