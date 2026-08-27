CREATE TABLE `invoiceExtraItems` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`invoice_id` integer NOT NULL,
	`item_id` integer NOT NULL,
	`qty` integer NOT NULL,
	`unit_price` integer NOT NULL,
	`added_by` text NOT NULL,
	`added_at` integer NOT NULL,
	FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`item_id`) REFERENCES `drugs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`added_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`patient_id` text NOT NULL,
	`from` integer NOT NULL,
	`to` integer NOT NULL,
	`issued_by` text NOT NULL,
	`issuing_department` integer NOT NULL,
	`issued_at` integer NOT NULL,
	`is_closed` integer NOT NULL,
	`is_cancelled` integer,
	FOREIGN KEY (`patient_id`) REFERENCES `patientAdmissions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`issued_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`issuing_department`) REFERENCES `departments`(`id`) ON UPDATE no action ON DELETE no action
);
