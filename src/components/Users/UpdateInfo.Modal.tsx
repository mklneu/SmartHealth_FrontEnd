import { useState, useEffect } from "react";
import Button from "../Button";
import { useAuth } from "@/contexts/AuthContext";
import { ReqUpdateMyProfile, UserProfile } from "@/services/UserServices";
import { PatientProfile, ReqUpdatePatient } from "@/services/PatientServices";
import { DoctorProfile, ReqUpdateDoctor } from "@/services/DoctorServices";
import { ReqUpdateStaff, StaffProfile } from "@/services/StaffServices";
import InputBar from "../Input";
import { genderOptions } from "@/utils/map";
import { getAllHospitals, Hospital } from "@/services/HospitalServices";
import {
  getSpecialtiesByHospitalId,
  Specialty,
} from "@/services/SpecialtyServices";
import { translateSpecialty } from "@/utils/translateEnums";

interface UpdateInfoModalProps {
  show: boolean;
  setShow: (value: boolean) => void;
  user: UserProfile;
  onUpdate: (data: ReqUpdateMyProfile) => Promise<void>;
}

// Helper component cho các trường input
// const InputBar = ({
//   id,
//   label,
//   ...props
// }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
//   <div className="relative">
//     <input
//       id={id}
//       className="peer w-full border border-blue-200 text-gray-700 h-12 rounded-lg px-3 py-3 focus:outline-none focus:border-blue-500 bg-white placeholder-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
//       placeholder={label}
//       {...props}
//     />
//     <label
//       htmlFor={id}
//       className="absolute left-3 -top-2.5 text-gray-500 text-xs bg-white px-1 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-blue-600 peer-focus:text-xs"
//     >
//       {label}
//     </label>
//   </div>
// );

