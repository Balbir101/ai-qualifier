-- CreateTable
CREATE TABLE "Icp" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "personas" JSONB NOT NULL,
    "company_size" TEXT NOT NULL,
    "revenue_range" TEXT NOT NULL,
    "industries" TEXT[],
    "regions" TEXT[],
    "funding_stages" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Icp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QualRun" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "icpId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "domains" TEXT[],

    CONSTRAINT "QualRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProspectResult" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "rationale" TEXT NOT NULL,
    "signals" JSONB NOT NULL,

    CONSTRAINT "ProspectResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Icp_userId_createdAt_idx" ON "Icp"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Icp_domain_idx" ON "Icp"("domain");

-- CreateIndex
CREATE INDEX "QualRun_icpId_createdAt_idx" ON "QualRun"("icpId", "createdAt");

-- CreateIndex
CREATE INDEX "QualRun_userId_createdAt_idx" ON "QualRun"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ProspectResult_runId_idx" ON "ProspectResult"("runId");

-- CreateIndex
CREATE INDEX "ProspectResult_domain_idx" ON "ProspectResult"("domain");

-- AddForeignKey
ALTER TABLE "QualRun" ADD CONSTRAINT "QualRun_icpId_fkey" FOREIGN KEY ("icpId") REFERENCES "Icp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProspectResult" ADD CONSTRAINT "ProspectResult_runId_fkey" FOREIGN KEY ("runId") REFERENCES "QualRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
