'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminSupportPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/contact');
  }, [router]);
  return <div className="p-8 text-slate-500">Opening support center…</div>;
}
