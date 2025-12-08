"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { getAccount, isAuthenticated } from "@/services/AuthServices";
// import { getPatientById } from "@/services/PatientServices";
import { Appointment } from "@/types/frontend";
import { getMyProfile, UserProfile } from "@/services/UserServices";
import { PatientProfile } from "@/services/PatientServices";
import { StaffProfile } from "@/services/StaffServices";
import { DoctorProfile } from "@/services/DoctorServices";

// Định nghĩa kiểu dữ liệu cho context
type AuthContextType = {
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  userName: string | null;
  setUserName: React.Dispatch<React.SetStateAction<string | null>>;
  userRole: string | null;
  setUserRole: React.Dispatch<React.SetStateAction<string | null>>;
  userId: number | null;
  setUserId: React.Dispatch<React.SetStateAction<number | null>>;
  user: UserProfile | null;
  patientProfileId: number | null;
  setPatientProfileId: React.Dispatch<React.SetStateAction<number | null>>;
  patientProfile: PatientProfile | null;
  setPatientProfile: React.Dispatch<
    React.SetStateAction<PatientProfile | null>
  >;
  doctorProfile: DoctorProfile | null;
  setDoctorProfile: React.Dispatch<React.SetStateAction<DoctorProfile | null>>;
  staffProfile: StaffProfile | null;
  setStaffProfile: React.Dispatch<React.SetStateAction<StaffProfile | null>>;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  appointmentsUpdateTrigger: number;
  setAppointmentsUpdateTrigger: React.Dispatch<React.SetStateAction<number>>;
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  STORAGE_BASE_URL: string;
  folderName: string;
};

// Tạo context với giá trị mặc định
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// Hook để sử dụng context một cách dễ dàng
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Provider component bao bọc ứng dụng
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [patientProfileId, setPatientProfileId] = useState<number | null>(null);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(
    null
  );
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(
    null
  );
  const [staffProfile, setStaffProfile] = useState<StaffProfile | null>(null);
  const [appointmentsUpdateTrigger, setAppointmentsUpdateTrigger] = useState(0);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const STORAGE_BASE_URL =
    process.env.NEXT_PUBLIC_STORAGE_BASE_URL || "http://localhost:8080/storage";
  const folderName = "test-results";

  // Sửa lại useEffect để chỉ chạy một lần khi component được mount
  useEffect(() => {
    // Định nghĩa một hàm async để kiểm tra và lấy thông tin người dùng
    const validateAndFetchUser = async () => {
      if (isAuthenticated()) {
        try {
          // 1. Lấy thông tin tài khoản cơ bản (id, username, role)
          const account = await getAccount();
          const accountUser = account?.user;

          if (accountUser?.id) {
            // 2. Cập nhật các state cơ bản
            setIsLoggedIn(true);
            setUserId(accountUser.id);
            setUserName(accountUser.username || null);
            setUserRole(accountUser.role?.name || null);

            // 3. Dùng id vừa lấy được để fetch hồ sơ chi tiết
            const fullProfile = await getMyProfile();
            setUser(fullProfile || null);
            setPatientProfile(fullProfile as PatientProfile || null);
            setStaffProfile(fullProfile as StaffProfile || null);
            setDoctorProfile(fullProfile as DoctorProfile || null);
            console.log("Fetched full profile:", fullProfile);
            setPatientProfileId(fullProfile?.profileId || null);
            console.log("Fetched profileId:", fullProfile?.profileId);
          } else {
            // Nếu không lấy được account, coi như chưa đăng nhập
            throw new Error("Không thể lấy thông tin tài khoản.");
          }
        } catch (error) {
          console.error("Lỗi xác thực hoặc lấy thông tin:", error);
          // Nếu có lỗi, reset tất cả state
          setIsLoggedIn(false);
          setUser(null);
          setUserName(null);
          setUserRole(null);
          setUserId(null);
        }
      }
    };

    validateAndFetchUser();
  }, []); // <-- Mảng phụ thuộc rỗng để đảm bảo chỉ chạy một lần

  const providerValue: AuthContextType = {
    isLoggedIn,
    setIsLoggedIn,
    userName,
    setUserName,
    userRole,
    setUserRole,
    userId,
    setUserId,
    user,
    setUser,
    patientProfileId,
    setPatientProfileId,
    patientProfile,
    setPatientProfile,
    staffProfile,
    setStaffProfile,
    doctorProfile,
    setDoctorProfile,
    appointmentsUpdateTrigger,
    setAppointmentsUpdateTrigger,
    appointments,
    setAppointments,
    STORAGE_BASE_URL,
    folderName,
  };

  return (
    <AuthContext.Provider value={providerValue}>
      {children}
    </AuthContext.Provider>
  );
};
