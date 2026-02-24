-- AlterTable: Hacer venueId opcional en Event
-- Permite crear eventos sin sala/recinto asignado

-- 1. Eliminar la restricción NOT NULL de venueId
ALTER TABLE "events" ALTER COLUMN "venueId" DROP NOT NULL;

-- 2. Cambiar la FK de ON DELETE RESTRICT a ON DELETE SET NULL
ALTER TABLE "events" DROP CONSTRAINT IF EXISTS "events_venueId_fkey";
ALTER TABLE "events" ADD CONSTRAINT "events_venueId_fkey" 
  FOREIGN KEY ("venueId") REFERENCES "venues"("id") ON DELETE SET NULL ON UPDATE CASCADE;
