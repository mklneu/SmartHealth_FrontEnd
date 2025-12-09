"use client";

import Link from "next/link";
import {
  FaBars,
  FaCalendarAlt,
  FaChevronLeft,
  FaFileContract,
  FaUser,
} from "react-icons/fa";
import { IoCalendarClear } from "react-icons/io5";
import { IoIosFolderOpen } from "react-icons/io";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { scrollToTop } from "../ScrollToTopButton";
import { FaUserClock } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";

const userLinks = [
  {
    href: "/profile/info",
    label: "Thông tin cá nhân",
    icon: <FaUser />,
  },
  {
    href: "/profile/schedule",
    label: "Lịch làm việc",
    icon: <FaCalendarAlt />,
    roles: ["doctor"], // Hiển thị cho bệnh nhân, bác sĩ và nhân viên
  },
  {
    href: "/profile/appointments",
    label: "Lịch hẹn",
    icon: <IoCalendarClear />,
    roles: ["patient", "doctor"], // Hiển thị cho bệnh nhân, bác sĩ và nhân viên
  },
  {
    href: "/profile/testResults",
    label: "Hồ sơ bệnh án",
    icon: <IoIosFolderOpen />,
    roles: ["patient"], // Hiển thị cho bệnh nhân và admin
  },
  {
    href: "/profile/examinations", // Sửa lại đường dẫn cho đúng
    label: "Chờ khám",
    icon: <FaUserClock />,
    roles: ["doctor"], // Chỉ hiển thị cho bác sĩ
  },
  {
    href: "/lab", // Sửa lại đường dẫn cho đúng
    label: "Yêu cầu xét nghiệm",
    icon: <FaUserClock />,
    roles: ["staff"], // Chỉ hiển thị cho bác sĩ
  },
  {
    href: "/profile/medical-records",
    label: "Hồ sơ bệnh án",
    icon: <FaFileContract />,
    roles: ["doctor"], // Hiển thị cho bệnh nhân, bác sĩ và nhân viên
  },
];

const UserSidebar = () => {
  const [open, setOpen] = useState(true);
  const pathname = usePathname();
  const { userRole } = useAuth();
  const router = useRouter(); // SỬA: Khởi tạo router

  // Lọc các link dựa trên vai trò của người dùng
  const filteredLinks = userLinks.filter(
    (link) => !link.roles || (userRole && link.roles.includes(userRole))
  );

  return (
    <div
      className="min-h-full bg-gradient-to-b shadow-lg 
        from-blue-700 to-blue-900"
    >
      <aside
        className={`sticky top-15 h-fit text-white 
        flex flex-col gap-2 duration-300 z-30 ${
          open ? "w-64 px-6 py-8" : "w-16 px-2 py-8"
        }`}
        style={{ minWidth: open ? 256 : 64 }}
      >
        <button
          className="absolute top-4 right-4 bg-blue-800 cursor-pointer outline-none
        hover:bg-blue-900 rounded-full p-2 transition-colors z-40"
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? "Thu gọn sidebar" : "Mở rộng sidebar"}
        >
          {open ? <FaChevronLeft /> : <FaBars />}
        </button>
        <h2
          className={`absolute top-4 text-2xl px-4 font-bold text-center
             tracking-wide duration-300 cursor-pointer ${
               open ? "opacity-100 delay-150" : "opacity-0 h-0 overflow-hidden"
             }`}
          onClick={() => router.push("/profile")}
        >
          {""} Người dùng
        </h2>
        <nav className="flex flex-col gap-2 mt-8">
          {filteredLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center rounded-lg duration-300
                font-medium text-md hover:bg-blue-800 hover:translate-x-1 h-12 ${
                  open
                    ? "justify-start px-4 py-3 goes-in"
                    : "justify-center p-3 goes-out"
                } ${
                pathname === link.href ? "bg-blue-800" : "" // Logic active state giữ nguyên
              }`}
              title={link.label}
              onClick={(e) => {
                if (pathname === link.href) {
                  e.preventDefault();
                  scrollToTop();
                }
              }}
            >
              {link.icon}
              <span
                className={`ml-2 duration-200 ${
                  open ? "inline" : "hidden h-[208px]"
                }`}
              >
                {link.label}
              </span>
            </Link>
          ))}
        </nav>
      </aside>
    </div>
  );
};

export default UserSidebar;
