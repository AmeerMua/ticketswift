export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  verificationStatus: 'Verified' | 'Pending' | 'Rejected';
  purchaseHistory: string[]; // Array of booking IDs
};

export type TicketCategory = {
  id: string;
  name: 'VIP' | 'Normal' | 'Reserved';
  price: number;
  limit: number;
  sold: number;
};

export type Event = {
  id: string;
  name: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  ticketCategories: TicketCategory[];
};

export type Booking = {
  id: string;
  userId: string;
  eventId: string;
  tickets: Ticket[];
  totalAmount: number;
  bookingDate: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
};

export type Ticket = {
  id: string;
  bookingId: string;
  eventId: string;
  userId: string;
  categoryName: TicketCategory['name'];
  qrCodeUrl: string; // URL to the QR code image
};
