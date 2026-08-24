PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_transactionTickets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`timestamp` integer NOT NULL,
	`store_id` integer NOT NULL,
	`user_id` text NOT NULL,
	`patient_id` text,
	`entity` text,
	`is_dispense` integer NOT NULL,
	`return_on_ticket_id` integer
);
--> statement-breakpoint
INSERT INTO `__new_transactionTickets`("id", "timestamp", "store_id", "user_id", "patient_id", "entity", "is_dispense", "return_on_ticket_id") SELECT "id", "timestamp", "store_id", "user_id", "patient_id", "entity", "is_dispense", "return_on_ticket_id" FROM `transactionTickets`;--> statement-breakpoint
DROP TABLE `transactionTickets`;--> statement-breakpoint
ALTER TABLE `__new_transactionTickets` RENAME TO `transactionTickets`;--> statement-breakpoint
PRAGMA foreign_keys=ON;