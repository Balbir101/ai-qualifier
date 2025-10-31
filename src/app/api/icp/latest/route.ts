import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // ✅ Use the exact model name from your schema
    const icp = await prisma.icp.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ icp });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

