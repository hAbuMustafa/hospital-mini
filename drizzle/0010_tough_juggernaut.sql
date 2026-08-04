ALTER TABLE `patientAdmissions` ADD `nationality` text DEFAULT 'EG';--> statement-breakpoint
ALTER TABLE `patientAdmissions` ADD `referred_from` text;--> statement-breakpoint
DROP VIEW `patients_view`;--> statement-breakpoint
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
  a.insured,
  a.nationality,
  a.referred_from
FROM patientAdmissions a
LEFT JOIN patientDischarges d ON a.id = d.patient_id
LEFT JOIN recentWards_view t ON a.id = t.patient_id
;