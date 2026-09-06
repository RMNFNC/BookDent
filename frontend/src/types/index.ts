export type Role = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface AuthUser {
  id: number;
  email: string;
  role: Role;
}

export interface MeProfile extends AuthUser {
  createdAt: string;
  patient: { id: number; firstName: string; lastName: string } | null;
  doctor: { id: number; firstName: string; lastName: string; specialization: string } | null;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface DoctorSummary {
  id: number;
  firstName: string;
  lastName: string;
  specialization: string;
  bio: string | null;
  isActive: boolean;
  userId: number;
  user?: { id: number; email: string };
}

export interface DentalService {
  id: number;
  name: string;
  description: string | null;
  durationMin: number | null;
  price: string | null;
  isActive: boolean;
}

export interface AvailabilitySlot {
  id: number;
  doctorId: number;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export interface AvailableSlot extends AvailabilitySlot {
  doctor: {
    id: number;
    firstName: string;
    lastName: string;
    specialization: string;
  };
}

export interface PatientProfile {
  id: number;
  firstName: string;
  lastName: string;
  codiceFiscale: string;
  dateOfBirth: string;
  phone: string;
  userId: number;
}

export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  serviceId: number;
  slotId: number;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
  patient: PatientProfile;
  doctor: DoctorSummary;
  service: DentalService;
  slot: AvailabilitySlot;
  medicalRecord?: MedicalRecord | null;
}

export interface MedicalRecord {
  id: number;
  appointmentId: number;
  diagnosis: string;
  treatment: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  appointment?: Appointment;
}

export interface ApiErrorPayload {
  message: string;
  errors?: { path: string; message: string }[];
}
