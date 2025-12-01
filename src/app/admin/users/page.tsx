'use client';

import { MoreHorizontal, Loader2, CheckCircle, XCircle, ShieldQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useCollection, useFirestore, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const statusConfig = {
    Verified: { variant: "default" as const, icon: CheckCircle, className: "text-green-600" },
    Pending: { variant: "secondary" as const, icon: Loader2, className: "animate-spin" },
    Rejected: { variant: "destructive" as const, icon: XCircle, className: "" },
    NotSubmitted: { variant: "outline" as const, icon: ShieldQuestion, className: "" },
};

export default function AdminUsersPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const usersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'users');
    }, [firestore]);

    const { data: users, isLoading, error } = useCollection(usersQuery);

    const handleVerification = (userId: string, newStatus: 'Verified' | 'Rejected') => {
        if (!firestore) return;
        const userRef = doc(firestore, 'users', userId);
        updateDocumentNonBlocking(userRef, { 
            verificationStatus: newStatus,
            verified: newStatus === 'Verified' 
        });
        toast({
            title: `User ${newStatus}`,
            description: `The user's verification status has been updated.`,
        })
    }
    
    const handleAdminToggle = (user) => {
        if(!firestore) return;

        const userRef = doc(firestore, 'users', user.id);
        const newAdminStatus = !user.isAdmin;
        updateDocumentNonBlocking(userRef, { isAdmin: newAdminStatus });

        toast({
            title: `User Role Updated`,
            description: `${user.name} has been ${newAdminStatus ? 'made an admin' : 'removed as an admin'}.`,
        });
    }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline">Users</h2>
            <p className="text-muted-foreground">Manage user accounts and ID verification.</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Approve or reject user ID card submissions and manage admin privileges.</CardDescription>
        </CardHeader>
        <CardContent>
            {isLoading && (
                <div className='space-y-2'>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center p-4 space-x-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                            <Skeleton className="h-6 w-24 rounded-full" />
                            <Skeleton className="h-8 w-8" />
                        </div>
                    ))}
                </div>
            )}
            {error && (
                <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>

                    <AlertDescription>{error.message || 'Failed to load users. Please check your connection or permissions.'}</AlertDescription>
                </Alert>
            )}
          {!isLoading && !error && (
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className='text-center'>ID Status</TableHead>
                    <TableHead className='text-center'>Role</TableHead>
                    <TableHead className='text-right'>
                    <span className="sr-only">Actions</span>
                    </TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {(users || []).map((user) => {
                    const status = user.verificationStatus || 'NotSubmitted';
                    const config = statusConfig[status];
                    const Icon = config.icon;
                    return (
                        <TableRow key={user.id}>
                        <TableCell className="font-medium flex items-center gap-3">
                            <Image src={`https://i.pravatar.cc/150?u=${user.id}`} alt={user.name} width={40} height={40} className="rounded-full" />
                            <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-muted-foreground">ID: {user.id}</div>
                            </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell className="text-center">
                            <Badge variant={user.verified ? 'default' : config.variant} className='gap-1.5'>
                                <Icon className={`h-3.5 w-3.5 ${user.verified ? '' : config.className}`} />
                                {user.verified ? 'Verified' : status}
                            </Badge>
                        </TableCell>
                         <TableCell className="text-center">
                            <Badge variant={user.isAdmin ? "secondary" : "outline"}>
                                {user.isAdmin ? "Admin" : "User"}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                {status === 'Pending' && (
                                    <>
                                        <DropdownMenuItem 
                                            className="text-green-600 focus:bg-green-100 focus:text-green-700"
                                            onClick={() => handleVerification(user.id, 'Verified')}
                                        >
                                            Approve ID
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                            className="text-red-600 focus:bg-red-100 focus:text-red-700"
                                            onClick={() => handleVerification(user.id, 'Rejected')}
                                        >
                                            Reject ID
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                    </>
                                )}
                                 {status === 'Rejected' && (
                                    <>
                                        <DropdownMenuItem 
                                            className="text-green-600 focus:bg-green-100 focus:text-green-700"
                                            onClick={() => handleVerification(user.id, 'Verified')}
                                        >
                                            Approve ID
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                    </>
                                )}
                                <DropdownMenuItem onClick={() => handleAdminToggle(user)}>
                                    {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                                </DropdownMenuItem>
                                <DropdownMenuItem disabled>View Profile</DropdownMenuItem>
                                <DropdownMenuItem disabled>Suspend Account</DropdownMenuItem>
                            </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                        </TableRow>
                    )
                })}
                </TableBody>
            </Table>
          )}
          
        </CardContent>
      </Card>
    </div>
  );
}
