
import AdminSidebar from '@/components/layout/AdminSidebar';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen">
            <AdminSidebar />
            <main className="flex-1 bg-secondary/30 p-4 sm:p-6 lg:p-8">
                {children}
            </main>
        </div>
    );
}
