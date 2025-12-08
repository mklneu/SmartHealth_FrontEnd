"use client";

import { useState, useEffect } from "react";
import { FaCalendarCheck, FaChartLine, FaUser } from "react-icons/fa";
import { MdHealthAndSafety, MdWarning } from "react-icons/md";
import { IoMdTrendingUp, IoMdTrendingDown } from "react-icons/io";
import { BiDollar } from "react-icons/bi";
import { Chart, registerables } from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";
import { getOverviewStatistics, Overview } from "@/services/StatisticServices";
import { getAllPatients, PatientQueryParams } from "@/services/PatientServices";
import { UserProfile } from "@/services/UserServices";
import Link from "next/link";

Chart.register(...registerables);

const Dashboard = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [overview, setOverview] = useState<Overview>();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("week");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params: PatientQueryParams = {
          page: 1,
          size: 1000, // Lấy tối đa 1000 user cho thống kê
          searchTerm: "",
          filterGender: "ALL",
          role: "ALL",
        };
        const usersResponse = await getAllPatients(params);
        const overviewResponse = await getOverviewStatistics();
        // 2. Dữ liệu trả về nằm trong thuộc tính 'data'
        setUsers(usersResponse.data);
        setOverview(overviewResponse);
        console.log("Fetched overview:", overviewResponse);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Lưu ý: Dữ liệu mẫu - trong ứng dụng thực, dữ liệu này sẽ đến từ API
  const statsData = {
    totalUsers: overview?.totalUsers || 0,
    totalPatients: overview?.totalPatients || 0,
    totalAppointments: overview?.totalAppointments || 0,
    totalDoctors: overview?.totalDoctors || 0,
    revenue: overview?.revenue || 0,
    pendingAppointments: overview?.pendingAppointments || 0,
    completedAppointments: overview?.completedAppointments || 0,
    cancelledAppointments: overview?.cancelledAppointments || 0,
  };

  // Phân bổ giới tính
  const genderDistribution = {
    labels: ["Nam", "Nữ", "Khác"],
    datasets: [
      {
        label: "Phân bổ giới tính",
        data: [
          users.filter((user) => user.gender === "MALE").length,
          users.filter((user) => user.gender === "FEMALE").length,
          users.filter((user) => user.gender === "OTHER").length,
        ],
        backgroundColor: [
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 99, 132, 0.7)",
          "rgba(153, 102, 255, 0.7)",
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Dữ liệu lịch hẹn hàng tháng
  const appointmentData = {
    labels: [
      "T1",
      "T2",
      "T3",
      "T4",
      "T5",
      "T6",
      "T7",
      "T8",
      "T9",
      "T10",
      "T11",
      "T12",
    ],
    datasets: [
      {
        label: "Lịch hẹn",
        data: [65, 59, 80, 81, 56, 55, 40, 45, 60, 70, 75, 90],
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // Phân loại bệnh nhân
  const patientCategoryData = {
    labels: ["Nội khoa", "Ngoại khoa", "Sản", "Nhi", "Tim mạch", "Khác"],
    datasets: [
      {
        label: "Số lượng bệnh nhân",
        data: [120, 90, 70, 85, 65, 75],
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Danh sách lịch hẹn gần đây
  const recentAppointments = [
    {
      id: 1,
      patient: "Nguyễn Văn A",
      doctor: "BS. Trần Thị B",
      date: "21/09/2025",
      time: "09:00",
      status: "completed",
    },
    {
      id: 2,
      patient: "Lê Thị C",
      doctor: "BS. Phạm Văn D",
      date: "21/09/2025",
      time: "10:30",
      status: "pending",
    },
    {
      id: 3,
      patient: "Trần Văn E",
      doctor: "BS. Nguyễn Thị F",
      date: "21/09/2025",
      time: "14:15",
      status: "cancelled",
    },
    {
      id: 4,
      patient: "Phạm Thị G",
      doctor: "BS. Lê Văn H",
      date: "22/09/2025",
      time: "08:45",
      status: "pending",
    },
    {
      id: 5,
      patient: "Hoàng Văn I",
      doctor: "BS. Trần Thị B",
      date: "22/09/2025",
      time: "11:00",
      status: "pending",
    },
  ];

  // Thông báo hệ thống
  const systemAlerts = [
    {
      id: 1,
      type: "warning",
      message: "Cần cập nhật phần mềm phiên bản mới",
      time: "2 giờ trước",
    },
    {
      id: 2,
      type: "info",
      message: "5 bệnh nhân mới đăng ký trong hôm nay",
      time: "5 giờ trước",
    },
    {
      id: 3,
      type: "error",
      message: "Lỗi kết nối với máy chủ dữ liệu",
      time: "1 ngày trước",
    },
  ];

  // Định dạng tiền tệ VND
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-lg">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-blue-100">
            Xin chào Admin, chào mừng quay trở lại hệ thống SmartHealth
          </p>

          <div className="flex justify-end mt-4">
            <div className="flex bg-white/10 rounded-lg overflow-hidden">
              <button
                onClick={() => setSelectedPeriod("week")}
                className={`px-4 py-1 ${
                  selectedPeriod === "week" ? "bg-white/20" : ""
                }`}
              >
                Tuần
              </button>
              <button
                onClick={() => setSelectedPeriod("month")}
                className={`px-4 py-1 ${
                  selectedPeriod === "month" ? "bg-white/20" : ""
                }`}
              >
                Tháng
              </button>
              <button
                onClick={() => setSelectedPeriod("year")}
                className={`px-4 py-1 ${
                  selectedPeriod === "year" ? "bg-white/20" : ""
                }`}
              >
                Năm
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-6">
        {/* Thống kê tổng quan */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-blue-500 hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">
                  Tổng số người dùng
                </p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {statsData.totalUsers}
                </h3>
                <p className="text-green-600 text-xs font-medium flex items-center mt-2">
                  <IoMdTrendingUp className="mr-1" /> +5.2% so với tuần trước
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FaUser size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-green-500 hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">
                  Tổng số bệnh nhân
                </p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {statsData.totalPatients}
                </h3>
                <p className="text-green-600 text-xs font-medium flex items-center mt-2">
                  <IoMdTrendingUp className="mr-1" /> +2.8% so với tuần trước
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <MdHealthAndSafety size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-amber-500 hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">
                  Lịch hẹn
                </p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {statsData.totalAppointments}
                </h3>
                <p className="text-green-600 text-xs font-medium flex items-center mt-2">
                  <IoMdTrendingUp className="mr-1" /> +8.1% so với tuần trước
                </p>
              </div>
              <div className="p-3 rounded-full bg-amber-100 text-amber-600">
                <FaCalendarCheck size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-purple-500 hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">
                  Doanh thu
                </p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {formatCurrency(statsData.revenue)}
                </h3>
                <p className="text-red-600 text-xs font-medium flex items-center mt-2">
                  <IoMdTrendingDown className="mr-1" /> -1.3% so với tuần trước
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <BiDollar size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Biểu đồ và thống kê */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800">
                Thống kê lịch hẹn
              </h2>
              <div className="text-sm text-gray-500">
                <span className="font-medium">
                  {selectedPeriod === "week"
                    ? "7 ngày qua"
                    : selectedPeriod === "month"
                    ? "30 ngày qua"
                    : "12 tháng qua"}
                </span>
              </div>
            </div>
            <div className="h-80">
              <Line
                data={appointmentData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "top",
                    },
                    title: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                    x: {
                      type: "category",
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-lg font-bold text-gray-800 mb-6">
              Phân bổ giới tính
            </h2>
            <div className="h-64 flex justify-center">
              <Pie
                data={genderDistribution}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                    },
                  },
                }}
              />
            </div>
            <div className="mt-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-blue-50 p-2 rounded-lg">
                  <p className="text-sm text-gray-600">Nam</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {users.filter((user) => user.gender === "MALE").length}
                  </p>
                </div>
                <div className="bg-pink-50 p-2 rounded-lg">
                  <p className="text-sm text-gray-600">Nữ</p>
                  <p className="text-lg font-semibold text-pink-600">
                    {users.filter((user) => user.gender === "FEMALE").length}
                  </p>
                </div>
                <div className="bg-purple-50 p-2 rounded-lg">
                  <p className="text-sm text-gray-600">Khác</p>
                  <p className="text-lg font-semibold text-purple-600">
                    {users.filter((user) => user.gender === "OTHER").length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Phân loại bệnh nhân */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-lg font-bold text-gray-800 mb-6">
              Phân loại bệnh nhân
            </h2>
            <div className="h-80">
              <Bar
                data={patientCategoryData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Danh sách lịch hẹn gần đây */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800">
                Lịch hẹn gần đây
              </h2>
              <Link href="/admin/appointments" className="text-blue-600 text-sm hover:underline">
                Xem tất cả
              </Link>
            </div>
            <div className="space-y-4">
              {recentAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50"
                >
                  <div
                    className={`w-2 h-10 rounded-full mr-4 ${
                      appointment.status === "completed"
                        ? "bg-green-500"
                        : appointment.status === "pending"
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                  ></div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-800">
                      {appointment.patient}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {appointment.doctor}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-800">{appointment.date}</p>
                    <p className="text-xs text-gray-500">{appointment.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Thông báo hệ thống và thống kê nhanh */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Thông báo hệ thống
              </h2>
              <div className="space-y-3">
                {systemAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border-l-4 ${
                      alert.type === "warning"
                        ? "border-amber-500 bg-amber-50"
                        : alert.type === "error"
                        ? "border-red-500 bg-red-50"
                        : "border-blue-500 bg-blue-50"
                    }`}
                  >
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <span
                          className={`mr-2 ${
                            alert.type === "warning"
                              ? "text-amber-500"
                              : alert.type === "error"
                              ? "text-red-500"
                              : "text-blue-500"
                          }`}
                        >
                          {alert.type === "warning" ? (
                            <MdWarning />
                          ) : alert.type === "error" ? (
                            <MdWarning />
                          ) : (
                            <FaChartLine />
                          )}
                        </span>
                        <p className="text-sm text-gray-500">{alert.message}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {alert.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Tình trạng lịch hẹn
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <p className="text-green-600 text-xl font-bold">
                    {statsData.completedAppointments}
                  </p>
                  <p className="text-xs text-gray-600">Đã hoàn thành</p>
                </div>
                <div className="bg-amber-50 p-3 rounded-lg text-center">
                  <p className="text-amber-600 text-xl font-bold">
                    {statsData.pendingAppointments}
                  </p>
                  <p className="text-xs text-gray-600">Đang chờ</p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg text-center">
                  <p className="text-red-600 text-xl font-bold">
                    {statsData.cancelledAppointments}
                  </p>
                  <p className="text-xs text-gray-600">Đã hủy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
