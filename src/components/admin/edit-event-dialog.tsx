
'use client';

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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Trash2, PlusCircle, Loader2 } from 'lucide-react';
import { Event } from '@/lib/types';
import { useEffect } from 'react';
import { format } from 'date-fns';
import { ScrollArea } from '../ui/scroll-area';

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
  bookingDeadline: z.string().refine((val) => val && !isNaN(Date.parse(val)), { message: 'A valid booking deadline is required.' }),
  category: z.string().min(1, 'Category is required.'),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EditEventDialogProps {
    event: Event;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditEventDialog({ event, isOpen, onOpenChange }: EditEventDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();

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
            bookingDeadline: event.bookingDeadline ? format(new Date(event.bookingDeadline), 'yyyy-MM-dd') : '',
            ticketCategories: event.ticketCategories.map(cat => ({ ...cat, sold: cat.sold || 0 })),
        });
    }
  }, [event, form]);

  const onSubmit = async (data: EventFormValues) => {
    if (!firestore || !event) return;
    const eventRef = doc(firestore, 'events', event.id);
    
    updateDocumentNonBlocking(eventRef, data);

    toast({
      title: 'Event Updated',
      description: `The event "${data.name}" has been successfully updated.`,
    });

    onOpenChange(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-headline">Edit Event</DialogTitle>
          <DialogDescription>Update the details for "{event.name}".</DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <ScrollArea className='h-[60vh] pr-6'>
                    <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
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
                                    <FormLabel>Booking Deadline</FormLabel>
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
                            <h3 className="text-md font-medium">Ticket Categories</h3>
                            <div className="space-y-4 mt-2">
                            {fields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-[1fr,auto,auto,auto] items-end gap-2 p-3 border rounded-lg">
                                <FormField
                                    control={form.control}
                                    name={`ticketCategories.${index}.name`}
                                    render={({ field }) => (
                                    <FormItem>
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
                                        <FormLabel>Price</FormLabel>
                                        <FormControl>
                                        <Input type="number" {...field} className='w-24'/>
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
                                        <FormLabel>Limit</FormLabel>
                                        <FormControl>
                                        <Input type="number" {...field} className='w-24' />
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
                    </div>
                </ScrollArea>
                <DialogFooter className='pt-6'>
                    <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
