
import Header from '@/components/layout/Header';
import AskForm from './_components/AskForm';

export default function AskPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 p-4 md:p-6 flex items-center justify-center">
        <AskForm />
      </main>
    </div>
  );
}
