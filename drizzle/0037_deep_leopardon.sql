CREATE TABLE `stockDrugTransfer` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`timestamp` integer NOT NULL,
	`stock_id` integer NOT NULL,
	`to_pharmacy_id` integer NOT NULL,
	`user_id` text NOT NULL,
	`qty` integer NOT NULL,
	`received_at` integer,
	`received_by` text,
	FOREIGN KEY (`stock_id`) REFERENCES `stockDrugs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `transactionTickets` DROP COLUMN `entity`;