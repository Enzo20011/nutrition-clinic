'use client';
import SobreMiSection from "@/components/SobreMiSection";
import ScientificAvales from "@/components/ScientificAvales";
import { useTurnero } from "@/components/TurneroContext";

export default function SobreMiPageClient() {
  const { openTurnero } = useTurnero();
  return (
    <>
      <SobreMiSection onBookingClick={openTurnero} />
      <div className="py-24 bg-bg">
        <ScientificAvales />
      </div>
    </>
  );
}
