ALTER TABLE `stockDrugs` RENAME COLUMN "qty_initial" TO "qty";--> statement-breakpoint
ALTER TABLE `stockDrugs` DROP COLUMN `qty_current`;