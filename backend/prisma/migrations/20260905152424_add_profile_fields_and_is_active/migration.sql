/*
  Warnings:

  - Added the required column `firstName` to the `Doctor` table. Backfilled existing rows with a
    placeholder value, then dropped the default so future inserts must supply it explicitly.
  - Added the required column `lastName` to the `Doctor` table. Same backfill strategy as above.
  - Added the required column `firstName` to the `Patient` table (table was empty, no backfill needed).
  - Added the required column `lastName` to the `Patient` table (table was empty, no backfill needed).

*/
-- AlterTable
ALTER TABLE "DentalService" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "firstName" TEXT NOT NULL DEFAULT 'Da aggiornare',
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastName" TEXT NOT NULL DEFAULT 'Da aggiornare';

ALTER TABLE "Doctor" ALTER COLUMN "firstName" DROP DEFAULT;
ALTER TABLE "Doctor" ALTER COLUMN "lastName" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL;
