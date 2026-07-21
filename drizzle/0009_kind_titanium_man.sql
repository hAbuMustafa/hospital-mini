CREATE TABLE `unsyncedNarcotics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ticket_id` integer NOT NULL,
	`ticket_timestamp` integer NOT NULL,
	`patient_id` text NOT NULL,
	`item_name` text NOT NULL,
	`qty` integer NOT NULL,
	FOREIGN KEY (`ticket_id`) REFERENCES `transactionTickets`(`id`) ON UPDATE no action ON DELETE cascade
);
