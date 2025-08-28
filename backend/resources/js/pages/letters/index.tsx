import { useEffect, useState } from 'react';
import { Link, Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

interface LetterType { id: number; name: string }
interface User { id: number; name: string }
interface Letter {
  id: number;
  title: string;
  status: string;
  created_at: string;
  letterType?: LetterType;
  user?: User;
}

export default function LettersIndex() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/letters', { credentials: 'include' });
        const data = await res.json();
        const items: Letter[] = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
        setLetters(items);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <AppLayout>
      <Head title="Letters" />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Letters</h1>
        <Link href="/letters/create" className="btn btn-primary">New Letter</Link>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="divide-y rounded-lg border">
          {letters.map((l) => (
            <Link key={l.id} href={`/letters/${l.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50">
              <div>
                <div className="font-medium text-gray-900">{l.title}</div>
                <div className="text-sm text-gray-500">
                  {l.letterType?.name ?? 'Unknown type'} · {new Date(l.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="text-xs uppercase tracking-wide text-gray-500">{l.status}</div>
            </Link>
          ))}
        </div>
      )}
    </AppLayout>
  );
}




