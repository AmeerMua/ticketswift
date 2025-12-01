
'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { XCircle, History } from 'lucide-react';
import { format } from 'date-fns';
import { AuditEvent } from '@/lib/audit';

export default function AdminLogsPage() {
  const firestore = useFirestore();

  const auditLogsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'audit_logs'), orderBy('timestamp', 'desc'));
  }, [firestore]);

  const { data: auditLogs, isLoading, error } = useCollection<AuditEvent>(auditLogsQuery);

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp || !timestamp.toDate) {
      return 'Pending...';
    }
    return format(timestamp.toDate(), 'PPP p');
  };

  const renderDetails = (details: Record<string, any> | undefined) => {
    if (!details) return 'N/A';
    return Object.entries(details)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
            <History className="h-8 w-8" />
            Audit Logs
          </h2>
          <p className="text-muted-foreground">
            A real-time stream of important activities within the system.
          </p>
        </div>
      </div>
      <Card>
        <CardContent className="pt-6">
          {isLoading && (
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to load audit logs. Please check your connection or permissions.
              </AlertDescription>
            </Alert>
          )}
          {!isLoading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No audit logs found.
                    </TableCell>
                  </TableRow>
                )}
                {auditLogs?.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">
                      {formatTimestamp(log.timestamp)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.action}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground truncate" style={{ maxWidth: '150px' }}>
                        {log.userId}
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="text-sm text-muted-foreground truncate" style={{ maxWidth: '300px' }}>
                         {renderDetails(log.details)}
                       </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
