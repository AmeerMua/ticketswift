
'use client';

import Link from 'next/link';
import { PlusCircle, MoreHorizontal, Edit, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
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
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Event } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function AdminEventsPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const eventsQuery = useMemoFirebase(
        () => (firestore ? collection(firestore, 'events') : null),
        [firestore]
    );
    const { data: events, isLoading } = useCollection<Event>(eventsQuery);

    const [editingEventId, setEditingEventId] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState<Partial<Event>>({});

    const getTotalTickets = (event) => event.ticketCategories.reduce((acc, cat) => acc + cat.limit, 0);
    const getTotalSold = (event) => event.ticketCategories.reduce((acc, cat) => acc + cat.sold, 0);
    
    const handleEditClick = (event: Event) => {
        setEditingEventId(event.id);
        setEditFormData({
            ...event,
            date: format(new Date(event.date), 'yyyy-MM-dd')
        });
    };

    const handleCancelClick = () => {
        setEditingEventId(null);
        setEditFormData({});
    };

    const handleSaveClick = async (eventId: string) => {
        if (!firestore || !editFormData) return;

        const eventRef = doc(firestore, 'events', eventId);
        // We only allow editing of name, date, time and venue here
        const { name, date, time, venue } = editFormData;
        updateDocumentNonBlocking(eventRef, { name, date, time, venue });

        toast({
            title: 'Event Updated',
            description: `The event "${name}" has been successfully updated.`,
        });

        setEditingEventId(null);
        setEditFormData({});
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

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
        <CardContent className="pt-6">
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
              {!isLoading && events?.map((event) => {
                const isEditing = editingEventId === event.id;
                return isEditing ? (
                    <TableRow key={event.id} className="bg-muted/50">
                        <TableCell className="font-medium">
                           <Input name="name" value={editFormData.name} onChange={handleInputChange} className="h-8" />
                           <Input name="venue" value={editFormData.venue} onChange={handleInputChange} className="h-8 mt-1 text-xs" />
                        </TableCell>
                        <TableCell>
                           <Input name="date" type="date" value={editFormData.date} onChange={handleInputChange} className="h-8" />
                           <Input name="time" type="time" value={editFormData.time} onChange={handleInputChange} className="h-8 mt-1" />
                        </TableCell>
                         <TableCell className="text-center">
                             <Badge variant={new Date(event.date) > new Date() ? 'outline' : 'secondary'}>
                                {new Date(event.date) > new Date() ? 'Upcoming' : 'Past'}
                            </Badge>
                         </TableCell>
                        <TableCell className="text-right">{getTotalSold(event)} / {getTotalTickets(event)}</TableCell>
                        <TableCell className="text-right">
                           <div className='flex justify-end gap-2'>
                                <Button size="icon" variant="ghost" className='h-8 w-8' onClick={handleCancelClick}><X className='h-4 w-4'/></Button>
                                <Button size="icon" className='h-8 w-8' onClick={() => handleSaveClick(event.id)}><Save className='h-4 w-4'/></Button>
                           </div>
                        </TableCell>
                    </TableRow>
                ) : (
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
                                <DropdownMenuItem onClick={() => handleEditClick(event)}>
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                )
              })}
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
