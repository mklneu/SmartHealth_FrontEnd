"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaVenusMars,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaEye,
  FaEyeSlash,
  FaPhoneAlt,
  FaIdCard,
  FaShieldAlt,
  FaHeartbeat,
  FaFileMedical,
  FaUserShield,
} from "react-icons/fa";
import { toast } from "react-toastify";
import Link from "next/link";
import { register } from "@/services/AuthServices";
import InputBar from "@/components/Input";
import { bloodTypeOptions, genderOptions } from "@/utils/map";
import { AxiosError } from "axios";
import { ErrorResponse, Gender } from "@/types/frontend";

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    fullName: "",
    password: "",
    confirmPassword: "",
    gender: "",
    address: "",
    dob: "",
    phoneNumber: "",
    citizenId: "",
    insuranceId: "",
    bloodType: "",
    medicalHistorySummary: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    // Kiểm tra các trường bắt buộc
    const requiredFields = {
      username: "Tên đăng nhập",
      email: "Email",
      fullName: "Họ và tên",
      password: "Mật khẩu",
      confirmPassword: "Nhập lại mật khẩu",
      gender: "Giới tính",
      address: "Địa chỉ",
      dob: "Ngày sinh",
      phoneNumber: "Số điện thoại",
      citizenId: "Số CCCD",
      emergencyContactName: "Người liên hệ khẩn cấp",
      emergencyContactPhone: "SĐT liên hệ khẩn cấp",
    };

    for (const [key, label] of Object.entries(requiredFields)) {
      if (!form[key as keyof typeof form]) {
        toast.error(`Vui lòng nhập ${label}!`);
        return false;
      }
    }

    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.email)) {
      toast.error("Email không hợp lệ!");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Mật khẩu nhập lại không khớp!");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // Truyền toàn bộ object form vào hàm register, ép kiểu trường gender về kiểu mong đợi
      await register({
        ...form,
        gender: form.gender as Gender,
      });
      // toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      router.push("/login");
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      toast.error(err?.response?.data?.message || "Đăng ký thất bại!");
      console.error("Lỗi đăng ký:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[90vh] items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 p-4">
      <div className="w-full max-w-[90vw] rounded-2xl bg-white py-8 px-10 shadow-2xl border border-blue-100">
        <h1 className="mb-2 text-center text-blue-700 text-3xl font-bold tracking-tight">
          Đăng ký tài khoản Bệnh nhân
        </h1>
        <p className="mb-6 text-center text-gray-500 text-sm">
          Tạo tài khoản mới để sử dụng{" "}
          <span className="font-semibold text-blue-600">SmartHealth</span>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
            {/* --- Thông tin tài khoản --- */}
            <div>
              <h3
                className="lg:col-span-2 text-lg border-green-400
              font-semibold text-green-600 my-4 border-b pb-2"
              >
                Thông tin tài khoản
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="lg:col-span-2">
                  <InputBar
                    placeholder="Tên đăng nhập"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    disabled={loading}
                    icon={<FaUser />}
                    autoFocus
                  />
                </div>
                <div className="lg:col-span-2">
                  <InputBar
                    placeholder="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={loading}
                    icon={<FaEnvelope />}
                  />
                </div>
                <InputBar
                  placeholder="Mật khẩu"
                  name="password"
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  disabled={loading}
                  icon={<FaLock />}
                  rightIcon={showPass ? <FaEyeSlash /> : <FaEye />}
                  onRightIconClick={() => setShowPass((v) => !v)}
                />
                <InputBar
                  placeholder="Nhập lại mật khẩu"
                  name="confirmPassword"
                  type={showConfirmPass ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  icon={<FaLock />}
                  rightIcon={showConfirmPass ? <FaEyeSlash /> : <FaEye />}
                  onRightIconClick={() => setShowConfirmPass((v) => !v)}
                />
              </div>
            </div>

            {/* --- Thông tin cá nhân --- */}
            <div>
              <h3
                className="lg:col-span-2 text-lg border-green-400
              font-semibold text-green-600 my-4 border-b pb-2"
              >
                Thông tin cá nhân
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <InputBar
                  placeholder="Họ và tên"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  disabled={loading}
                  icon={<FaUser />}
                />
                <InputBar
                  placeholder="Số điện thoại"
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  disabled={loading}
                  icon={<FaPhoneAlt />}
                />
                <InputBar
                  placeholder="Ngày sinh"
                  name="dob"
                  type="date"
                  value={form.dob}
                  onChange={handleChange}
                  disabled={loading}
                  icon={<FaBirthdayCake />}
                />
                <InputBar
                  placeholder="Giới tính"
                  name="gender"
                  type="select"
                  value={form.gender}
                  onChange={handleChange}
                  disabled={loading}
                  icon={<FaVenusMars />}
                  options={genderOptions}
                />
                <InputBar
                  placeholder="Số CCCD"
                  name="citizenId"
                  value={form.citizenId}
                  onChange={handleChange}
                  disabled={loading}
                  icon={<FaIdCard />}
                />
                <div className="lg:col-span-2">
                  <InputBar
                    placeholder="Địa chỉ"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    disabled={loading}
                    icon={<FaMapMarkerAlt />}
                  />
                </div>
              </div>
            </div>

            {/* --- Thông tin y tế --- */}
            <div>
              <h3
                className="lg:col-span-2 text-lg border-green-400
              font-semibold text-green-600 my-4 border-b pb-2
              line-clamp-1"
              >
                Thông tin y tế & Khẩn cấp
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <InputBar
                  placeholder="Số BHYT"
                  name="insuranceId"
                  value={form.insuranceId}
                  onChange={handleChange}
                  disabled={loading}
                  icon={<FaShieldAlt />}
                />
                <InputBar
                  placeholder="Nhóm máu (nếu biết)"
                  name="bloodType"
                  type="select"
                  value={form.bloodType}
                  onChange={handleChange}
                  disabled={loading}
                  icon={<FaHeartbeat />}
                  options={bloodTypeOptions.map((option) => ({
                    label: option.label,
                    value: option.value,
                  }))}
                />
                <div className="lg:col-span-2">
                  <InputBar
                    placeholder="Tiền sử bệnh án (tóm tắt)"
                    name="medicalHistorySummary"
                    type="textarea"
                    value={form.medicalHistorySummary}
                    onChange={handleChange}
                    disabled={loading}
                    icon={<FaFileMedical />}
                  />
                </div>
                <InputBar
                  placeholder="Người liên hệ khẩn cấp"
                  name="emergencyContactName"
                  value={form.emergencyContactName}
                  onChange={handleChange}
                  disabled={loading}
                  icon={<FaUserShield />}
                />
                <InputBar
                  placeholder="SĐT liên hệ khẩn cấp"
                  name="emergencyContactPhone"
                  value={form.emergencyContactPhone}
                  onChange={handleChange}
                  disabled={loading}
                  icon={<FaPhoneAlt />}
                />
              </div>
            </div>
          </div>
          <button
            type="submit"
            className={`w-full py-3 mt-1 rounded-lg font-bold text-white cursor-pointer
                 bg-blue-600 hover:bg-blue-700 transition duration-200 shadow-lg ${
                   loading ? "opacity-70 cursor-not-allowed" : ""
                 }`}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  ></path>
                </svg>
                Đang đăng ký...
              </span>
            ) : (
              "Đăng ký"
            )}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-500">
          Đã có tài khoản?{" "}
          <Link
            href="/login"
            className="text-blue-600 hover:underline font-medium"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
