CREATE TABLE `stockDrugTransferStatus` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`transfer_id` integer NOT NULL,
	`is_accepted` integer NOT NULL,
	`timestamp` integer NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`transfer_id`) REFERENCES `stockDrugTransfer`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `stockDrugTransferTicket` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`timestamp` integer NOT NULL,
	`to_pharmacy_id` integer NOT NULL,
	`user_id` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `stockDrugTransfer` ADD `ticket_id` integer REFERENCES stockDrugTransferTicket(id);--> statement-breakpoint
ALTER TABLE `stockDrugTransfer` DROP COLUMN `timestamp`;--> statement-breakpoint
ALTER TABLE `stockDrugTransfer` DROP COLUMN `to_pharmacy_id`;--> statement-breakpoint
ALTER TABLE `stockDrugTransfer` DROP COLUMN `user_id`;--> statement-breakpoint
ALTER TABLE `stockDrugTransfer` DROP COLUMN `received_at`;--> statement-breakpoint
ALTER TABLE `stockDrugTransfer` DROP COLUMN `received_by`;