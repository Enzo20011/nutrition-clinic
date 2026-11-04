'use client';

import ServiciosSection from './ServiciosSection';
import ScientificAvales from './ScientificAvales';
import { useTurnero } from './TurneroContext';

export default function ServiciosPageClient() {
  const { openTurnero } = useTurnero();
  return (
    <>
      <ServiciosSection onBookingClick={openTurnero} />
      <div className="py-24 bg-bg">
        <ScientificAvales />
      </div>
    </>
  );
}
