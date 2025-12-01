'use client';

import { useState } from 'react';
import { EventCard } from '@/components/events/event-card';
import { EventFilters } from '@/components/events/event-filters';
import { Button } from '@/components/ui/button';
import { mockEvents } from '@/lib/data';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SearchX } from 'lucide-react';

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');

  const handleClearFilters = () => {
    setSearchTerm('');
    setCategory('all');
  };

  const filteredEvents = mockEvents.filter((event) => {
    const searchTermMatch = event.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const categoryMatch = category === 'all' || event.category === category;
    return searchTermMatch && categoryMatch;
  });

  return (
    <>
      <section className="relative w-full pt-16 pb-24 md:pt-24 md:pb-32 bg-card border-b">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter font-headline sm:text-5xl xl:text-6xl/none">
                  Your Next Unforgettable Experience Awaits
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Discover, book, and manage tickets for the best events in
                  town. Secure, fast, and simple.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg">
                  <a href="#events">Browse Events</a>
                </Button>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent w-1/2"></div>
              <img
                src="https://picsum.photos/seed/hero-image/600/400"
                data-ai-hint="concert crowd"
                width="600"
                height="400"
                alt="Hero"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="events" className="py-12 md:py-24">
        <div className="container">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter font-headline sm:text-5xl">
                Upcoming Events
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Explore our curated list of events. There's something for
                everyone.
              </p>
            </div>
          </div>

          <div className="mb-8">
            <EventFilters
              searchTerm={searchTerm}
              onSearchChange={(e) => setSearchTerm(e.target.value)}
              category={category}
              onCategoryChange={setCategory}
              onClear={handleClearFilters}
            />
          </div>

          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="flex justify-center">
              <Alert className="max-w-lg text-center flex flex-col items-center">
                <SearchX className="h-6 w-6 mb-2" />
                <AlertTitle className='mb-2'>No Events Found</AlertTitle>
                <AlertDescription>
                  No events match your current filters. Try clearing them to see all available events.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
