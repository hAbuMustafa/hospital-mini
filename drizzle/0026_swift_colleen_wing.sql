PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_invoiceExtraItems` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`invoice_id` integer NOT NULL,
	`item_id` integer NOT NULL,
	`qty` integer DEFAULT 1 NOT NULL,
	`unit_price` integer NOT NULL,
	`added_by` text NOT NULL,
	`added_at` integer NOT NULL,
	FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`item_id`) REFERENCES `drugs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`added_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_invoiceExtraItems`("id", "invoice_id", "item_id", "qty", "unit_price", "added_by", "added_at") SELECT "id", "invoice_id", "item_id", "qty", "unit_price", "added_by", "added_at" FROM `invoiceExtraItems`;--> statement-breakpoint
DROP TABLE `invoiceExtraItems`;--> statement-breakpoint
ALTER TABLE `__new_invoiceExtraItems` RENAME TO `invoiceExtraItems`;--> statement-breakpoint
PRAGMA foreign_keys=ON;