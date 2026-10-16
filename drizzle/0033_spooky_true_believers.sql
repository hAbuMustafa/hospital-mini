CREATE TABLE `stockDrugs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`drug_id` integer NOT NULL,
	`pharmacy_id` integer NOT NULL,
	`initial_qty` integer DEFAULT 0 NOT NULL,
	`qty_current` integer DEFAULT 0 NOT NULL,
	`batch_number` text,
	`expiry_date` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_item_in_a_pharmacy_per_batch` ON `stockDrugs` (`drug_id`,`pharmacy_id`,`batch_number`);