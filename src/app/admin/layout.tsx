'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading, userData, isUserDataLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isUserLoading || isUserDataLoading) {
      return; // Wait until user data is loaded
    }

    if (!user) {
      router.push('/login'); // Not logged in, redirect to login
    } else if (!userData?.isAdmin) {
      router.push('/'); // Logged in but not an admin, redirect to home
    }
  }, [user, isUserLoading, userData, isUserDataLoading, router]);

  // Show a loading skeleton while we verify the user's admin status
  if (isUserLoading || isUserDataLoading || !userData?.isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-full max-w-md space-y-4 p-4">
            <h2 className="text-2xl font-bold text-center">Verifying Access...</h2>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  // If user is an admin, show the admin layout
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
