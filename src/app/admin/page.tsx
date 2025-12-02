
'use client';

import { DollarSign, Ticket, Users, Activity } from 'lucide-react';
import { StatCard } from '@/components/admin/stat-card';
import { SalesChart } from '@/components/admin/sales-chart';
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
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useUser } from '@/firebase';

export default function AdminDashboardPage() {
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();

    // Fetch all bookings to calculate total revenue and tickets sold
    const bookingsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'bookings');
    }, [firestore]);

    const { data: bookings, isLoading: bookingsLoading } = useCollection(bookingsQuery);
    
    // Fetch all users to count them
    const usersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'users');
    }, [firestore]);

    const { data: users, isLoading: usersLoading } = useCollection(usersQuery);

    // Fetch active events
    const eventsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'events');
    }, [firestore]);

    const { data: events, isLoading: eventsLoading } = useCollection(eventsQuery);

    const recentSalesQuery = useMemoFirebase(() => {
        if (!firestore || !bookings) return null;
        return query(collection(firestore, 'bookings'), orderBy('bookingDate', 'desc'), limit(5));
    }, [firestore, bookings]);

    const { data: recentSales, isLoading: recentSalesLoading } = useCollection(recentSalesQuery);

    const totalRevenue = bookings ? bookings.reduce((acc, booking) => acc + booking.totalAmount, 0) : 0;
    const ticketsSold = bookings ? bookings.reduce((acc, booking) => acc + booking.numberOfTickets, 0) : 0;
    const userCount = users ? users.length : 0;
    const activeEvents = events ? events.filter(event => new Date(event.date) >= new Date()).length : 0;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Revenue" 
          value={`Rs.${totalRevenue.toLocaleString()}`}
          icon={<span>RS</span>}
          description="+20.1% from last month"
          isLoading={bookingsLoading}
        />
        <StatCard 
          title="Tickets Sold" 
          value={ticketsSold.toString()}
          icon={<Ticket />}
          description="+180.1% from last month"
          isLoading={bookingsLoading}
        />
        <StatCard 
          title="New Users" 
          value={`+${userCount}`}
          icon={<Users />}
          description="+30 from last month"
          isLoading={usersLoading}
        />
        <StatCard 
          title="Active Events" 
          value={activeEvents.toString()}
          icon={<Activity />}
          isLoading={eventsLoading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
            <SalesChart />
        </div>
        <div className="lg:col-span-3">
             <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle>Sold Out Events</CardTitle>
                    <CardDescription>Events that have reached their ticket limit.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {eventsLoading && <p>Loading events...</p>}
                        {!eventsLoading && events?.filter(e => e.ticketCategories.every(tc => (tc.sold || 0) >= tc.limit)).map(event => (
                            <div key={event.id} className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">{event.name}</p>
                                    <p className="text-sm text-muted-foreground">{event.venue}</p>
                                </div>
                                <div className="ml-auto font-medium"><Badge variant="destructive">Sold Out</Badge></div>
                            </div>
                        ))}
                         {!eventsLoading && events?.filter(e => e.ticketCategories.every(tc => (tc.sold || 0) >= tc.limit)).length === 0 && (
                            <p className='text-sm text-muted-foreground'>No sold out events yet.</p>
                         )}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead className='text-right'>Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recentSalesLoading && <TableRow><TableCell colSpan={3}>Loading recent sales...</TableCell></TableRow>}
                    {!recentSalesLoading && recentSales?.map(sale => (
                        <TableRow key={sale.id}>
                            <TableCell>
                                <div className="font-medium">{sale.userName || 'N/A'}</div>
                                <div className="text-sm text-muted-foreground">{sale.userEmail || 'N/A'}</div>
                            </TableCell>
                            <TableCell>
                                {sale.eventName || 'N/A'}
                            </TableCell>
                            <TableCell className='text-right'>Rs.{sale.totalAmount.toLocaleString()}</TableCell>
                        </TableRow>
                    ))}
                    {!recentSalesLoading && (!recentSales || recentSales.length === 0) && (
                         <TableRow><TableCell colSpan={3} className='text-center'>No recent sales.</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
