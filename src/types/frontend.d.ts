import { AppointmentStatus } from "@/services/AppointmentServices";

interface IButton {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

interface resUser {
  id: number;
  username: string;
  fullName: string;
  email: string;
  dob: string;
  address: string;
  gender: string;
  role?: { id: number; name: string };
  company?: { id: number; name: string };
  // [key: string]: any; // For any other properties
}

interface reqUser {
  id: number;
  username: string;
  fullName: string;
  email: string;
  dob: string;
  address: string;
  gender: string;
  role?: { id: number };
  company?: { id: number };
  // [key: string]: any; // For any other properties
}

interface Doctor extends resUser {
  phoneNumber: string;
  specialty: string;
  experienceYears: number;
  price: number;
  hospital: { id: number; name?: string };
  //   certifications?: string[];
  //   education?: string;
  //   scheduleDays?: string[];
  //   scheduleHours?: string;
  //   about?: string;
  //   rating?: number;
}

// interface Hospital {
//   id: number;
//   name: string;
//   address: string;
//   logo: string;
//   description: string;
// }

interface ErrorResponse {
  error?: string;
  message?: string;
}

// Fake data structure (chuẩn bị cho API)
interface Appointment {
  id: number;
  createdAt: string;
  updatedAt: string;
  appointmentDate: string;
  appointmentTime: string;
  patientNote: string;
  doctorNote: string;
  clinicRoom: string;
  appointmentType: string;
  notificationSent: boolean;
  status: AppointmentStatus;
  createdBy: string;
  updatedBy: string;
  patient: { id: number; fullName: string };
  doctor: { id: number; fullName: string };
}

interface PaginationMeta {
  page: number;
  pageSize: number;
  pages: number;
  total: number;
}

interface PaginatedResponse<T> {
  meta: {
    page: number;
    pageSize: number;
    pages: number;
    total: number;
  };
  data: T[];
}

type TestResultStatus =
  | "REQUESTED"
  | "IN_PROGRESS"
  | "PRELIMINARY"
  | "COMPLETED"
  | "REVIEWED"
  | "CANCELLED";

type Gender = "MALE" | "FEMALE" | "OTHER";

// Định dạng option cho react-select
export interface SelectOption {
  value: number | string;
  label: string;
}

