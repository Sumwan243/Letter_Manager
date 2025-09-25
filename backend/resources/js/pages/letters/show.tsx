import { useEffect, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';

interface LetterType { id: number; name: string }
interface User { id: number; name: string }
interface Letter {
  id: number;
  title: string;
  content: string;
  status: string;
  created_at: string;
  fields: Record<string, any>;
  letterType?: LetterType;
  user?: User;
}

export default function LetterShow() {
  const { props } = usePage<{ id: number }>();
  const id = props.id;
  const [letter, setLetter] = useState<Letter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/letters/${id}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        setLetter(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  return (
    <AppLayout>
      <Head title={letter?.title ?? 'Letter'} />
      <div className="mb-4 flex items-center justify-between no-print">
        <Link href="/letters" className="text-sm text-primary-600">← Back to letters</Link>
        <Button onClick={() => window.print()} size="sm">Print</Button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : letter ? (
        <div className="space-y-4 printable">
          <h1 className="text-2xl font-semibold text-gray-900">{letter.title}</h1>
          <div className="text-sm text-gray-500">
            {letter.letterType?.name ?? 'Unknown type'} · {new Date(letter.created_at).toLocaleString()}
          </div>
          <div className="prose whitespace-pre-wrap">{letter.content || 'No content'}</div>
        </div>
      ) : (
        <div>Letter not found.</div>
      )}
    </AppLayout>
  );
}




