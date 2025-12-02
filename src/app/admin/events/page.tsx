
'use client';

import Link from 'next/link';
import { PlusCircle, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useCollection, useFirestore, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Event } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
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

export default function AdminEventsPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const eventsQuery = useMemoFirebase(
        () => (firestore ? collection(firestore, 'events') : null),
        [firestore]
    );
    const { data: events, isLoading } = useCollection<Event>(eventsQuery);

    const getTotalTickets = (event: Event) => event.ticketCategories.reduce((acc, cat) => acc + cat.limit, 0);
    const getTotalSold = (event: Event) => event.ticketCategories.reduce((acc, cat) => acc + cat.sold, 0);
    
    const handleDeleteEvent = (eventId: string, eventName: string) => {
        if (!firestore) return;
        const eventRef = doc(firestore, 'events', eventId);
        deleteDocumentNonBlocking(eventRef);

        toast({
            title: 'Event Deleted',
            description: `The event "${eventName}" has been successfully deleted.`,
            variant: 'destructive',
        });
    }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline">Events</h2>
            <p className="text-muted-foreground">Manage your events and view their sales performance.</p>
        </div>
        <div className="flex items-center space-x-2">
            <Button asChild>
                <Link href="/admin/events/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Event
                </Link>
            </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Events List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead className='text-center'>Status</TableHead>
                <TableHead className="text-right">Tickets Sold</TableHead>
                <TableHead className='text-right'>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && [...Array(3)].map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className='text-center'><Skeleton className="h-5 w-20 mx-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))}
              {!isLoading && events?.map((event) => (
                <TableRow key={event.id}>
                    <TableCell className="font-medium">
                        <div className="font-medium">{event.name}</div>
                        <div className="text-sm text-muted-foreground">{event.venue}</div>
                    </TableCell>
                    <TableCell>{format(new Date(event.date), "PPP")} at {event.time}</TableCell>
                    <TableCell className="text-center">
                        <Badge variant={new Date(event.date) > new Date() ? 'outline' : 'secondary'}>
                        {new Date(event.date) > new Date() ? 'Upcoming' : 'Past'}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">{getTotalSold(event)} / {getTotalTickets(event)}</TableCell>
                    <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link href={`/admin/events/${event.id}`}>
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                </Link>
                            </DropdownMenuItem>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" className='w-full text-sm text-destructive hover:bg-destructive/10 hover:text-destructive justify-start px-2 py-1.5 relative select-none items-center rounded-sm font-normal'>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the event "{event.name}".
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            className='bg-destructive hover:bg-destructive/90'
                                            onClick={() => handleDeleteEvent(event.id, event.name)}
                                        >
                                            Yes, delete it
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                </TableRow>
              ))}
               {!isLoading && events?.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        No events found.
                    </TableCell>
                </TableRow>
               )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
