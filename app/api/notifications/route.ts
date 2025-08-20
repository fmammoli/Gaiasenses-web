import { NextResponse } from 'next/server';
import { sendNotification } from '@/lib/notifications.js';

export async function GET() {
  const result = await sendNotification();
  return NextResponse.json(result);
}
