'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function EventFilters() {
  // In a real app, this would be managed with state and would trigger searches
  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by event name..." className="pl-10" />
      </div>
      <Select>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="music">Music</SelectItem>
          <SelectItem value="tech">Tech</SelectItem>
          <SelectItem value="food">Food</SelectItem>
          <SelectItem value="art">Art</SelectItem>
        </SelectContent>
      </Select>
      <div className='flex gap-2'>
        <Button className="w-full sm:w-auto bg-accent hover:bg-accent/90">Filter</Button>
        <Button variant="ghost" className="w-full sm:w-auto">
            <X className='h-4 w-4 mr-2' />
            Clear
        </Button>
      </div>
    </div>
  );
}
