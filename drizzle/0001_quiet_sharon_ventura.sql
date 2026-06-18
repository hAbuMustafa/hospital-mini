CREATE TABLE `stores` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text
);
--> statement-breakpoint
CREATE TABLE `transactionTickets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`timestamp` integer DEFAULT CURRENT_TIMESTAMP,
	`store_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`patient_id` text,
	`entity` text,
	`type` integer
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`item_id` integer NOT NULL,
	`qty` integer NOT NULL,
	`unit_price` numeric NOT NULL
);