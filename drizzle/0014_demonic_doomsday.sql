CREATE TABLE `departments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`has_stock` integer,
	`is_ward` integer,
	`floor` integer,
	`room_number` text
);
--> statement-breakpoint
ALTER TABLE `user` ADD `affiliation` integer DEFAULT 0 REFERENCES departments(id);