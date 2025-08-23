
import Header from '@/components/layout/Header';
import AskForm from './_components/AskForm';

export default function AskPage() {
  return (
    <div className="flex h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <AskForm />
      </main>
    </div>
  );
}
