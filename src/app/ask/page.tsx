
import Header from '@/components/layout/Header';
import AskForm from './_components/AskForm';

export default function AskPage() {
  return (
    <div className="flex h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
        <AskForm />
      </main>
    </div>
  );
}
