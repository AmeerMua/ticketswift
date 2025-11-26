import { DollarSign, Ticket, Users, Activity } from 'lucide-react';
import { StatCard } from '@/components/admin/stat-card';
import { SalesChart } from '@/components/admin/sales-chart';
import { AiInsights } from '@/components/admin/ai-insights';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { mockEvents } from '@/lib/data';


const recentSales = [
    { name: 'Olivia Martin', email: 'olivia.martin@email.com', amount: '+$1,999.00' },
    { name: 'Jackson Lee', email: 'jackson.lee@email.com', amount: '+$39.00' },
    { name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', amount: '+$299.00' },
    { name: 'William Kim', email: 'will@email.com', amount: '+$99.00' },
    { name: 'Sofia Davis', email: 'sofia.davis@email.com', amount: '+$39.00' },
];

export default function AdminDashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Revenue" 
          value="$133,750" 
          icon={<DollarSign />}
          description="+20.1% from last month"
        />
        <StatCard 
          title="Tickets Sold" 
          value="1,300"
          icon={<Ticket />}
          description="+180.1% from last month"
        />
        <StatCard 
          title="New Users" 
          value="+234"
          icon={<Users />}
          description="+30 from last month"
        />
        <StatCard 
          title="Active Events" 
          value="4"
          icon={<Activity />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
            <SalesChart />
        </div>
        <div className="lg:col-span-3">
            <AiInsights />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead className='text-right'>Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recentSales.map(sale => (
                        <TableRow key={sale.email}>
                            <TableCell>
                                <div className="font-medium">{sale.name}</div>
                                <div className="text-sm text-muted-foreground">{sale.email}</div>
                            </TableCell>
                            <TableCell className='text-right'>{sale.amount}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle>Sold Out Events</CardTitle>
                <CardDescription>Events that have reached their ticket limit.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {mockEvents.filter(e => e.ticketCategories.every(tc => tc.sold >= tc.limit)).map(event => (
                        <div key={event.id} className="flex items-center">
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">{event.name}</p>
                                <p className="text-sm text-muted-foreground">{event.venue}</p>
                            </div>
                            <div className="ml-auto font-medium"><Badge variant="destructive">Sold Out</Badge></div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      </div>

    </div>
  );
}
