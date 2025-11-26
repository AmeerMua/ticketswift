import Link from 'next/link';
import { Ticket } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
       <div
        className="absolute inset-0 z-0 opacity-10 dark:opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at center, hsl(var(--primary)) 0.5px, transparent 1px), radial-gradient(circle at center, hsl(var(--primary)) 0.5px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />
      <div className="mb-8 z-10">
        <Link href="/" className="flex items-center space-x-2 text-foreground">
            <Ticket className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold sm:inline-block font-headline">
              TicketSwift
            </span>
        </Link>
      </div>
      <div className='z-10 w-full max-w-md'>
        {children}
      </div>
    </div>
  );
}
