"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getAppointmentByDoctorId } from "@/services/AppointmentServices";
import { formatAppointmentDate, formatTime } from "@/services/OtherServices";
import { FaUserClock, FaSearch } from "react-icons/fa";
import Link from "next/link";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { translateAppointmentType } from "@/utils/translateEnums";
import { Appointment, ErrorResponse } from "@/types/frontend";

// Skeleton component for loading state
const PatientSkeletonCard = () => (
  <div className="bg-white p-4 rounded-lg shadow-md animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  </div>
);

const ExaminationsPage = () => {
  const { user, userRole } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfirmedAppointments = async () => {
      if (!user || userRole !== "doctor") {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const params = {
          sortField: "appointmentDate",
          sortOrder: "asc",
          page: 1,
          appointmentsPerPage: 100, // Lấy nhiều để hiển thị hết danh sách chờ
          filterStatus: "CONFIRMED", // Chỉ lấy lịch hẹn đã xác nhận
        };
        const response = await getAppointmentByDoctorId(user.profileId, params);
        setAppointments(response.data || []);
      } catch (error) {
        const err = error as AxiosError<ErrorResponse>;
        console.error("Error fetching appointments:", err.message);
        toast.error("Không thể tải danh sách bệnh nhân chờ.");
      } finally {
        setLoading(false);
      }
    };

    fetchConfirmedAppointments();
  }, [user, userRole]);

  return (
    <div className="p-4 md:p-8 bg-blue-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-700 mb-6 flex items-center gap-3">
          <FaUserClock />
          Danh sách bệnh nhân chờ khám
        </h1>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <PatientSkeletonCard key={i} />
            ))}
          </div>
        ) : appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((app) => (
              <Link
                href={`/profile/appointments/${app.id}`}
                key={app.id}
                className="block"
              >
                <div
                  className="bg-white p-4 rounded-lg 
                shadow-md hover:shadow-lg hover:-translate-y-1
                duration-300 cursor-pointer"
                >
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* <img
                      src={app.patient.avatar || "/default-avatar.png"}
                      alt={app.patient.fullName}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    /> */}
                    <div className="text-gray-500">
                      St.
                      <span className="text-sm">{app.id}</span>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h2 className="text-lg font-semibold text-gray-800">
                        {app.patient.fullName}
                      </h2>
                      {/* <p className="text-gray-600">Lý do khám: {app.reason}</p> */}
                    </div>
                    <div className="text-center sm:text-right">
                      <p className="font-semibold text-blue-600">
                        {formatTime(app.appointmentTime)} -{" "}
                        {formatAppointmentDate(app.appointmentDate)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {translateAppointmentType(app.appointmentType)}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 bg-white rounded-lg min-h-[300px] flex flex-col items-center justify-center text-center text-gray-500">
            <FaSearch className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700">
              Không có bệnh nhân nào
            </h3>
            <p className="mt-2">
              Hiện tại không có lịch hẹn nào đã được xác nhận.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExaminationsPage;
