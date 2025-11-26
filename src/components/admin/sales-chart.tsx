'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';

const chartData = [
  { category: 'VIP', tickets: 150, fill: 'var(--color-vip)' },
  { category: 'Normal', tickets: 950, fill: 'var(--color-normal)' },
  { category: 'Reserved', tickets: 200, fill: 'var(--color-reserved)' },
];

const chartConfig = {
  tickets: {
    label: 'Tickets Sold',
  },
  vip: {
    label: 'VIP',
    color: 'hsl(var(--chart-1))',
  },
  normal: {
    label: 'Normal',
    color: 'hsl(var(--chart-2))',
  },
  reserved: {
    label: 'Reserved',
    color: 'hsl(var(--chart-5))',
  },
} satisfies ChartConfig;


export function SalesChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Category-wise Ticket Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                <XAxis dataKey="category" tickLine={false} axisLine={false} />
                <YAxis />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="tickets" radius={4} />
            </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
