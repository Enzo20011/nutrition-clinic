'use client';

import { useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

function SuccessContent() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-fg px-6 text-center gap-8">
      <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-success/10 border border-success/30 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-success" />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tight">¡Turno Confirmado!</h1>
      </div>
      <Link
        href="/"
        className="px-8 py-4 bg-accent text-accent-fg font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-accent transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
