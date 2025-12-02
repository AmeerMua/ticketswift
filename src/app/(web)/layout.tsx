import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { DeactivatedUserDialog } from "@/components/auth/deactivated-user-dialog";

interface WebLayoutProps {
  children: React.ReactNode;
}

export default function WebLayout({ children }: WebLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <DeactivatedUserDialog />
    </div>
  );
}