const UpdateInfoModal = ({
  show,
  setShow,
  user,
  onUpdate,
}: UpdateInfoModalProps) => {
  const { userRole } = useAuth();
  const [form, setForm] = useState<
    Partial<UserProfile & ReqUpdatePatient & ReqUpdateDoctor & ReqUpdateStaff>
  >({});
  const [saving, setSaving] = useState(false);
  const [hospitalOptions, setHospitalOptions] = useState<Hospital[]>([]);
  const [specialtyOptions, setSpecialtyOptions] = useState<Specialty[]>([]);

  // 1. Tách useEffect để xử lý việc tải chuyên khoa khi bệnh viện thay đổi
  useEffect(() => {
    // Nếu không phải bác sĩ hoặc không có hospitalId nào được chọn, thì không làm gì
    if (userRole !== "doctor" || !form.hospitalId) {
      setSpecialtyOptions([]); // Xóa danh sách chuyên khoa cũ
      return;
    }

    const fetchSpecialties = async () => {
      try {
        const newSpecialtyOptions = await getSpecialtiesByHospitalId(
          form.hospitalId?.toString() || ""
        );
        setSpecialtyOptions(newSpecialtyOptions);
      } catch (error) {
        console.error("Không thể tải danh sách chuyên khoa:", error);
        setSpecialtyOptions([]); // Đảm bảo danh sách rỗng nếu có lỗi
      }
    };

    fetchSpecialties();
  }, [form.hospitalId, userRole]); // Chạy lại khi hospitalId trong form thay đổi

  // 2. Cập nhật useEffect khởi tạo
  useEffect(() => {
    const initializeForm = async () => {
      if (user) {
        const commonFields = {
          fullName: user.fullName || "",
          dob: user.dob ? user.dob.slice(0, 10) : "",
          gender: user.gender || "MALE",
          address: user.address || "",
          phoneNumber: user.phoneNumber || "",
        };

        let specificFields = {};
        if (userRole === "patient") {
          const p = user as PatientProfile;
          specificFields = {
            citizenId: p.citizenId || "",
            insuranceId: p.insuranceId || "",
            bloodType: p.bloodType || "",
            medicalHistorySummary: p.medicalHistorySummary || "",
            emergencyContactName: p.emergencyContactName || "",
            emergencyContactPhone: p.emergencyContactPhone || "",
          };
        } else if (userRole === "doctor") {
          const d = user as DoctorProfile;
          specificFields = {
            experienceYears: d.experienceYears || 0,
            licenseNumber: d.licenseNumber || "",
            degree: d.degree || "",
            hospitalId: d.hospital?.id || "",
            specialtyId: d.specialty?.id || "",
          };

          try {
            // Chỉ cần tải danh sách bệnh viện ở đây
            const hospitalOpts = await getAllHospitals({size: 1000});
            setHospitalOptions(hospitalOpts.data);
          } catch (error) {
            console.error("Không thể tải danh sách bệnh viện:", error);
          }
        } else if (userRole === "staff") {
          const s = user as StaffProfile;
          specificFields = {
            employeeId: s.employeeId || "",
            department: s.department || "",
            hospitalId: s.hospital?.id || "",
          };
          try {
            // Chỉ cần tải danh sách bệnh viện ở đây
            const hospitalOpts = await getAllHospitals({size: 1000});
            setHospitalOptions(hospitalOpts.data);
          } catch (error) {
            console.error("Không thể tải danh sách bệnh viện:", error);
          }
        }
        setForm({ ...commonFields, ...specificFields });
      }
    };
    if (show) {
      initializeForm();
    }
  }, [user, userRole, show]);

  // 3. Cập nhật handleChange để reset specialtyId khi đổi bệnh viện
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    // Nếu người dùng thay đổi bệnh viện, reset lại lựa chọn chuyên khoa
    if (name === "hospitalId") {
      setForm((prev) => ({
        ...prev,
        hospitalId: value,
        specialtyId: "", // Reset chuyên khoa
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // "Cuộc tranh luận": "form" (State) (Trạng thái) đang "PHẲNG" (FLAT).
      // "Cuộc tranh luận": "onUpdate" (Service) đang "MONG ĐỢI" (EXPECTING) "BỌC" (WRAPPED).
      // "Giải pháp": "Thắng" (Fix) bằng cách "BIẾN ĐỔI" (TRANSFORM) nó
      // thành "DTO BỌC" (Wrapper DTO) "MỚI" (NEW) (ReqUpdateMyProfile).

      // 1. Tạo "DTO Bọc" (Wrapper) rỗng (empty)
      const bodyToSubmit: ReqUpdateMyProfile = {
        patientProfile: null,
        doctorProfile: null,
        staffProfile: null,
      };

      // 2. "Thắng" (Check) (Kiểm tra) Role và "nhét" (put)
      //    cái "form" (trạng thái) "phẳng" (flat) vào "ngăn kéo" (drawer) ĐÚNG (CORRECT)
      if (userRole === "patient") {
        bodyToSubmit.patientProfile = form as ReqUpdatePatient;
      } else if (userRole === "doctor") {
        bodyToSubmit.doctorProfile = form as ReqUpdateDoctor;
      } else if (userRole === "staff" || userRole === "admin") {
        bodyToSubmit.staffProfile = form as ReqUpdateStaff;
      }

      // 3. "Thắng" (Gửi) (Send) "DTO Bọc" (Wrapper) MỚI (NEW)
      await onUpdate(bodyToSubmit);
      // LỖI CŨ (SAI): await onUpdate(form);

      setShow(false);
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  const renderPatientFields = () => (
    <>
      <h4
        className="text-xl font-bold pb-2 mb-8 border-b-2
            text-green-600 border-green-200 md:col-span-2"
      >
        Thông tin y tế & liên hệ
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputBar
          label="Số CCCD"
          name="citizenId"
          value={form.citizenId ?? ""}
          onChange={handleChange}
        />
        <InputBar
          label="Số BHYT"
          name="insuranceId"
          value={form.insuranceId ?? ""}
          onChange={handleChange}
        />
        <InputBar
          label="Nhóm máu"
          name="bloodType"
          value={form.bloodType ?? ""}
          onChange={handleChange}
        />
        <InputBar
          label="Tiền sử bệnh án"
          name="medicalHistorySummary"
          value={form.medicalHistorySummary ?? ""}
          onChange={handleChange}
        />
        <InputBar
          label="Người liên hệ khẩn cấp"
          name="emergencyContactName"
          value={form.emergencyContactName ?? ""}
          onChange={handleChange}
        />
        <InputBar
          label="SĐT liên hệ khẩn cấp"
          name="emergencyContactPhone"
          value={form.emergencyContactPhone ?? ""}
          onChange={handleChange}
        />
      </div>
    </>
  );

  const renderDoctorFields = () => (
    <>
      <h4
        className="text-xl font-bold pb-2 mb-8 border-b-2
            text-green-600 border-green-200 md:col-span-2"
      >
        Thông tin chuyên môn
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <InputBar
            type="select"
            label="Bệnh viện công tác"
            name="hospitalId"
            value={form.hospitalId ?? ""}
            onChange={handleChange}
            options={hospitalOptions.map((h) => ({
              label: h.name,
              value: String(h.id),
            }))}
          />
        </div>
        <InputBar
          type="select"
          label="Chuyên khoa"
          name="specialtyId"
          value={form.specialtyId ?? ""}
          onChange={handleChange}
          options={specialtyOptions.map((s) => ({
            label: translateSpecialty(s.specialtyName),
            value: String(s.id),
          }))}
          disabled={!form.hospitalId || specialtyOptions.length === 0} // Vô hiệu hóa nếu chưa chọn BV
        />
        <InputBar
          label="Bằng cấp"
          name="degree"
          value={form.degree ?? ""}
          onChange={handleChange}
        />
        <InputBar
          label="Số năm kinh nghiệm"
          name="experienceYears"
          value={form.experienceYears ?? 0}
          onChange={handleChange}
        />
        <InputBar
          label="Số chứng chỉ hành nghề"
          name="licenseNumber"
          value={form.licenseNumber ?? ""}
          onChange={handleChange}
        />
      </div>
    </>
  );

  const renderStaffFields = () => (
    <>
      <h4
        className="text-xl font-bold pb-2 mb-8 border-b-2
            text-green-600 border-green-200 md:col-span-2"
      >
        Thông tin công việc
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputBar
          label="Mã nhân viên"
          name="employeeId"
          value={form.employeeId ?? ""}
          onChange={handleChange}
          disabled
        />
        <InputBar
          label="Phòng ban"
          name="department"
          value={form.department ?? ""}
          onChange={handleChange}
        />
        <div className="md:col-span-2">
          <InputBar
            type="select"
            label="Bệnh viện"
            name="hospitalId"
            value={form.hospitalId ?? ""}
            onChange={handleChange}
            options={hospitalOptions.map((h) => ({
              label: h.name,
              value: String(h.id),
            }))}
          />
        </div>
      </div>
    </>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center 
    justify-center bg-black/50 p-4 "
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${
          userRole !== "admin" && `max-w-6xl`
        }
      max-w-3xl relative animate-fadeIn overflow-auto flex flex-col max-h-[90vh]`}
      >
        <div
          className="bg-gradient-to-r from-blue-500 
        to-blue-700 px-8 py-5 flex-shrink-0"
        >
          <h3 className="text-xl font-bold text-white">Chỉnh sửa hồ sơ</h3>
        </div>
        <form className="p-8 pt-6 overflow-y-auto" onSubmit={handleSubmit}>
          <div
            className={`grid grid-cols-1 ${
              userRole !== "admin" && `md:grid-cols-2`
            } gap-x-6`}
          >
            <div>
              <h4
                className=" md:col-span-2
              text-xl font-bold pb-2 mb-8 border-b-2
            text-blue-600 border-blue-200"
              >
                Thông tin chung
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputBar
                  label="Họ và tên"
                  name="fullName"
                  value={form.fullName ?? ""}
                  onChange={handleChange}
                  required
                />
                <InputBar
                  label="Tên tài khoản"
                  name="username"
                  value={user.username}
                  disabled
                />
                <InputBar
                  label="Email"
                  name="email"
                  value={user.email}
                  disabled
                />
                <InputBar
                  label="Số điện thoại"
                  name="phoneNumber"
                  value={form.phoneNumber ?? ""}
                  onChange={handleChange}
                />
                <InputBar
                  label="Ngày sinh"
                  name="dob"
                  type="date"
                  value={form.dob ?? ""}
                  onChange={handleChange}
                  required
                />
                <InputBar
                  label="Giới tính"
                  name="gender"
                  type="select"
                  value={form.gender ?? ""}
                  placeholder="Chọn giới tính"
                  onChange={handleChange}
                  options={genderOptions}
                />
                <div className="md:col-span-2">
                  <InputBar
                    label="Địa chỉ"
                    name="address"
                    value={form.address ?? ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {userRole !== "admin" && (
              <div className="">
                {userRole === "patient" && renderPatientFields()}
                {userRole === "doctor" && renderDoctorFields()}
                {userRole === "staff" && renderStaffFields()}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShow(false)}
              disabled={saving}
            >
              Hủy
            </Button>
            <Button type="submit" isLoading={saving} disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateInfoModal;
