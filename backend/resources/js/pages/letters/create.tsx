import { useEffect, useState } from 'react';
import { Link, Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

interface LetterType { id: number; name: string }

export default function LettersCreate() {
  const [letterTypes, setLetterTypes] = useState<LetterType[]>([]);
  const [letterTypeId, setLetterTypeId] = useState<number | ''>('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'draft'|'pending'|'approved'|'rejected'>('draft');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/letter-types', { credentials: 'include' });
      const data = await res.json();
      setLetterTypes(Array.isArray(data) ? data : []);
    };
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/letters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ title, content, letter_type_id: letterTypeId, fields, status })
    });
    if (res.ok) {
      const data = await res.json();
      router.visit(`/letters/${data.letter.id}`);
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err?.message ?? 'Failed to create letter');
    }
  };

  return (
    <AppLayout>
      <Head title="Create Letter" />
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Letter Type</label>
          <select className="mt-1 input" value={letterTypeId as any} onChange={e => setLetterTypeId(Number(e.target.value))} required>
            <option value="">Select type</option>
            {letterTypes.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Title (optional)</label>
          <input className="mt-1 input" value={title} onChange={e => setTitle(e.target.value)} placeholder="If blank, uses Subject field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Content (optional)</label>
          <textarea className="mt-1 input" value={content} onChange={e => setContent(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Subject</label>
          <input className="mt-1 input" value={fields.subject ?? ''} onChange={e => setFields({ ...fields, subject: e.target.value })} />
        </div>
        <div className="flex items-center gap-2">
          <button type="submit" className="btn btn-primary">Create</button>
          <Link href="/letters" className="btn">Cancel</Link>
        </div>
      </form>
    </AppLayout>
  );
}




