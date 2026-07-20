CREATE TABLE `otp` (
	`phone-number` text NOT NULL,
	`otp` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `otp_phone-number_unique` ON `otp` (`phone-number`);