"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { FaCalendarPlus, FaCalendarAlt, FaFileMedical } from "react-icons/fa";

export default function ProfilePage() {
  const { user, userRole } = useAuth();
  const router = useRouter();

  const getGreeting = () => {
    if (!user) {
      return "Chào mừng bạn";
    }
    // Thêm chức danh "Bác sĩ" nếu là doctor
    const title = userRole?.toLowerCase() === "doctor" ? "Bác sĩ " : "";
    return `Chào mừng trở lại, ${title}${user.fullName}!`;
  };

  return (
    <div className="flex w-full min-h-screen flex-col items-center justify-start bg-gray-50 p-8">
      <div className="w-full max-w-4xl rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-3xl font-bold text-gray-800">
          {getGreeting()}
        </h1>
        <p className="mb-8 text-gray-600">
          Sử dụng các lối tắt bên dưới hoặc thanh điều hướng để quản lý công
          việc của bạn.
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Lối tắt chung hoặc cho Bệnh nhân */}
          {userRole?.toLowerCase() === "patient" && (
            <>
              <div className="flex flex-col justify-between rounded-lg border border-blue-200 bg-blue-50 p-6">
                <div>
                  <h2 className="mb-2 text-xl font-semibold text-blue-800">
                    Đặt lịch hẹn mới
                  </h2>
                  <p className="mb-4 text-blue-700">
                    Nhanh chóng tìm kiếm và đặt lịch khám với các bác sĩ hàng
                    đầu.
                  </p>
                </div>
                <Button
                  variant="primary"
                  onClick={() => router.push("/booking")}
                  className="w-fit"
                >
                  <FaCalendarPlus className="mr-2" />
                  Đặt lịch ngay
                </Button>
              </div>
              <div className="flex flex-col justify-between rounded-lg border border-purple-200 bg-purple-50 p-6">
                <div>
                  <h2 className="mb-2 text-xl font-semibold text-purple-800">
                    Quản lý Hồ sơ Bệnh án
                  </h2>
                  <p className="mb-4 text-purple-700">
                    Xem sơ bệnh án của bạn.
                  </p>
                </div>
                <Button
                  variant="primary"
                  onClick={() => router.push("/profile/medical-records")}
                  className="w-fit bg-purple-600 hover:bg-purple-700"
                >
                  <FaFileMedical className="mr-1" />
                  Quản lý hồ sơ
                </Button>
              </div>
            </>
          )}

          {/* Lối tắt cho Bác sĩ */}
          {userRole?.toLowerCase() === "doctor" && (
            <>
              <div className="flex flex-col justify-between rounded-lg border border-green-200 bg-green-50 p-6">
                <div>
                  <h2 className="mb-2 text-xl font-semibold text-green-800">
                    Xem lịch làm việc
                  </h2>
                  <p className="mb-4 text-green-700">
                    Kiểm tra lịch hẹn hôm nay và quản lý các cuộc hẹn sắp tới
                    của bạn.
                  </p>
                </div>
                <Button
                  variant="primary"
                  onClick={() => router.push("/profile/schedule")}
                  className="w-fit bg-green-600 hover:bg-green-700"
                >
                  <FaCalendarAlt className="mr-1" />
                  Xem lịch
                </Button>
              </div>
              <div className="flex flex-col justify-between rounded-lg border border-purple-200 bg-purple-50 p-6">
                <div>
                  <h2 className="mb-2 text-xl font-semibold text-purple-800">
                    Quản lý Hồ sơ Bệnh án
                  </h2>
                  <p className="mb-4 text-purple-700">
                    Xem, tạo và cập nhật hồ sơ bệnh án cho các bệnh nhân của
                    bạn.
                  </p>
                </div>
                <Button
                  variant="primary"
                  onClick={() => router.push("/profile/medical-records")}
                  className="w-fit bg-purple-600 hover:bg-purple-700"
                >
                  <FaFileMedical className="mr-1" />
                  Quản lý hồ sơ
                </Button>
              </div>
            </>
          )}

          {/* Thêm các card khác ở đây nếu cần */}
        </div>
      </div>
    </div>
  );
}
