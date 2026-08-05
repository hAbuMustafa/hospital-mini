ALTER TABLE `patientTransfers` ADD `is_admission` integer;--> statement-breakpoint
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
  t.to_ward as ward_on_admission,
  r.to_ward as ward_recent,
  a.admission_notes,
  a.gender,
  a.birthdate,
  a.insured,
  a.nationality,
  a.referred_from
FROM patientAdmissions a
LEFT JOIN patientTransfers t ON a.id = t.patient_id
LEFT JOIN patientDischarges d ON a.id = d.patient_id
LEFT JOIN recentWards_view r ON a.id = r.patient_id
;