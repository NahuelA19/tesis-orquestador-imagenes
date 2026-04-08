export interface MedicalOrder {
  id: number;
  external_id: string;
  origin: string;
  modality: string;
  medical_order: string;
  location: string;
  study_setting: string;
  diagnosis: string;
  observations: string;
  patient_name: string;
  patient_lastname: string;
  patient_pseudonym: string;
  patient_dni: string;
  patient_dob: string;
  patient_age: number;
  requesting_physician: string;
  is_urgent: boolean;
  is_critical: boolean;
  is_active: boolean;
  created_at: string;
  was_notified: boolean;
}
