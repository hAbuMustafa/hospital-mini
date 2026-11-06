ALTER TABLE `stockDrugTransfer` RENAME TO `stockDrugTransferItems`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_stockDrugTransferItems` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ticket_id` integer,
	`stock_id` integer NOT NULL,
	`qty` integer NOT NULL,
	FOREIGN KEY (`ticket_id`) REFERENCES `stockDrugTransferTicket`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`stock_id`) REFERENCES `stockDrugs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_stockDrugTransferItems`("id", "ticket_id", "stock_id", "qty") SELECT "id", "ticket_id", "stock_id", "qty" FROM `stockDrugTransferItems`;--> statement-breakpoint
DROP TABLE `stockDrugTransferItems`;--> statement-breakpoint
ALTER TABLE `__new_stockDrugTransferItems` RENAME TO `stockDrugTransferItems`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_stockDrugTransferStatus` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`transfer_id` integer NOT NULL,
	`is_accepted` integer NOT NULL,
	`timestamp` integer NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`transfer_id`) REFERENCES `stockDrugTransferItems`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_stockDrugTransferStatus`("id", "transfer_id", "is_accepted", "timestamp", "user_id") SELECT "id", "transfer_id", "is_accepted", "timestamp", "user_id" FROM `stockDrugTransferStatus`;--> statement-breakpoint
DROP TABLE `stockDrugTransferStatus`;--> statement-breakpoint
ALTER TABLE `__new_stockDrugTransferStatus` RENAME TO `stockDrugTransferStatus`;