import { Ticket } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Ticket className="h-6 w-6 text-primary hidden sm:block" />
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by your friendly neighborhood AI. 
            <span className="font-medium"> TicketSwift &copy; {new Date().getFullYear()}</span>
          </p>
        </div>
        {/* Add social links or other footer content here */}
      </div>
    </footer>
  );
}
