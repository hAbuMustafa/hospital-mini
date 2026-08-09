CREATE TABLE `department_group` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`has_stock` integer,
	`is_ward` integer
);
--> statement-breakpoint
ALTER TABLE `departments` ADD `department_group_id` integer REFERENCES department_group(id);