import { Metadata } from 'next';
import EditTokenClient from './EditTokenClient';

export function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export const metadata: Metadata = {
  title: 'Edit Token - WickAuth',
  description: 'Edit your authentication token'
};

export default function EditTokenPage({ params }: { params: { id: string } }) {
  return <EditTokenClient params={params} />;
} 