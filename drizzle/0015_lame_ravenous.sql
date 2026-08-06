PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`username` text,
	`phone_number` text,
	`image` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`role` text,
	`banned` integer DEFAULT false,
	`ban_reason` text,
	`ban_expires` integer,
	`display_username` text,
	`email_verified` integer DEFAULT false NOT NULL,
	`phone_number_verified` integer,
	`affiliation` integer,
	FOREIGN KEY (`affiliation`) REFERENCES `departments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_user`("id", "name", "email", "username", "phone_number", "image", "created_at", "updated_at", "role", "banned", "ban_reason", "ban_expires", "display_username", "email_verified", "phone_number_verified", "affiliation") SELECT "id", "name", "email", "username", "phone_number", "image", "created_at", "updated_at", "role", "banned", "ban_reason", "ban_expires", "display_username", "email_verified", "phone_number_verified", "affiliation" FROM `user`;--> statement-breakpoint
DROP TABLE `user`;--> statement-breakpoint
ALTER TABLE `__new_user` RENAME TO `user`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_phone_number_unique` ON `user` (`phone_number`);