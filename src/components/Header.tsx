"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "react-toastify";
import { useDoctorNotification } from "@/hooks/useDoctorNotification";
import { logout, isAuthenticated } from "@/services/AuthServices";
import { FaHome, FaInfoCircle } from "react-icons/fa";
import { MdHealthAndSafety } from "react-icons/md";
import { useAuth } from "@/contexts/AuthContext";
import { scrollToTop } from "./ScrollToTopButton";
import { getPatientById } from "@/services/PatientServices";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();

  const {
    isLoggedIn,
    setIsLoggedIn,
    userName,
    setUserName,
    userRole,
    setUserRole,
    // userId,
    setUserId,
    setUser,
    setAppointmentsUpdateTrigger,
    doctorProfile, // Thêm doctorProfile từ context
  } = useAuth();

  // Nhận thông báo realtime khi bác sĩ có lịch hẹn mới
  useDoctorNotification({
    // SỬA: Lấy ID từ doctorProfile thay vì userId
    doctorId: doctorProfile?.profileId ?? null,
    enabled: userRole?.toLowerCase() === "doctor" && !!doctorProfile?.profileId,
    onMessage: async (data) => {
      if (
        typeof data === "object" &&
        data !== null &&
        "patient" in data &&
        data.patient?.id
      ) {
        try {
          const user = await getPatientById(data.patient.id);
          console.log(">>> [FE] Thông tin bệnh nhân:", user);
          console.log(">>> [FE] Thông tin lịch hẹn mới:", data);

          // const newAppointmentData = {
          //   ...data.appointment, // Thông tin lịch hẹn từ WebSocket
          //   patient: user, // Thông tin bệnh nhân đã lấy
          //   // ... Thêm các trường dữ liệu cần thiết khác để hiển thị
          // };

          // 2. CẬP NHẬT STATE DANH SÁCH LỊCH HẸN TRỰC TIẾP
          // (Giả sử bạn có quyền truy cập hàm setAppointments ở đây)
          // HÀNH ĐỘNG CẦN THIẾT:
          // setAppointments((prevAppointments) => [
          //   data, // Thêm lịch hẹn mới vào đầu danh sách
          //   ...prevAppointments,
          // ]);

          toast.info(
            user?.fullName
              ? `Bạn có lịch hẹn mới từ bệnh nhân ${user.fullName}`
              : "Bạn có lịch hẹn mới!"
          );
          setAppointmentsUpdateTrigger((prev) => prev + 1);
        } catch {
          toast.info("Bạn có lịch hẹn mới!");
        }
      } else {
        toast.info("Bạn có lịch hẹn mới!");
      }
    },
  });

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập khi component mount
    setIsLoggedIn(isAuthenticated());
  }, [setIsLoggedIn]);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    // Xóa tab profile khỏi localStorage
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("profileActiveTab");
    }
    // Nếu context có setUserRole thì reset luôn
    if (typeof setUserName === "function" && typeof userRole !== "undefined") {
      // Nếu context có setUserRole thì setUserRole("")
      try {
        setUserRole("");
      } catch {}
    }
    logout(setIsLoggedIn, setUserName, setUserRole, setUserId, setUser);
    router.push("/login");
  };

  const navLinks = [
    {
      id: 1,
      href: "/",
      label: "Trang chủ",
      icon: <FaHome className="mr-2" />,
    },
    {
      id: 5,
      href: "/about",
      label: "Giới thiệu",
      icon: <FaInfoCircle className="mr-2" />,
    },
  ];

  // Determine if a navigation link is active
  const isActiveLink = (href: string) => {
    return pathname === href || pathname?.startsWith(href + "/");
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 px-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <MdHealthAndSafety className="text-3xl text-white group-hover:text-blue-200 duration-300" />
            <span className="font-bold text-xl tracking-tight text-white group-hover:text-blue-200 duration-300">
              SmartHealth
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const active = isActiveLink(link.href);
              return (
                <Link
                  key={link.id}
                  href={link.href}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                    active
                      ? "bg-white/20 text-white"
                      : "text-blue-100 hover:bg-white/10 hover:text-white"
                  }`}
                  onClick={
                    active
                      ? (e) => {
                          e.preventDefault();
                          scrollToTop();
                        }
                      : undefined
                  }
                >
                  {link.icon}
                  {link.label}
                </Link>
              );
            })}

            {/* Login/Logout based on authentication status */}
            {isLoggedIn ? (
              <>
                {/* Dropdown menu for user actions - keep open on hover/focus */}
                <div
                  className="relative"
                  onMouseEnter={() => setIsMenuOpen(true)}
                  onMouseLeave={() => setIsMenuOpen(false)}
                >
                  <button
                    className="px-4 py-2 text-white 
                    rounded-lg font-medium text-sm cursor-pointer
                    duration-200 bg-blue-700 hover:bg-blue-800 flex 
                    items-center focus:outline-none"
                    onClick={() => setIsMenuOpen((v) => !v)}
                    tabIndex={0}
                    aria-haspopup="true"
                    aria-expanded={isMenuOpen}
                  >
                    Chào {userName}
                  </button>
                  {isMenuOpen && (
                    <>
                      {/* Invisible spacer to keep hover/focus between button and dropdown */}
                      <div
                        className="absolute right-0 left-0 h-2"
                        style={{ top: "100%" }}
                      ></div>
                      <div
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg 
                        shadow-lg py-2 z-50 animate-fadeIn border border-blue-100"
                        tabIndex={-1}
                      >
                        <Link
                          href="/profile/info"
                          className="block px-4 py-2 text-gray-800 
                          hover:bg-blue-100 transition-colors duration-150"
                          tabIndex={0}
                          onClick={(e) => {
                            setIsMenuOpen(false);
                            if (pathname === "/profile/info") {
                              e.preventDefault();
                              scrollToTop();
                            }
                          }}
                        >
                          Hồ sơ cá nhân
                        </Link>
                        {userRole === "admin" && (
                          <Link
                            href="/admin/dashboard"
                            className="block px-4 py-2 text-gray-800 
                            hover:bg-blue-100 transition-colors duration-150"
                            tabIndex={0}
                            onClick={(e) => {
                              setIsMenuOpen(false);
                              if (pathname === "/admin/dashboard") {
                                e.preventDefault();
                                scrollToTop();
                              }
                            }}
                          >
                            Trang quản trị
                          </Link>
                        )}
                        {userRole === "staff" && (
                          <Link
                            href="/lab"
                            className="block px-4 py-2 text-gray-800 
                            hover:bg-blue-100 transition-colors duration-150"
                            tabIndex={0}
                            onClick={(e) => {
                              setIsMenuOpen(false);
                              if (pathname === "/lab") {
                                e.preventDefault();
                                scrollToTop();
                              }
                            }}
                          >
                            Trang xét nghiệm
                          </Link>
                        )}
                        <button
                          onClick={(e) => {
                            handleLogout(e);
                            setIsMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 cursor-pointer
                          text-red-600 hover:bg-red-50 duration-150"
                          tabIndex={0}
                        >
                          Đăng xuất
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="ml-2 px-4 cursor-pointer
                py-2 bg-white text-blue-700
                 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors duration-200"
              >
                Đăng nhập
              </Link>
            )}
          </nav>

          {/* Mobile Hamburger Button */}
          <button
            className="md:hidden flex flex-col gap-1.5 z-50 p-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
          >
            <span
              className={`w-6 h-0.5 bg-white transition-all duration-300 ${
                isMenuOpen ? "transform rotate-45 translate-y-2" : ""
              }`}
            ></span>
            <span
              className={`w-6 h-0.5 bg-white transition-all duration-300 ${
                isMenuOpen ? "opacity-0" : "opacity-100"
              }`}
            ></span>
            <span
              className={`w-6 h-0.5 bg-white transition-all duration-300 ${
                isMenuOpen ? "transform -rotate-45 -translate-y-2" : ""
              }`}
            ></span>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`md:hidden fixed inset-0 z-40 bg-blue-900/95 transition-all duration-300 backdrop-blur-sm ${
            isMenuOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex flex-col h-full justify-center items-center pt-16">
            {navLinks.map((link) => {
              const active = isActiveLink(link.href);
              return (
                <Link
                  key={link.id}
                  href={link.href}
                  className={`flex items-center w-64 justify-center py-4 text-lg ${
                    active
                      ? "text-white font-medium"
                      : "text-blue-200 hover:text-white"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.icon}
                  {link.label}
                </Link>
              );
            })}

            {/* Login/Logout for mobile */}
            <div className="mt-8">
              {isLoggedIn ? (
                <button
                  onClick={(e) => {
                    handleLogout(e as React.MouseEvent);
                    setIsMenuOpen(false);
                  }}
                  className="px-8 py-3 bg-white text-blue-700 rounded-lg font-medium hover:bg-blue-50 transition-colors duration-200"
                >
                  Đăng xuất
                </button>
              ) : (
                <Link
                  href="/login"
                  className="px-8 py-3 bg-white text-blue-700 rounded-lg font-medium hover:bg-blue-50 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
