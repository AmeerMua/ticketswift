'use client';

import { useUser } from '@/firebase';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Ban } from 'lucide-react';

export function DeactivatedUserDialog() {
  const { userData } = useUser();

  const isDeactivated = userData?.disabled === true;

  return (
    <AlertDialog open={isDeactivated}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className='flex items-center gap-2'>
            <Ban className="h-5 w-5 text-destructive" />
            Your Account is Deactivated
          </AlertDialogTitle>
          <AlertDialogDescription>
            Your account has been deactivated by an administrator. Please contact support for assistance.
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
}
