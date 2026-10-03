-- Migrazione di soli dati, nessuna modifica allo schema.
-- In precedenza l'annullamento di un appuntamento rimetteva isBooked = false sullo
-- slot che restava collegato all'appuntamento annullato: lo slot risultava libero
-- ma non era prenotabile (Appointment.slotId è univoco).
-- Ora lo slot originale resta occupato come storico e, se è nel futuro, viene
-- creato uno slot libero identico. Qui si riallineano i dati già esistenti.

-- 1. Per gli slot futuri si crea lo slot libero sostitutivo
INSERT INTO "AvailabilitySlot" ("doctorId", "date", "startTime", "endTime", "isBooked", "createdAt", "updatedAt")
SELECT s."doctorId", s."date", s."startTime", s."endTime", false, NOW(), NOW()
FROM "AvailabilitySlot" s
JOIN "Appointment" a ON a."slotId" = s."id"
WHERE s."isBooked" = false
  AND s."startTime" > NOW();

-- 2. Gli slot collegati a un appuntamento tornano occupati
UPDATE "AvailabilitySlot" s
SET "isBooked" = true, "updatedAt" = NOW()
FROM "Appointment" a
WHERE a."slotId" = s."id"
  AND s."isBooked" = false;
