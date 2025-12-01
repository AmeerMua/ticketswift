export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  verificationStatus: 'Verified' | 'Pending' | 'Rejected' | 'NotSubmitted';
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
  category: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  ticketCategories: TicketCategory[];
};

export type Booking = {
  id: string;
  userId: string;
  eventId: string;
  eventName?: string; // Denormalized for easy display
  eventDate?: string; // Denormalized
  tickets: Ticket[];
  totalAmount: number;
  bookingDate: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'PaymentPending';
  paymentScreenshotUrl?: string; // URL to the payment screenshot in Firebase Storage
};

export type Ticket = {
  id: string;
  bookingId: string;
  eventId: string;
  userId: string;
  categoryName: TicketCategory['name'];
  price: number;
  qrCodeUrl?: string; // This is now generated on the fly, so it can be optional
};
