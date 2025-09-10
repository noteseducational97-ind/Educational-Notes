
import { getResourceById } from '@/lib/firebase/resources';
import { notFound } from 'next/navigation';
import ResourceDetailClient from './ResourceDetailClient';

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function ResourceDetailPage({ params, searchParams }: Props) {
  const resource = await getResourceById(params.id);

  if (!resource) {
    notFound();
  }
  
  const { from } = searchParams;
  const fromAdmin = from === 'admin';

  return <ResourceDetailClient resource={resource} fromAdmin={fromAdmin} />;
}
