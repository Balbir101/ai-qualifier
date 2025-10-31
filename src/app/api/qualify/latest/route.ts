import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const run = await prisma.qualRun.findFirst({
      orderBy: { createdAt: 'desc' },
      include: { results: true }
    });
    return NextResponse.json({ run });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
