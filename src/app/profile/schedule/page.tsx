"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getDoctorById } from "@/services/DoctorServices";
import { useRouter } from "next/navigation";
import {
  FaClock,
  FaDollarSign,
  FaHourglassHalf,
  FaRegCalendarCheck,
  FaUserFriends,
  FaCheckCircle,
  FaListAlt,
  FaCalendarAlt,
} from "react-icons/fa";
import {
  formatAppointmentDate,
  formatTime,
  getStatusButtonClass,
} from "@/services/OtherServices";
import {
  translateDayOfWeek,
  translateAppointmentStatus,
} from "@/utils/translateEnums";
import { Appointment } from "@/types/frontend";
import { getAppointmentByDoctorId } from "@/services/AppointmentServices";
import Button from "@/components/Button";

// Định nghĩa kiểu dữ liệu cho recurringSchedule để code an toàn hơn
interface RecurringSchedule {
  id: number;
  daysOfWeek: string[];
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  price: number;
  startDate: string;
  endDate: string;
}

const DoctorSchedulePage = () => {
  const router = useRouter();
  const { userRole, doctorProfile } = useAuth();

  const [schedule, setSchedule] = useState<RecurringSchedule | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userRole?.toLowerCase() === "doctor" && doctorProfile?.profileId) {
      const fetchAllData = async () => {
        setLoading(true);
        try {
          // Gọi song song cả hai API
          const [doctorDetailsRes, appointmentsRes] = await Promise.all([
            getDoctorById(doctorProfile.profileId),
            getAppointmentByDoctorId(doctorProfile.profileId, {
              sortField: "appointmentDate",
              sortOrder: "asc",
              page: 1,
              appointmentsPerPage: 1000,
              filterStatus: "ALL",
            }),
          ]);

          setSchedule(doctorDetailsRes.recurringSchedule);
          setAppointments(appointmentsRes.data || []);
        } catch (error) {
          console.error("Failed to fetch doctor data:", error);
          setSchedule(null);
          setAppointments([]);
        } finally {
          setLoading(false);
        }
      };

      fetchAllData();
    } else {
      setLoading(false);
    }
  }, [userRole, doctorProfile]);

  // SỬA: Chuyển logic redirect vào trong useEffect
  //   useEffect(() => {
  //     // Redirect nếu không phải bác sĩ và đã hết loading
  //     if (!loading && userRole?.toLowerCase() !== "doctor") {
  //       router.push("/profile");
  //     }
  //   }, [loading, userRole, router]); // Hook này sẽ chạy mỗi khi loading, userRole thay đổi

  // Nếu đang loading hoặc chưa phải là bác sĩ, hiển thị một trạng thái chờ
  // để tránh render phần còn lại của trang một cách không cần thiết trước khi redirect
  if (loading || userRole?.toLowerCase() !== "doctor") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <p>Đang tải...</p>
      </div>
    );
  }

  // --- TÍNH TOÁN CÁC THỐNG KÊ ---
  const upcomingAppointments = appointments
    .filter((a) => a.status === "PENDING" || a.status === "CONFIRMED")
    .sort(
      (a, b) =>
        new Date(a.appointmentDate).getTime() -
        new Date(b.appointmentDate).getTime()
    )
    .slice(0, 5); // Lấy 5 lịch hẹn gần nhất

  const appointmentsToday = appointments.filter(
    (a) =>
      new Date(a.appointmentDate).toDateString() === new Date().toDateString()
  ).length;

  const completedAppointments = appointments.filter(
    (a) => a.status === "COMPLETED"
  ).length;

  return (
    <div className="w-full min-h-screen bg-gray-50 p-8">
      <div className="mx-auto w-full max-w-7xl">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-blue-700 mb-3">
          <FaCalendarAlt />
          Lịch làm việc
        </h2>

        {/* --- THỐNG KÊ NHANH --- */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            icon={<FaUserFriends />}
            label="Lịch hẹn hôm nay"
            value={appointmentsToday}
            color="blue"
          />
          <StatCard
            icon={<FaCheckCircle />}
            label="Ca đã hoàn thành"
            value={completedAppointments}
            color="green"
          />
          <StatCard
            icon={<FaListAlt />}
            label="Tổng số lịch hẹn"
            value={appointments.length}
            color="purple"
          />
          {/* <Button
            variant="green"
            className="h-full text-xl font-semibold"
            onClick={() => router.push("/profile/appointments")}
          >
            Xem tất cả lịch hẹn
          </Button> */}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* CỘT 1 & 2: LỊCH HẸN SẮP TỚI */}
          <div className="lg:col-span-2">
            <h2 className="mb-4 text-xl font-bold text-gray-800">
              Lịch hẹn sắp tới
            </h2>
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              {loading ? (
                <p>Đang tải...</p>
              ) : upcomingAppointments.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {upcomingAppointments.map((a) => (
                    <li
                      key={a.id}
                      className="flex flex-wrap items-center justify-between py-4"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {a.patient?.fullName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatAppointmentDate(a.appointmentDate)} -{" "}
                          {formatTime(a.appointmentTime)}
                        </p>
                      </div>
                      <div
                        className={`mr-4 rounded-full !w-fit px-3 py-1 text-xs font-semibold duration-300 ${getStatusButtonClass(
                          a.status
                        )}`}
                      >
                        {translateAppointmentStatus(a.status)}
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          router.push(`/profile/appointments/${a.id}`)
                        }
                      >
                        Chi tiết
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500">
                  Không có lịch hẹn nào sắp tới.
                </p>
              )}
            </div>
          </div>

          {/* CỘT 3: LỊCH LÀM VIỆC CỐ ĐỊNH */}
          <div>
            <h2 className="mb-4 text-xl font-bold text-gray-800">
              Lịch làm việc cố định
            </h2>
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              {loading ? (
                <p>Đang tải...</p>
              ) : schedule ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="flex items-center text-sm font-semibold text-gray-600">
                      <FaRegCalendarCheck className="mr-2" />
                      Ngày làm việc
                    </h3>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {schedule.daysOfWeek.map((day) => (
                        <span
                          key={day}
                          className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
                        >
                          {translateDayOfWeek(day)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <InfoItem
                    icon={<FaClock />}
                    label="Giờ làm việc"
                    value={`${formatTime(schedule.startTime)} - ${formatTime(
                      schedule.endTime
                    )}`}
                  />
                  <InfoItem
                    icon={<FaHourglassHalf />}
                    label="Thời lượng ca"
                    value={`${schedule.slotDurationMinutes} phút`}
                  />
                  <InfoItem
                    icon={<FaDollarSign />}
                    label="Giá khám"
                    value={`${schedule.price.toLocaleString("vi-VN")} VNĐ`}
                  />
                </div>
              ) : (
                <p className="text-center text-gray-500">
                  Chưa thiết lập lịch làm việc.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// SỬA: Định nghĩa kiểu cho props của StatCard
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "blue" | "green" | "purple";
}

// Component phụ cho các thẻ thống kê
const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => (
  <div className="flex items-center rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
    <div className={`mr-4 rounded-full p-3 bg-${color}-100 text-${color}-600`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);

// SỬA: Định nghĩa kiểu cho props của InfoItem
interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

// Component phụ cho các dòng thông tin
const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value }) => (
  <div>
    <h3 className="flex items-center text-sm font-semibold text-gray-600">
      {icon}
      <span className="ml-2">{label}</span>
    </h3>
    <p className="mt-1 pl-6 text-sm text-gray-800">{value}</p>
  </div>
);

export default DoctorSchedulePage;
