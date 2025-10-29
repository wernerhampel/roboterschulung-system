-- CreateTable
CREATE TABLE "SchulungsTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "typ" TEXT NOT NULL,
    "hersteller" TEXT NOT NULL,
    "beschreibung" TEXT NOT NULL,
    "lernziele" JSONB NOT NULL,
    "agenda" JSONB NOT NULL,
    "materialien" JSONB NOT NULL,
    "standardFragen" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchulungsTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SchulungsTemplate_hersteller_idx" ON "SchulungsTemplate"("hersteller");
CREATE INDEX "SchulungsTemplate_typ_idx" ON "SchulungsTemplate"("typ");
