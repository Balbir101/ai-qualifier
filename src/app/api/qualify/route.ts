import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { scrapeDomain } from '@/lib/scrape';
import { scoreProspectWithOpenAI } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const { domains, userId } = await req.json();
    if (!domains || typeof domains !== 'string') {
      return NextResponse.json({ error: 'Comma-separated domains required' }, { status: 400 });
    }
    const uid = typeof userId === 'string' && userId.length > 0 ? userId : 'public-user';
    const list: string[] = domains.split(',').map((d: string) => d.trim()).filter(Boolean);
    if (list.length === 0) return NextResponse.json({ error: 'No domains provided' }, { status: 400 });

    // Grab the latest ICP (you can scope by userId here if you wish)
    const icp = await prisma.icp.findFirst({ orderBy: { createdAt: 'desc' } });
    if (!icp) return NextResponse.json({ error: 'No ICP found for scoring' }, { status: 400 });

    // Scrape + Score each domain (in parallel)
    const results = await Promise.all(
      list.map(async (domain) => {
        const scraped = await scrapeDomain(domain);
        const { score, rationale, signals } = await scoreProspectWithOpenAI(
          {
            title: icp.title,
            description: icp.description,
            personas: icp.personas as any,
            company_size: icp.company_size,
            revenue_range: icp.revenue_range,
            industries: icp.industries,
            regions: icp.regions,
            funding_stages: icp.funding_stages,
          },
          domain,
          scraped
        );
        return { domain, score, rationale, signals: { ...signals, scraped_summary: { title: scraped.title, description: scraped.description, headings: scraped.headings } } };
      })
    );

    // Persist the run + results
    const run = await prisma.qualRun.create({
      data: {
        userId: uid,
        icpId: icp.id,
        domains: list,
        results: {
          create: results.map((r) => ({
            domain: r.domain,
            score: r.score,
            rationale: r.rationale,
            signals: r.signals as any,
          })),
        },
      },
      include: { results: true },
    });

    return NextResponse.json({ run });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
