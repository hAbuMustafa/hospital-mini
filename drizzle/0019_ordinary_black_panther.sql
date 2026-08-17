PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`item_id` integer NOT NULL,
	`qty` integer NOT NULL,
	`qty_returned` integer,
	`unit_price` numeric NOT NULL,
	`ticket_id` integer,
	FOREIGN KEY (`ticket_id`) REFERENCES `transactionTickets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_transactions`("id", "item_id", "qty", "qty_returned", "unit_price", "ticket_id") SELECT "id", "item_id", "qty", "qty_returned", "unit_price", "ticket_id" FROM `transactions`;--> statement-breakpoint
DROP TABLE `transactions`;--> statement-breakpoint
ALTER TABLE `__new_transactions` RENAME TO `transactions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;