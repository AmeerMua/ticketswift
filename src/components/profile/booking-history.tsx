'use client';

import { useState } from 'react';
import { useUser } from '@/firebase';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Download, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { TicketPDF } from './ticket-pdf';

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  Confirmed: 'default',
  PaymentPending: 'secondary',
  Cancelled: 'destructive',
};

export function BookingHistory() {
  const { user, userBookings, isUserBookingsLoading } = useUser();
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
                <Button 
                    size="sm"
                    disabled={booking.status !== 'Confirmed' || isGenerating === booking.id}
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
