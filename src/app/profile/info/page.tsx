"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import UpdateInfoModal from "@/components/Users/UpdateInfo.Modal";
import {
  FaIdCard,
  FaHeartbeat,
  FaFileMedical,
  FaShieldAlt,
  FaUserShield,
  FaStethoscope,
  FaHospital,
  FaBriefcase,
  FaIdBadge,
  FaBuilding,
  FaPhoneAlt,
  FaEnvelope,
  FaBirthdayCake,
  FaVenusMars,
  FaMapMarkerAlt,
} from "react-icons/fa";
import Button from "@/components/Button";
import {
  getMyProfile,
  ReqUpdateMyProfile,
  updateMyProfile,
  UserProfile,
} from "@/services/UserServices";
import { toast } from "react-toastify";
import { PatientProfile } from "@/services/PatientServices";
import { DoctorProfile } from "@/services/DoctorServices";
import { StaffProfile } from "@/services/StaffServices";
import { translateSpecialty } from "@/utils/translateEnums";

// Helper để dịch các giá trị
const translateGender = (gender: string) => {
  if (gender === "MALE") return "Nam";
  if (gender === "FEMALE") return "Nữ";
  return "Khác";
};

const InfoTab = () => {
  // Lấy cả `user` từ context
  const { user, userRole, setUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showEdit, setShowEdit] = useState<boolean>(false);

  const handleUpdateInfo = async (data: ReqUpdateMyProfile) => {
    if (!profile) return;
    try {
      await updateMyProfile(data);
      await fetchProfile(); // Tải lại hồ sơ sau khi cập nhật
    } catch (error) {
      toast.error("Cập nhật thông tin thất bại.");
      console.error(error);
    }
  };

  const fetchProfile = async () => {
    // Không cần setLoading ở đây vì nó sẽ được xử lý bởi useEffect
    try {
      const res = await getMyProfile();
      setProfile(res);
      setUser(res); // Cập nhật context
      console.log("Profile updated in context:", res);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      toast.error("Không thể tải hồ sơ người dùng.");
    }
  };

  // Sửa lại useEffect ở đây
  useEffect(() => {
    // Nếu trong context đã có user, dùng nó ngay lập tức
    if (user) {
      setProfile(user);
      setLoading(false);
    } else {
      // Nếu không, fetch từ API (trường hợp tải lại trang trực tiếp)
      const initialFetch = async () => {
        setLoading(true);
        try {
          const res = await getMyProfile();
          setProfile(res);
          setUser(res); // Cập nhật context
        } catch (error) {
          console.error("Failed to fetch profile:", error);
          toast.error("Không thể tải hồ sơ người dùng.");
        } finally {
          setLoading(false);
        }
      };
      initialFetch();
    }
    // Phụ thuộc vào `user` từ context. Khi `user` thay đổi (sau khi update),
    // nó sẽ tự động cập nhật `profile` của trang này.
  }, [user, setUser]);

  if (loading) {
    return (
      <div className="text-center mt-10 min-h-screen">Đang tải hồ sơ...</div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center mt-10 text-red-500 min-h-screen">
        Không thể tải hồ sơ. Vui lòng thử lại.
      </div>
    );
  }

  const InfoItem = ({
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string | number | undefined | null;
  }) => (
    <div
      className="bg-gray-50/70 hover:shadow-inner hover:translate-y-[2px] duration-300
    rounded-xl px-6 py-4 flex items-center gap-4 border border-gray-100 h-full"
    >
      {/* Thêm flex-shrink-0 để icon không bị co lại */}
      <div className="flex-shrink-0">{icon}</div>
      {/* Thêm min-w-0 để cho phép khối này co lại và ngắt chữ */}
      <div className="min-w-0">
        <div className="text-gray-500 text-sm mb-1">{label}</div>
        <div className="font-semibold text-base text-gray-800 break-words">
          {value || "-"}
        </div>
      </div>
    </div>
  );

  const renderPatientInfo = (p: PatientProfile) => (
    <div className="space-y-4">
      <h3
        className="text-xl font-bold pb-2 mb-4 border-b-2
       text-green-700 border-green-200"
      >
        Thông tin y tế
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoItem
          icon={<FaHeartbeat size={20} color="#ef4444" />}
          label="Nhóm máu"
          value={p.bloodType}
        />
        <InfoItem
          icon={<FaShieldAlt size={20} color="#22c55e" />}
          label="Số BHYT"
          value={p.insuranceId}
        />
        <div className="md:col-span-2">
          <InfoItem
            icon={<FaFileMedical size={20} color="#3b82f6" />}
            label="Tiền sử bệnh án"
            value={p.medicalHistorySummary}
          />
        </div>
      </div>
      <h3
        className="text-xl font-bold pb-2 mb-4 border-b-2
       text-red-700 border-red-200"
      >
        Liên hệ khẩn cấp
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoItem
          icon={<FaUserShield size={20} color="#f97316" />}
          label="Người liên hệ"
          value={p.emergencyContactName}
        />
        <InfoItem
          icon={<FaPhoneAlt size={20} color="#10b981" />}
          label="SĐT người liên hệ"
          value={p.emergencyContactPhone}
        />
      </div>
    </div>
  );

  const renderDoctorInfo = (d: DoctorProfile) => (
    <>
      <h3
        className="text-xl font-bold pb-2 mb-4 border-b-2
       text-green-700 border-green-200"
      >
        Thông tin chuyên môn
      </h3>
      <div className=" grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoItem
          icon={<FaStethoscope size={20} color="#8b5cf6" />}
          label="Chuyên khoa"
          value={translateSpecialty(d.specialty.specialtyName)}
        />
        <InfoItem
          icon={<FaHospital size={20} color="#14b8a6" />}
          label="Bệnh viện"
          value={d.hospital.name}
        />
        <InfoItem
          icon={<FaBriefcase size={20} color="#64748b" />}
          label="Số năm kinh nghiệm"
          value={`${d.experienceYears} năm`}
        />
        <InfoItem
          icon={<FaIdBadge size={20} color="#f97316" />}
          label="Bằng cấp"
          value={d.degree}
        />
        <div className="md:col-span-2">
          <InfoItem
            icon={<FaIdCard size={20} color="#3b82f6" />}
            label="Số chứng chỉ hành nghề"
            value={d.licenseNumber}
          />
        </div>
      </div>
    </>
  );

  const renderStaffInfo = (s: StaffProfile) => (
    <>
      <h3
        className="text-xl text-green-700
       border-green-200 font-bold pb-2 mb-4 border-b-2"
      >
        Thông tin công việc
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoItem
          icon={<FaIdBadge size={20} color="#f97316" />}
          label="Mã nhân viên"
          value={s.employeeId}
        />
        <InfoItem
          icon={<FaBuilding size={20} color="#64748b" />}
          label="Phòng ban"
          value={s.department}
        />
        <div className="md:col-span-2">
          <InfoItem
            icon={<FaHospital size={20} color="#14b8a6" />}
            label="Bệnh viện"
            value={s.hospital?.name}
          />
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* "Cuộc tranh luận": "Vứt" (Remove) dark: */}
      <div className="min-h-screen w-full bg-gray-50">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <div className="flex flex-col lg:flex-row items-start gap-4">
            {/* --- CỘT BÊN TRÁI (SIDEBAR) --- */}
            <div className="w-full lg:w-1/3 lg:max-w-sm flex-shrink-0 lg:sticky lg:top-24">
              {/* "Cuộc tranh luận": "Vứt" (Remove) dark: */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center">
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-7xl font-bold shadow-lg border-4 border-white">
                  {profile.fullName.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 mt-5 text-center">
                  {profile.fullName}
                </h2>
                <p className="text-zinc-500 mt-1">@{profile.username}</p>
                {/* "Cuộc tranh luận": "Vứt" (Remove) dark: */}
                {/* <span className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                  {profile.role.replace("ROLE_", "").charAt(0) +
                    profile.role.replace("ROLE_", "").slice(1).toLowerCase()}
                </span> */}
                <Button className="mt-3" onClick={() => setShowEdit(true)}>
                  Chỉnh sửa hồ sơ
                </Button>
              </div>
            </div>

            {/* --- CỘT BÊN PHẢI (NỘI DUNG CHÍNH) --- */}
            <div className="w-full lg:w-2/3 space-y-4">
              {/* Card "Thông tin chung" */}
              {/* "Cuộc tranh luận": "Vứt" (Remove) dark: */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                {/* "Cuộc tranh luận": "Vứt" (Remove) dark: */}
                <h3
                  className="text-xl font-bold pb-2 mb-4 border-b-2
                text-blue-700 border-blue-200"
                >
                  Thông tin chung
                </h3>
                <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem
                    icon={<FaEnvelope size={20} color="#3b82f6" />}
                    label="Email"
                    value={profile.email}
                  />
                  <InfoItem
                    icon={<FaPhoneAlt size={20} color="#10b981" />}
                    label="Số điện thoại"
                    value={profile.phoneNumber}
                  />
                  <InfoItem
                    icon={<FaBirthdayCake size={20} color="#f97316" />}
                    label="Ngày sinh"
                    value={new Date(profile.dob).toLocaleDateString("vi-VN")}
                  />
                  <InfoItem
                    icon={<FaVenusMars size={20} color="#8b5cf6" />}
                    label="Giới tính"
                    value={translateGender(profile.gender)}
                  />
                  {userRole === "patient" && (
                    <div className="md:col-span-2">
                      <InfoItem
                        icon={<FaIdCard size={20} color="#64748b" />}
                        label="CCCD/CMND"
                        value={(profile as PatientProfile).citizenId}
                      />
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <InfoItem
                      icon={<FaMapMarkerAlt size={20} color="#ef4444" />}
                      label="Địa chỉ"
                      value={profile.address}
                    />
                  </div>
                </div>
              </div>

              {/* Card "Thông tin riêng" (Specific Info) */}
              {userRole !== "admin" && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                  {userRole === "patient" &&
                    renderPatientInfo(profile as PatientProfile)}
                  {userRole === "doctor" &&
                    renderDoctorInfo(profile as DoctorProfile)}
                  {userRole === "staff" &&
                    renderStaffInfo(profile as StaffProfile)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL (Giữ nguyên) */}
      {profile && (
        <UpdateInfoModal
          show={showEdit}
          setShow={setShowEdit}
          user={profile}
          onUpdate={handleUpdateInfo}
        />
      )}
    </>
  );
};

export default InfoTab;
