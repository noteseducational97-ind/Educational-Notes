
import AdminHeader from '@/components/layout/AdminHeader';
import AdminSidebar from '@/components/layout/AdminSidebar';
import Footer from '@/components/layout/Footer';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-background">
            <AdminSidebar />
            <div className="flex flex-1 flex-col">
                <AdminHeader />
                <main className="flex-1 bg-secondary/30 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
                <Footer />
            </div>
        </div>
    );
}
