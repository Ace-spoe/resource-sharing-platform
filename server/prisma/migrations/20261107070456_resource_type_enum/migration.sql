BEGIN;

DO $$
DECLARE
    unsupported_value TEXT;
BEGIN
    SELECT "resource_type"
    INTO unsupported_value
    FROM "resources"
    WHERE "resource_type" NOT IN ('past exam', 'past_exam', 'slides', 'notes', 'other')
    LIMIT 1;

    IF FOUND THEN
        RAISE EXCEPTION 'Cannot migrate resources.resource_type: unsupported legacy value "%". Resolve unsupported values and retry.', unsupported_value;
    END IF;
END $$;

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('past_exam', 'notes', 'slides', 'other');

-- Replace the legacy text constraint with the enum's allowed values.
ALTER TABLE "resources" DROP CONSTRAINT "resources_resource_type_check";

UPDATE "resources"
SET "resource_type" = 'past_exam'
WHERE "resource_type" = 'past exam';

ALTER TABLE "resources"
ALTER COLUMN "resource_type" TYPE "ResourceType"
USING "resource_type"::"ResourceType";

ALTER TABLE "resources"
ADD CONSTRAINT "resources_resource_type_check"
CHECK ("resource_type" IN ('past_exam', 'notes', 'slides', 'other'));

COMMIT;
