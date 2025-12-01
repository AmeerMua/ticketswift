'use client';

import { Booking, Ticket } from '@/lib/types';
import { User } from 'firebase/auth';
import { Separator } from '../ui/separator';
import { Ticket as TicketIcon } from 'lucide-react';
import QRCode from 'react-qr-code';
import { format } from 'date-fns';

interface TicketPDFProps {
  booking: Booking;
  ticket: Ticket;
  user: User | null;
}

export function TicketPDF({ booking, ticket, user }: TicketPDFProps) {
    if (!user) return null;

    const qrValue = JSON.stringify({
        userId: user.uid,
        bookingId: booking.id,
        ticketId: ticket.id
    });

  return (
    <div 
      data-ticket-booking-id={booking.id}
      className="p-8 border rounded-lg bg-white text-black" 
      style={{ width: '595px', height: '842px', fontFamily: 'sans-serif' }}
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <TicketIcon className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">TicketSwift</h1>
        </div>
        <div className="text-right">
          <p className="font-semibold">{ticket.categoryName} Ticket</p>
          <p className="text-sm text-gray-600">Booking ID: {booking.id}</p>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div>
            <p className="text-sm text-gray-500">EVENT</p>
            <h2 className="text-2xl font-bold">{booking.eventName}</h2>
          </div>
          <div>
            <p className="text-sm text-gray-500">DATE & TIME</p>
            <p className="font-medium">{booking.eventDate ? format(new Date(booking.eventDate), 'PPP') : 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">TICKET HOLDER</p>
            <p className="font-medium">{user.displayName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">TICKET ID</p>
            <p className="font-mono text-xs">{ticket.id}</p>
          </div>
        </div>
        <div className="col-span-1 flex flex-col items-center justify-center">
            <div className="bg-white p-2 rounded-md shadow-md">
                 <QRCode value={qrValue} size={128} />
            </div>
            <p className="text-xs text-gray-500 mt-2">Scan for entry</p>
        </div>
      </div>
      
      <Separator className="my-6" />

      <div>
        <h3 className="font-bold text-lg mb-2">Terms & Conditions</h3>
        <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
            <li>This ticket is non-transferable and non-refundable.</li>
            <li>Entry will be permitted only upon scanning this QR code.</li>
            <li>The management reserves the right to refuse admission.</li>
            <li>Outside food and beverages are not allowed.</li>
        </ul>
      </div>

       <div className='text-center mt-24 text-xs text-gray-400'>
            <p>Thank you for booking with TicketSwift!</p>
       </div>
    </div>
  );
}
