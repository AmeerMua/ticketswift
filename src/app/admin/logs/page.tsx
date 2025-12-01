
'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import {
  Card,
  CardContent,
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
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { XCircle, History } from 'lucide-react';
import { format } from 'date-fns';
import { AuditEvent } from '@/lib/audit';
import { useMemo } from 'react';

// A simplified user type for this component
interface LogUser {
    id: string;
    name: string;
    email: string;
}

export default function AdminLogsPage() {
  const firestore = useFirestore();

  // Fetch all audit logs, ordered by most recent
  const auditLogsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'audit_logs'), orderBy('timestamp', 'desc'));
  }, [firestore]);
  const { data: auditLogs, isLoading: isLoadingLogs, error: errorLogs } = useCollection<AuditEvent>(auditLogsQuery);

  // Fetch all users to map user IDs to names
  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);
  const { data: users, isLoading: isLoadingUsers, error: errorUsers } = useCollection<LogUser>(usersQuery);
  
  // Create a memoized map of user IDs to user objects for efficient lookup
  const userMap = useMemo(() => {
    if (!users) return new Map();
    return new Map(users.map(user => [user.id, user]));
  }, [users]);
  
  const isLoading = isLoadingLogs || isLoadingUsers;
  const error = errorLogs || errorUsers;

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp || !timestamp.toDate) {
      return 'Pending...';
    }
    return format(timestamp.toDate(), 'PPP p');
  };
  
  // Helper to create a more descriptive activity string
  const getActivityName = (log: AuditEvent) => {
    switch (log.action) {
      case 'user-login':
        return 'User Logged In';
      case 'create-booking':
        return `Booked ${log.details?.numberOfTickets} ticket(s)`;
      case 'cancel-booking-user':
        return 'User Cancelled Booking';
      case 'cancel-booking-admin':
        return 'Admin Cancelled Booking';
      default:
        return log.action;
    }
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
                {error.message || 'Failed to load audit logs. Please check your connection or permissions.'}
              </AlertDescription>
            </Alert>
          )}
          {!isLoading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Timestamp</TableHead>
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
                {auditLogs?.map((log) => {
                  const user = userMap.get(log.userId);
                  return (
                    <TableRow key={log.id}>
                        <TableCell>
                            <div className="font-medium">{user?.name || 'System'}</div>
                            <div className="text-xs text-muted-foreground truncate" style={{ maxWidth: '150px' }}>
                                {log.userId}
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline">{getActivityName(log)}</Badge>
                        </TableCell>
                      <TableCell className="font-medium">
                        {formatTimestamp(log.timestamp)}
                      </TableCell>
                      <TableCell>
                       <div className="text-sm text-muted-foreground truncate" style={{ maxWidth: '300px' }}>
                         {log.details ? `ID: ${log.details.bookingId || log.details.eventId}`: 'N/A'}
                       </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
