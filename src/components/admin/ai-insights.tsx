'use client';

import { useState } from 'react';
import { WandSparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  getRealTimeEventInsights,
  type RealTimeEventInsightsInput,
  type RealTimeEventInsightsOutput,
} from '@/ai/flows/real-time-event-insights';
import { Separator } from '../ui/separator';

export function AiInsights() {
  const [insights, setInsights] = useState<RealTimeEventInsightsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateInsights = async () => {
    setIsLoading(true);
    setError(null);
    setInsights(null);

    // Mock data for the AI flow
    const input: RealTimeEventInsightsInput = {
      totalTicketsSold: 1300,
      totalRevenue: 133750,
      categoryWiseTicketDistribution: {
        VIP: 150,
        Normal: 950,
        Reserved: 200,
      },
    };

    try {
      const result = await getRealTimeEventInsights(input);
      setInsights(result);
    } catch (e) {
      setError('Failed to generate insights. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-primary/5 dark:bg-primary/10 border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
            <WandSparkles className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline text-primary">Real-time AI Insights</CardTitle>
        </div>
        <CardDescription>
          Generate AI-powered summaries and recommendations based on current event data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Separator className='my-4' />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        )}
        {error && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        {insights && (
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold mb-1 text-foreground">Performance Summary</h3>
              <p className="text-muted-foreground">{insights.summary}</p>
            </div>
            <Separator className='my-4 bg-primary/10' />
            <div>
              <h3 className="font-semibold mb-1 text-foreground">Recommendations</h3>
              <p className="text-muted-foreground whitespace-pre-line">{insights.recommendations}</p>
            </div>
          </div>
        )}
        {!isLoading && !insights && !error && (
            <div className='text-center text-muted-foreground py-8'>
                <p>Click the button below to get started.</p>
            </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleGenerateInsights} disabled={isLoading} className="w-full">
          <WandSparkles className="mr-2 h-4 w-4" />
          {isLoading ? 'Generating...' : 'Generate Insights'}
        </Button>
      </CardFooter>
    </Card>
  );
}
