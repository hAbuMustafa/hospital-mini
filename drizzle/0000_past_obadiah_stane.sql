CREATE TABLE `drugs` (
	`name_ar` text,
	`unit` text,
	`tradename_ar` text,
	`name` text,
	`price` real,
	`price_resale` real,
	`record_4_page` integer,
	`stock_amount` integer,
	`query_in_UPA_sheet` text,
	`occurrences_in_UPA_sheet` integer,
	`category` text,
	`id` integer PRIMARY KEY NOT NULL,
	`record_2_page` integer,
	`smc_code` integer,
	`is_used` text,
	`tradename` text
);
--> statement-breakpoint
CREATE TABLE `narcoticsDispensed` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`timestamp` integer,
	`patient_id` text,
	`item_id` integer,
	`amount` integer
);
--> statement-breakpoint
CREATE TABLE `patientAdmissions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`id_type` text,
	`id_number` text,
	`diagnosis` text,
	`admission_date` integer,
	`ward_on_admission` text,
	`admission_notes` text,
	`gender` integer,
	`birthdate` integer,
	`insured` integer
);
--> statement-breakpoint
CREATE TABLE `patientDischarges` (
	`patient_id` text,
	`timestamp` integer,
	`reason` text
);
--> statement-breakpoint
CREATE TABLE `patientTransfers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`patient_id` text,
	`timestamp` integer,
	`to_ward` text
);
--> statement-breakpoint
CREATE TABLE `status` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`item` text,
	`value` integer
);
--> statement-breakpoint
CREATE VIEW `patients_view` AS 
SELECT 
  a.id,
  a.name,
  a.id_type,
  a.id_number,
  a.diagnosis,
  a.admission_date,
  d.timestamp as discharge_date,
  d.reason as discharge_reason,
  a.ward_on_admission,
  t.to_ward as ward_recent,
  a.admission_notes,
  a.gender,
  a.birthdate,
  a.insured
FROM patientAdmissions a
LEFT JOIN patientDischarges d ON a.id = d.patient_id
LEFT JOIN recentWards_view t ON a.id = t.patient_id
;--> statement-breakpoint
CREATE VIEW `recentWards_view` AS 
SELECT
  MAX(id) as id,
  patient_id,
  timestamp,
  to_ward
FROM patientTransfers
GROUP BY patient_id
;