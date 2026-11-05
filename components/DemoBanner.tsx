'use client';

import { useState } from 'react';

export default function DemoBanner() {
  const [cargando, setCargando] = useState(false);

  async function reiniciar() {
    setCargando(true);
    await fetch('/api/demo/reset', { method: 'POST' });
    window.location.reload();
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-bg/95 px-4 py-2 text-xs text-fg-dim backdrop-blur">
      <span>
        Modo demo: probá todo sin contraseña. Tus cambios son solo tuyos y se borran solos a las 2 horas.
      </span>
      <span className="flex items-center gap-3">
        <a href="/" className="underline underline-offset-2 hover:text-fg">
          Ver sitio público
        </a>
        <button onClick={reiniciar} disabled={cargando} className="underline underline-offset-2 hover:text-fg disabled:opacity-50">
          {cargando ? 'Restableciendo…' : 'Restablecer datos'}
        </button>
      </span>
    </div>
  );
}
