import { NextResponse } from 'next/server';
import { getCalendarEventsForDay, syncAppointmentToCalendar } from '@/lib/googleCalendar';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    const events = await getCalendarEventsForDay(date || new Date().toISOString().split('T')[0]);
    return NextResponse.json(events);
  } catch (error: any) {
    console.error('Calendar GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await syncAppointmentToCalendar(body);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Calendar POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
