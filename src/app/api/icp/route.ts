import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { scrapeDomain } from '@/lib/scrape';
import { generateICP } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const { domain, userId } = await req.json();
    if (!domain)
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });

    const uid =
      typeof userId === 'string' && userId.length > 0 ? userId : 'public-user';

    // Scrape and generate ICP
    const scraped = await scrapeDomain(domain);
    const icpGen = await generateICP(domain, scraped);

    // ✅ Match field names to your Prisma schema exactly
    const icp = await prisma.icp.create({
      data: {
        userId: uid,
        domain,
        title: icpGen.title,
        description: icpGen.description,
        personas: icpGen.personas as any,
        company_size: icpGen.company_size || '',
        revenue_range: icpGen.revenue_range || '',
        industries: icpGen.industries || [],
        regions: icpGen.regions || [],
        funding_stages: icpGen.funding_stages || [],
      },
    });

    return NextResponse.json({ icp, scraped });
  } catch (e: any) {
    console.error('❌ Error generating ICP:', e);
    return NextResponse.json(
      { error: e?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
