import { MoreHorizontal } from 'lucide-react';
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
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { mockUsers } from '@/lib/data';
import Image from 'next/image';

const statusVariant = {
    Verified: "default",
    Pending: "secondary",
    Rejected: "destructive"
} as const;

export default function AdminUsersPage() {
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
            <CardTitle>User Verification</CardTitle>
            <CardDescription>Approve or reject user ID card submissions for account verification.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className='text-center'>Status</TableHead>
                <TableHead className='text-right'>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium flex items-center gap-3">
                    <Image src={user.avatarUrl} alt={user.name} width={40} height={40} className="rounded-full" />
                    <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">ID: {user.id}</div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={statusVariant[user.verificationStatus]}>
                      {user.verificationStatus}
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
                        {user.verificationStatus === 'Pending' && (
                            <>
                                <DropdownMenuItem className="text-green-600 focus:bg-green-100 focus:text-green-700">Approve ID</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600 focus:bg-red-100 focus:text-red-700">Reject ID</DropdownMenuItem>
                            </>
                        )}
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Suspend Account</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
