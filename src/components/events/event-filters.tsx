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

interface EventFiltersProps {
    searchTerm: string;
    onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    category: string;
    onCategoryChange: (value: string) => void;
    onClear: () => void;
}

export function EventFilters({ 
    searchTerm, 
    onSearchChange,
    category,
    onCategoryChange,
    onClear 
}: EventFiltersProps) {
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'Music', label: 'Music' },
    { value: 'Tech', label: 'Tech' },
    { value: 'Food', label: 'Food' },
    { value: 'Art', label: 'Art' },
  ];
  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
            placeholder="Search by event name..." 
            className="pl-10" 
            value={searchTerm}
            onChange={onSearchChange}
        />
      </div>
      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by category" />
        </SelectTrigger>
        <SelectContent>
            {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
        </SelectContent>
      </Select>
      <div className='flex gap-2'>
        <Button variant="ghost" className="w-full sm:w-auto" onClick={onClear}>
            <X className='h-4 w-4 mr-2' />
            Clear
        </Button>
      </div>
    </div>
  );
}
