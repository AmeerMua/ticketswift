
'use client';

import { useParams, notFound, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Event } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, DollarSign, Edit, MapPin, Ticket, Users } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}


export default function AdminEventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const firestore = useFirestore();

  const eventRef = useMemoFirebase(() => (firestore && id ? doc(firestore, 'events', id) : null), [firestore, id]);
  const { data: event, isLoading: isLoadingEvent } = useDoc<Event>(eventRef);
  
  if (isLoadingEvent) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return notFound();
  }
  
  const totalTickets = event.ticketCategories.reduce((acc, cat) => acc + cat.limit, 0);
  const totalSold = event.ticketCategories.reduce((acc, cat) => acc + cat.sold, 0);
  const totalRevenue = event.ticketCategories.reduce((acc, cat) => acc + (cat.sold * cat.price), 0);
  const salesProgress = totalTickets > 0 ? (totalSold / totalTickets) * 100 : 0;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4 mb-4">
         <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight font-headline">{event.name}</h2>
        <Button size="sm" variant="outline" className="ml-auto">
            <Edit className="mr-2 h-4 w-4"/>
            Edit Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Event Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl mb-6">
                        <Image src={event.imageUrl} alt={event.name} fill className="object-cover" />
                    </div>
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
                    <p className="text-muted-foreground leading-relaxed">{event.description}</p>
                </CardContent>
            </Card>
        </div>

        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Sales Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <StatCard 
                        title="Total Revenue" 
                        value={`Rs. ${totalRevenue.toLocaleString()}`} 
                        icon={<DollarSign className="h-4 w-4 text-muted-foreground"/>}
                    />
                     <StatCard 
                        title="Tickets Sold" 
                        value={`${totalSold} / ${totalTickets}`} 
                        icon={<Ticket className="h-4 w-4 text-muted-foreground"/>}
                    />
                    <div>
                        <div className='flex justify-between items-center mb-1'>
                            <p className='text-sm font-medium'>Sales Progress</p>
                            <p className='text-sm font-bold'>{salesProgress.toFixed(1)}%</p>
                        </div>
                        <Progress value={salesProgress} className='h-2' />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Ticket Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {event.ticketCategories.map(cat => (
                        <div key={cat.id} className="p-3 border rounded-md bg-muted/20">
                            <div className="flex justify-between items-center">
                                <p className="font-semibold">{cat.name}</p>
                                <p className="text-sm font-bold">Rs. {cat.price}</p>
                            </div>
                            <div className="flex justify-between items-center mt-1 text-xs text-muted-foreground">
                                <span>Sold: {cat.sold} / {cat.limit}</span>
                                <span>Revenue: Rs. {(cat.sold * cat.price).toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>

      </div>
    </div>
  );
}
