PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_invoices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`patient_id` text NOT NULL,
	`from` integer NOT NULL,
	`to` integer NOT NULL,
	`issued_by` text NOT NULL,
	`issuing_department` integer NOT NULL,
	`issued_at` integer NOT NULL,
	`is_closed` integer,
	`is_cancelled` integer,
	FOREIGN KEY (`patient_id`) REFERENCES `patientAdmissions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`issued_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`issuing_department`) REFERENCES `departments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_invoices`("id", "patient_id", "from", "to", "issued_by", "issuing_department", "issued_at", "is_closed", "is_cancelled") SELECT "id", "patient_id", "from", "to", "issued_by", "issuing_department", "issued_at", "is_closed", "is_cancelled" FROM `invoices`;--> statement-breakpoint
DROP TABLE `invoices`;--> statement-breakpoint
ALTER TABLE `__new_invoices` RENAME TO `invoices`;--> statement-breakpoint
PRAGMA foreign_keys=ON;