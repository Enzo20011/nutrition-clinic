/**
 * Mock Email Utility
 * In a real production environment, use Resend, Nodemailer, or SendGrid.
 */

export async function sendEmail({ to, subject, body }: { to: string, subject: string, body: string }) {
  console.log('-------------------------------------------');
  console.log(`📧 SIMULATED EMAIL SENT TO: ${to}`);
  console.log(`📝 SUBJECT: ${subject}`);
  console.log(`📄 BODY: ${body}`);
  console.log('-------------------------------------------');
  
  return { success: true, messageId: `mock_${Math.random().toString(36).substring(7)}` };
}

export async function sendAppointmentReminder(email: string, date: string, time: string) {
  return sendEmail({
    to: email,
    subject: 'Recordatorio de Cita - NutriPro',
    body: `Hola! Te recordamos tu cita para el día ${date} a las ${time}. Te esperamos!`
  });
}

export async function sendPaymentConfirmation(email: string, amount: number) {
  return sendEmail({
    to: email,
    subject: 'Pago Confirmado - NutriPro',
    body: `Hemos recibido tu pago de $${amount}. Tu cita ha sido confirmada satisfactoriamente.`
  });
}
