-- CreateTable
CREATE TABLE "analysis_batches" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "recordCount" INTEGER NOT NULL,
    "processingStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "validationStatus" TEXT NOT NULL DEFAULT 'VALID',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analysis_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_records" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "transactionId" TEXT,
    "date" TIMESTAMP(3),
    "description" TEXT,
    "amount" DOUBLE PRECISION,
    "currency" TEXT,
    "reference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "validationErrors" TEXT[],
    "reconciliationStatus" TEXT NOT NULL DEFAULT 'UNRECONCILED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "analysis_batches_userId_idx" ON "analysis_batches"("userId");

-- CreateIndex
CREATE INDEX "financial_records_batchId_idx" ON "financial_records"("batchId");

-- CreateIndex
CREATE INDEX "financial_records_transactionId_idx" ON "financial_records"("transactionId");

-- CreateIndex
CREATE INDEX "financial_records_reference_idx" ON "financial_records"("reference");

-- AddForeignKey
ALTER TABLE "analysis_batches" ADD CONSTRAINT "analysis_batches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_records" ADD CONSTRAINT "financial_records_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "analysis_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
