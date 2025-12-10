"use client";
import {
  FaUserMd,
  FaChartLine,
  FaHeartbeat,
  FaCalendarCheck,
} from "react-icons/fa";
import { MdHealthAndSafety } from "react-icons/md";
import { IoMdStats } from "react-icons/io";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { getAllPatients } from "@/services/PatientServices";
import Button from "@/components/Button";
import { UserProfile } from "@/services/UserServices";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatCard = ({ title, value, icon, color }: StatCardProps) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-md p-6 
        border-t-4 ${color} hover:shadow-lg transition-all duration-300`}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        </div>
        <div
          className={`p-3 rounded-full ${color
            .replace("border-", "bg-")
            .replace("-500", "-100")}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 border border-gray-100">
      <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-blue-600">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
};

export default function Home() {
  const [userData, setUserData] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isLoggedIn, userRole } = useAuth();

  useEffect(() => {
    // --- "CUỘC TRANH LUẬN" (FIX LỖI) ---
    // "RÀO CHẮN" (Guard Clause)
    // Nếu 1 trong 2 (isLoggedIn, userRole) CHƯA SẴN SÀNG,
    // thì KHÔNG LÀM GÌ CẢ.
    if (!isLoggedIn || userRole === null) {
        // Nếu không đăng nhập, ta ngừng loading
        if (!isLoggedIn) {
            setIsLoading(false);
        }
        
        console.log("Guard clause: Bỏ qua (isLoggedIn:", isLoggedIn, ", userRole:", userRole, ")");
        return; // <-- DÒNG QUAN TRỌNG NHẤT
    }
    // --- KẾT THÚC FIX LỖI ---

    // Từ đây, chúng ta BIẾT CHẮC CHẮN
    // isLoggedIn = true VÀ userRole ĐÃ CÓ GIÁ TRỊ (ví dụ: "patient")

    const fetchData = async () => {
        console.log("Fetching data for role:", userRole); // Debug
        
        if (userRole !== "patient") {
            try {
                const params = {
                    page: 1,
                    size: 10,
                    searchTerm: "",
                    filterGender: "ALL",
                    role: "ALL",
                  };
                const res = await getAllPatients(params);
                setUserData(res?.data || []);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        } else {
            // Nếu role LÀ "patient", không fetch
            console.log("Role là patient, không fetch data.");
            setIsLoading(false);
        }
    };

    // Chúng ta đã qua "rào chắn", nên gọi fetchData() là an toàn.
    fetchData();

}, [isLoggedIn, userRole]); // Dependencies vẫn giữ nguyên

  // Giả lập dữ liệu thống kê
  const stats = [
    {
      title: "Tổng số người dùng",
      value: userData.length || 0,
      icon: <FaUserMd size={20} className="text-blue-500" />,
      color: "border-blue-500",
    },
    {
      title: "Lịch hẹn hôm nay",
      value: 24,
      icon: <FaCalendarCheck size={20} className="text-green-500" />,
      color: "border-green-500",
    },
    {
      title: "Bệnh nhân mới",
      value: 12,
      icon: <MdHealthAndSafety size={20} className="text-purple-500" />,
      color: "border-purple-500",
    },
    {
      title: "Báo cáo y tế",
      value: 156,
      icon: <IoMdStats size={20} className="text-amber-500" />,
      color: "border-amber-500",
    },
  ];

  const features = [
    {
      title: "Quản lý hồ sơ bệnh nhân",
      description:
        "Theo dõi và quản lý thông tin chi tiết của bệnh nhân một cách an toàn và hiệu quả.",
      icon: <FaUserMd size={24} />,
    },
    {
      title: "Đặt lịch thông minh",
      description:
        "Hệ thống đặt lịch tự động giúp tối ưu hóa thời gian và tránh trùng lịch.",
      icon: <FaCalendarCheck size={24} />,
    },
    {
      title: "Báo cáo sức khỏe",
      description:
        "Tạo và phân tích báo cáo sức khỏe chi tiết để đưa ra quyết định chính xác.",
      icon: <FaHeartbeat size={24} />,
    },
    {
      title: "Phân tích dữ liệu",
      description:
        "Trực quan hóa và phân tích dữ liệu sức khỏe để có cái nhìn toàn diện.",
      icon: <FaChartLine size={24} />,
    },
  ];

  // Demo phân quyền API
  // const [canAccess, setCanAccess] = useState(false);
  // Giả lập role, thực tế lấy từ user context hoặc localStorage
  // const userRole: "ADMIN" | "DOCTOR" | "USER" = "DOCTOR";

  // useEffect(() => {
  //   setCanAccess(canAccessApi("/api/users/123", userRole));
  // }, [userRole]);

  if (isLoading && isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo phân quyền API */}
      {/* <div className="container mx-auto px-4 pt-6">
        <div className="mb-6">
          {canAccess ? (
            <div className="text-green-600 font-semibold">
              Bạn có quyền truy cập API <code>/api/users/123</code> với vai trò{" "}
              <b>{userRole}</b>
            </div>
          ) : (
            <div className="text-red-600 font-semibold">
              Bạn <b>không có quyền</b> truy cập API <code>/api/users/123</code>{" "}
              với vai trò <b>{userRole}</b>
            </div>
          )}
        </div>
      </div> */}
      {/* Hero Section */}
      <section
        className=" relative
        bg-gradient-to-br  from-blue-500 to-blue-600
      dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-900 dark:to-slate-800
      text-white py-16"
      >
        <div
          className=" inset-0 absolute opacity-20
        bg-[url('https://www.transparenttextures.com/patterns/gplay.png')]"
        ></div>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Nền tảng quản lý y tế thông minh SmartHealth
              </h1>
              <p className="text-lg text-blue-100 mb-8">
                Giải pháp toàn diện giúp tối ưu hóa quy trình khám chữa bệnh,
                quản lý hồ sơ y tế và nâng cao chất lượng chăm sóc sức khỏe.
              </p>
              {userRole === "admin" ? (
                <div className="flex flex-wrap gap-4 ">
                  <Link
                    href="/admin/patients"
                    className="px-6 py-3 z-10 duration-300
                    bg-white text-blue-600 
                    font-medium rounded-lg hover:bg-blue-50"
                  >
                    Xem người dùng
                  </Link>
                  <Link
                    href="/admin/dashboard"
                    className="px-6 py-3 z-10
                    bg-transparent text-white duration-300
                    font-medium rounded-lg border
                     border-blue-400 hover:bg-white/10"
                  >
                    Dashboard
                  </Link>
                </div>
              ) : userRole === "doctor" ? null : userRole === "patient" ? (
                <div className="flex flex-wrap gap-4 ">
                  <Link
                    href="/booking"
                    className="px-6 py-3 bg-transparent duration-300
                     text-white font-medium rounded-lg z-100
                     border border-blue-400 hover:bg-white/10"
                  >
                    Đặt lịch khám
                  </Link>
                </div>
              ) : null}
            </div>

            {/* Homepage picture */}
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-xl h-96 group">
                {/* Hiệu ứng vòng tròn ánh sáng phía sau - làm to hơn */}
                <div className="absolute w-80 h-80 bg-blue-300/30 rounded-full blur-3xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>

                {/* Thêm vòng tròn thứ hai để tạo hiệu ứng depth */}
                <div className="absolute w-64 h-64 bg-indigo-300/20 rounded-full blur-2xl top-1/3 right-1/4 animate-pulse animation-delay-1000"></div>

                {/* Khung ảnh với đường viền và bóng - tăng kích thước */}
                <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 shadow-xl transform group-hover:scale-[1.02] transition-all duration-300"></div>

                {/* Ảnh chính - tăng padding để ảnh hiển thị đẹp hơn */}
                <div className="relative w-full h-full p-4">
                  <Image
                    src="/images/Healthcare.jpg"
                    alt="Giao diện quản lý y tế SmartHealth"
                    fill
                    className="object-cover rounded-lg z-10 drop-shadow-lg"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    style={{ objectPosition: "center" }}
                  />
                </div>

                {/* Thêm nhiều điểm sáng trang trí hơn */}
                <div className="absolute top-3 right-10 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                <div className="absolute bottom-6 left-8 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <div className="absolute top-1/4 left-10 w-2 h-2 bg-purple-400 rounded-full animate-pulse animation-delay-700"></div>
                <div className="absolute bottom-1/3 right-12 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-pulse animation-delay-500"></div>

                {/* Thêm lớp overlay hiệu ứng để nâng cao chiều sâu */}
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-transparent rounded-xl opacity-60"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {isLoggedIn && userRole !== "patient" && (
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">
              Tính năng nổi bật
            </h2>
            <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
              SmartHealth cung cấp các công cụ hiện đại giúp nâng cao hiệu quả
              quản lý và chăm sóc sức khỏe
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Recent Users Section */}
      {/* <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              Người dùng gần đây
            </h2>
            <Link
              href="/admin/users"
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Xem tất cả
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tuổi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giới tính
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {userData.slice(0, 5).map((user, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.age}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.gender === "MALE"
                          ? "Nam"
                          : user.gender === "FEMALE"
                          ? "Nữ"
                          : "Khác"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section> */}

      {/* Call to Action Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-500 to-blue-600">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Sẵn sàng nâng cao hiệu quả quản lý y tế?
          </h2>
          <p className="text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
            Khám phá các giải pháp SmartHealth và trải nghiệm cách quản lý y tế
            hiện đại, tiết kiệm thời gian và tối ưu hóa quy trình.
          </p>
          <div className="flex justify-center">
            <Button
              size="lg"
              variant="none"
              className="hover:bg-white/10"
              translate={false}
            >
              Bắt đầu ngay
            </Button>
          </div>
        </div>
      </section>
      {/* <div className="flex flex-row space-x-1 justify-center">
        <div className="card w-full">
          <div className="card-content">card</div>
        </div>
        <div className="card w-full">
          <div className="card-content">card</div>
        </div>
        <div className="card w-full">
          <div className="card-content">card</div>
        </div>
        <div className="card w-full">
          <div className="card-content">card</div>
        </div>
        <div className="card w-full">
          <div className="card-content">card</div>
        </div>
      </div> */}
    </div>
  );
}
