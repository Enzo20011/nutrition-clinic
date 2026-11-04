import React from "react";

export default function PrivacidadPage() {
  return (
    <main className="max-w-3xl mx-auto py-16 px-4 text-fg-dim">
      <h1 className="heading-lg mb-6">Política de privacidad</h1>
      <p className="mb-4">Tu privacidad es muy importante para nosotros. Esta política explica cómo recopilamos, usamos y protegemos tu información personal en la plataforma de Nutrición Clínica y Deportiva.</p>
      <h2 className="heading-sm mt-8 mb-2">1. Información que recopilamos</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>Datos de contacto (nombre, email, teléfono)</li>
        <li>Información de salud y nutrición proporcionada por el usuario</li>
        <li>Datos de uso y navegación en la plataforma</li>
      </ul>
      <h2 className="heading-sm mt-8 mb-2">2. Uso de la información</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>Brindar servicios personalizados de nutrición y gestión de turnos</li>
        <li>Mejorar la experiencia de usuario y la calidad del servicio</li>
        <li>Comunicación sobre novedades, recordatorios y actualizaciones</li>
      </ul>
      <h2 className="heading-sm mt-8 mb-2">3. Protección de datos</h2>
      <p className="mb-4">Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal contra accesos no autorizados, pérdida o alteración.</p>
      <h2 className="heading-sm mt-8 mb-2">4. Derechos del usuario</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>Acceder, rectificar o eliminar tus datos personales</li>
        <li>Solicitar información sobre el tratamiento de tus datos</li>
        <li>Retirar tu consentimiento en cualquier momento</li>
      </ul>
      <h2 className="heading-sm mt-8 mb-2">5. Contacto</h2>
      <p>Si tienes dudas o deseas ejercer tus derechos, puedes contactarnos en <a href="mailto:contacto@example.com" className="text-accent underline">contacto@example.com</a>.</p>
      <p className="mt-8 text-xs text-fg-muted">Última actualización: {new Date().toLocaleDateString()}</p>
    </main>
  );
}
