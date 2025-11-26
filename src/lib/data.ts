import type { User, Event, Booking } from './types';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Alex Johnson',
    email: 'alex.j@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=user-1',
    verificationStatus: 'Verified',
    purchaseHistory: ['booking-1'],
  },
  {
    id: 'user-2',
    name: 'Maria Garcia',
    email: 'maria.g@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=user-2',
    verificationStatus: 'Pending',
    purchaseHistory: [],
  },
  {
    id: 'user-3',
    name: 'Chen Wei',
    email: 'chen.w@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=user-3',
    verificationStatus: 'Rejected',
    purchaseHistory: [],
  },
   {
    id: 'user-4',
    name: 'John Doe',
    email: 'john.d@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=user-4',
    verificationStatus: 'NotSubmitted',
    purchaseHistory: [],
  }
];

export const mockEvents: Event[] = [
  {
    id: 'event-1',
    name: 'Starlight Music Festival',
    date: '2024-09-15',
    time: '18:00',
    venue: 'Greenfield Park',
    description: 'An unforgettable night under the stars with the biggest names in electronic music. Featuring spectacular light shows and immersive soundscapes.',
    imageUrl: 'https://picsum.photos/seed/music-festival/1200/800',
    imageHint: 'music festival',
    ticketCategories: [
      { id: 'cat-1-1', name: 'VIP', price: 150, limit: 200, sold: 150 },
      { id: 'cat-1-2', name: 'Normal', price: 75, limit: 1000, sold: 950 },
      { id: 'cat-1-3', name: 'Reserved', price: 100, limit: 300, sold: 200 },
    ],
  },
  {
    id: 'event-2',
    name: 'InnovateX Tech Conference',
    date: '2024-10-22',
    time: '09:00',
    venue: 'Metropolis Convention Center',
    description: 'Join industry leaders and innovators for two days of groundbreaking talks on AI, blockchain, and the future of technology.',
    imageUrl: 'https://picsum.photos/seed/tech-conference/1200/800',
    imageHint: 'tech conference',
    ticketCategories: [
      { id: 'cat-2-1', name: 'VIP', price: 499, limit: 100, sold: 80 },
      { id: 'cat-2-2', name: 'Normal', price: 249, limit: 500, sold: 400 },
    ],
  },
  {
    id: 'event-3',
    name: 'Culinary Wonders Food Fair',
    date: '2024-11-05',
    time: '11:00',
    venue: 'City Market Hall',
    description: 'Explore a world of flavors with top chefs and artisanal food producers. A paradise for food lovers with tastings, workshops, and more.',
    imageUrl: 'https://picsum.photos/seed/food-fair/1200/800',
    imageHint: 'food fair',
    ticketCategories: [
      { id: 'cat-3-1', name: 'VIP', price: 100, limit: 150, sold: 120 },
      { id: 'cat-3-2', name: 'Normal', price: 40, limit: 800, sold: 600 },
    ],
  },
  {
    id: 'event-4',
    name: 'The Modern Art Exhibit',
    date: '2024-12-01',
    time: '10:00',
    venue: 'Grand Gallery of Art',
    description: 'A curated collection of contemporary masterpieces from around the globe. Experience the cutting edge of the art world.',
    imageUrl: 'https://picsum.photos/seed/art-exhibit/1200/800',
    imageHint: 'art gallery',
    ticketCategories: [
      { id: 'cat-4-1', name: 'Normal', price: 25, limit: 2000, sold: 500 },
    ],
  },
];

export const mockBookings: Booking[] = [
  {
    id: 'booking-1',
    userId: 'user-1',
    eventId: 'event-1',
    tickets: [
      {
        id: 'ticket-1',
        bookingId: 'booking-1',
        eventId: 'event-1',
        userId: 'user-1',
        categoryName: 'VIP',
        qrCodeUrl: '/qr-code.svg',
      },
      {
        id: 'ticket-2',
        bookingId: 'booking-1',
        eventId: 'event-1',
        userId: 'user-1',
        categoryName: 'VIP',
        qrCodeUrl: '/qr-code.svg',
      },
    ],
    totalAmount: 300,
    bookingDate: '2024-08-01',
    status: 'Confirmed',
  },
];
