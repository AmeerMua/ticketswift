import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Calendar } from 'lucide-react';
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
import { format } from 'date-fns';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const isSoldOut = event.ticketCategories.every(
    (cat) => cat.sold >= cat.limit
  );

  return (
    <Card className="flex flex-col overflow-hidden transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg">
      <CardHeader className="p-0">
        <Link href={`/events/${event.id}`} className="block aspect-[3/2] w-full relative">
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
        </Link>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <CardTitle className="mb-2 text-xl font-headline">
          <Link href={`/events/${event.id}`} className="hover:text-primary transition-colors">
            {event.name}
          </Link>
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
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full" size="sm" variant={isSoldOut ? "secondary" : "default"} disabled={isSoldOut}>
          <Link href={`/events/${event.id}`}>
            {isSoldOut ? 'Sold Out' : 'Get Tickets'}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
