import OpenAI from 'openai';

type Persona = {
  name: string;
  role: string;
  department: string;
  pain_points: string[];
};

export type ICPGen = {
  title: string;
  description: string;
  personas: Persona[];
  company_size: string;
  revenue_range: string;
  industries: string[];
  regions: string[];
  funding_stages: string[];
};

export async function generateICP(
  domain: string,
  scraped: { title: string; description: string; headings: string[]; text: string }
): Promise<ICPGen> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return fallbackICP(domain);

  const openai = new OpenAI({ apiKey });
  const prompt = `You are a B2B GTM analyst. Using the domain and scraped text,
return ONLY a compact JSON with:
{
  "title": string,
  "description": string,
  "personas": [{"name": string, "role": string, "department": string, "pain_points": string[]}] (3-5),
  "company_size": string,
  "revenue_range": string,
  "industries": string[],
  "regions": string[],
  "funding_stages": string[]
}
No commentary. No markdown.

Domain: ${domain}
Scrape Title: ${scraped.title}
Meta: ${scraped.description}
Headings: ${scraped.headings.join(' | ')}
Text (truncated): ${scraped.text.slice(0, 6000)}`;

  const out = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.2,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = out.choices?.[0]?.message?.content?.trim() || '';
  try {
    const j = JSON.parse(raw);
    return {
      title: j.title || `Ideal Customer Profile for ${domain}`,
      description: j.description || `Auto-generated ICP for ${domain}.`,
      personas: Array.isArray(j.personas) && j.personas.length ? j.personas.slice(0, 5) : fallbackICP(domain).personas,
      company_size: j.company_size || '10-200',
      revenue_range: j.revenue_range || '$1M–$50M',
      industries: j.industries || ['SaaS'],
      regions: j.regions || ['North America'],
      funding_stages: j.funding_stages || ['Seed', 'Series A'],
    };
  } catch {
    return fallbackICP(domain);
  }
}

function fallbackICP(domain: string): ICPGen {
  const base = domain.replace(/^https?:\/\//, '');
  return {
    title: `Ideal Customer Profile for ${base}`,
    description: `Heuristic ICP generated without OpenAI key for ${base}.`,
    personas: [
      { name: 'Founder Persona', role: 'Founder/CEO', department: 'Executive', pain_points: ['Scaling GTM', 'Clarifying ICP', 'Lead quality'] },
      { name: 'Marketing Persona', role: 'Head of Marketing', department: 'Marketing', pain_points: ['Attribution', 'Content velocity', 'ROI'] },
      { name: 'Sales Persona', role: 'Sales Manager', department: 'Sales', pain_points: ['Pipeline quality', 'Prospect fit', 'Sales cycle'] },
    ],
    company_size: '10-200',
    revenue_range: '$1M–$50M',
    industries: ['SaaS', 'Services'],
    regions: ['North America', 'Europe'],
    funding_stages: ['Bootstrapped', 'Seed', 'Series A'],
  };
}

/** ---------- Prospect scoring (OpenAI) ---------- */

type MinimalICP = {
  title: string;
  description: string;
  personas: Persona[];
  company_size: string;
  revenue_range: string;
  industries: string[];
  regions: string[];
  funding_stages: string[];
};

type ScoreOut = {
  score: number;            // 0..100
  rationale: string;        // short paragraph
  signals: Record<string, any>;
};

export async function scoreProspectWithOpenAI(
  icp: MinimalICP,
  domain: string,
  scraped: { title: string; description: string; headings: string[]; text: string }
): Promise<ScoreOut> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return heuristicScore(icp, domain, scraped);

  const openai = new OpenAI({ apiKey });

  const prompt = `You are qualifying a company domain against a target ICP.
Return ONLY valid JSON:
{
  "score": number (0-100),
  "rationale": string (<= 4 sentences),
  "signals": {
    "industry_match": boolean,
    "region_match": boolean,
    "ai_keyword": boolean,
    "tld": string,
    "notable": string[]   // up to 5 short bullets you infer
  }
}

ICP:
${JSON.stringify(icp, null, 2)}

Domain: ${domain}
Scraped:
Title: ${scraped.title}
Meta: ${scraped.description}
Headings: ${scraped.headings.join(' | ')}
Text (truncated): ${scraped.text.slice(0, 5000)}

Rules:
- Score higher when industries/regions align and when AI/tech signals exist.
- Be conservative; 50 is neutral fit.
- No extra commentary.`;

  try {
    const out = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.1,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = out.choices?.[0]?.message?.content?.trim() || '';
    const j = JSON.parse(raw);
    const score = Math.max(0, Math.min(100, Number(j.score ?? 0)));
    return {
      score,
      rationale: String(j.rationale ?? 'No rationale.'),
      signals: j.signals ?? {},
    };
  } catch {
    return heuristicScore(icp, domain, scraped);
  }
}

function heuristicScore(
  _icp: MinimalICP,
  domain: string,
  scraped: { title: string; description: string; headings: string[]; text: string }
): ScoreOut {
  const base = domain.toLowerCase();
  const hasAI = /\.ai$/.test(base) || /(^|[^a-z])ai([^a-z]|$)/.test(base) || / ai[^a-z]/i.test(scraped.text);
  const tldIo = base.endsWith('.io');
  let score = 50 + (hasAI ? 20 : 0) + (tldIo ? 10 : 0);
  score = Math.max(0, Math.min(100, score));
  return {
    score,
    rationale: `${hasAI ? 'AI signal detected' : 'No clear AI signal'}; ${tldIo ? 'Startup-y TLD (.io)' : 'Conventional TLD'}; heuristic fallback.`,
    signals: {
      industry_match: null,
      region_match: null,
      ai_keyword: hasAI,
      tld: base.split('.').pop(),
      notable: [],
    },
  };
}
