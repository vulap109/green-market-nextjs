ALTER TABLE "product" RENAME COLUMN "is_featured" TO "featured";

ALTER TABLE "product"
  ALTER COLUMN "featured" DROP DEFAULT,
  ALTER COLUMN "featured" TYPE VARCHAR(30) USING CASE
    WHEN "status" IN ('ban-chay-nhat', 'ban-chay') THEN 'ban-chay'
    WHEN "status" IN ('khuyen-mai', 'khuyen-mai-hot') THEN 'khuyen-mai-hot'
    WHEN "featured" THEN 'ban-chay'
    ELSE ''
  END,
  ALTER COLUMN "featured" SET DEFAULT '';

UPDATE "product"
SET "status" = 'active'
WHERE "status" IN ('ban-chay-nhat', 'ban-chay', 'khuyen-mai', 'khuyen-mai-hot');
