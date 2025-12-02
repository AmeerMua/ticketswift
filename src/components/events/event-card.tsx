
import Image from 'next/image';
import { MapPin, Calendar, AlertTriangle } from 'lucide-react';
import type { Event } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, isPast, differenceInDays } from 'date-fns';

interface EventCardProps {
  event: Event;
  onSelectEvent: (event: Event) => void;
}

export function EventCard({ event, onSelectEvent }: EventCardProps) {
  const isSoldOut = event.ticketCategories.every(
    (cat) => (cat.sold || 0) >= cat.limit
  );

  const isDeadlinePassed = isPast(new Date(event.bookingDeadline));
  const daysLeft = differenceInDays(new Date(event.bookingDeadline), new Date());
  const deadlineText = isDeadlinePassed
    ? 'Booking closed'
    : daysLeft < 0 
    ? 'Booking closed'
    : daysLeft === 0
    ? 'Ends today'
    : `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`;


  return (
    <Card className="flex flex-col overflow-hidden transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg">
      <CardHeader className="p-0">
        <button onClick={() => onSelectEvent(event)} className="block aspect-[3/2] w-full relative focus:outline-none focus:ring-2 focus:ring-primary rounded-t-lg">
          <Image
            src={event.imageUrl}
            alt={event.name}
            data-ai-hint={event.imageHint}
            fill
            className="object-cover"
          />
           {isSoldOut && (
            <Badge variant="destructive" className="absolute top-2 right-2">SOLD OUT</Badge>
          )}
        </button>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <CardTitle className="mb-2 text-xl font-headline">
          <button onClick={() => onSelectEvent(event)} className="text-left hover:text-primary transition-colors">
            {event.name}
          </button>
        </CardTitle>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(event.date), 'PPP')} @ {event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{event.venue}</span>
          </div>
           <div className={`flex items-center gap-2 pt-1 ${isDeadlinePassed ? 'text-destructive' : 'text-amber-600 dark:text-amber-500'}`}>
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">{deadlineText}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button onClick={() => onSelectEvent(event)} className="w-full" size="sm" variant={isSoldOut ? "secondary" : "default"} disabled={isSoldOut || isDeadlinePassed}>
          {isSoldOut || isDeadlinePassed ? 'Booking Closed' : 'Get Tickets'}
        </Button>
      </CardFooter>
    </Card>
  );
}
