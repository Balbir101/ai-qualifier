import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const icp = await prisma.icp.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ icp });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
