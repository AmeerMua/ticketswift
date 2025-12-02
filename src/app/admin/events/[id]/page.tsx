'use client';

import { useParams, useRouter, notFound } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useFirestore, useDoc, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Trash2, PlusCircle, Loader2 } from 'lucide-react';
import { Event } from '@/lib/types';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

const ticketCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Category name is required.'),
  price: z.coerce.number().min(0, 'Price must be a positive number.'),
  limit: z.coerce.number().int().min(1, 'Limit must be at least 1.'),
  sold: z.coerce.number().int().min(0),
});

const eventFormSchema = z.object({
  name: z.string().min(3, 'Event name must be at least 3 characters long.'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'A valid date is required.',
  }),
  time: z.string().min(1, 'Time is required.'),
  venue: z.string().min(3, 'Venue is required.'),
  description: z.string().min(10, 'Description must be at least 10 characters long.'),
  ticketCategories: z.array(ticketCategorySchema).min(1, 'At least one ticket category is required.'),
  bookingDeadline: z.string().optional(),
  category: z.string().min(1, 'Category is required.'),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const firestore = useFirestore();
  const { toast } = useToast();

  const eventRef = useMemoFirebase(() => (firestore && id ? doc(firestore, 'events', id) : null), [firestore, id]);
  const { data: event, isLoading: isLoadingEvent } = useDoc<Event>(eventRef);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
        ticketCategories: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'ticketCategories',
  });

  useEffect(() => {
    if (event) {
        form.reset({
            ...event,
            date: format(new Date(event.date), 'yyyy-MM-dd'),
            bookingDeadline: event.bookingDeadline ? format(new Date(event.bookingDeadline), 'yyyy-MM-dd') : undefined,
        });
    }
  }, [event, form]);

  const onSubmit = async (data: EventFormValues) => {
    if (!firestore || !event) return;
    
    const eventData = {
      ...data,
      // Ensure 'sold' is preserved for existing categories and initialized for new ones
      ticketCategories: data.ticketCategories.map(cat => {
        const existingCat = event.ticketCategories.find(ec => ec.id === cat.id);
        return {
            ...cat,
            sold: existingCat ? existingCat.sold : 0,
        };
      })
    };
    
    updateDocumentNonBlocking(eventRef, eventData);

    toast({
      title: 'Event Updated',
      description: `The event "${data.name}" has been successfully updated.`,
    });

    router.push('/admin/events');
  };
  
  if (isLoadingEvent) {
      return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className='space-y-6'>
                    <div className='grid md:grid-cols-2 gap-6'>
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className='h-24 w-full' />
                    <Skeleton className='h-32 w-full' />
                    <div className='flex justify-end'>
                        <Skeleton className='h-10 w-32' />
                    </div>
                </CardContent>
            </Card>
        </div>
      );
  }

  if (!event) {
      return notFound();
  }


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Edit Event</CardTitle>
          <CardDescription>Update the details for "{event.name}".</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Starlight Music Festival" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="venue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Venue</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Greenfield Park" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Music" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="bookingDeadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Booking Deadline (Optional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                        <Textarea
                            placeholder="Tell your attendees about the event..."
                            className="resize-y min-h-[100px]"
                            {...field}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <div>
                    <h3 className="text-lg font-medium">Ticket Categories</h3>
                    <div className="space-y-4 mt-2">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex flex-col md:flex-row items-start gap-4 p-4 border rounded-lg">
                        <FormField
                            control={form.control}
                            name={`ticketCategories.${index}.name`}
                            render={({ field }) => (
                            <FormItem className='flex-1 w-full'>
                                <FormLabel>Category Name</FormLabel>
                                <FormControl>
                                <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`ticketCategories.${index}.price`}
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Price (Rs.)</FormLabel>
                                <FormControl>
                                <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`ticketCategories.${index}.limit`}
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ticket Limit</FormLabel>
                                <FormControl>
                                <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => remove(index)}
                            className="mt-auto"
                            disabled={fields.length <= 1}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                     <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ id: `new-${Date.now()}`, name: '', price: 0, limit: 50, sold: 0 })}
                        >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Category
                    </Button>
                    {form.formState.errors.ticketCategories?.root && (
                        <p className='text-sm font-medium text-destructive'>{form.formState.errors.ticketCategories.root.message}</p>
                    )}
                    </div>
                </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => router.push('/admin/events')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
