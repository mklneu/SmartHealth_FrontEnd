import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "../Button";
import InputBar from "../Input";
import { createDoctor } from "@/services/DoctorServices"; // Đảm bảo bạn đã có các hàm service này
import { genderOptions } from "@/utils/map";
import {
  getSpecialtiesByHospitalId,
  Specialty,
} from "@/services/SpecialtyServices";
import { AxiosError } from "axios";
import { ErrorResponse, Gender } from "@/types/frontend";
import { getAllHospitals, Hospital } from "@/services/HospitalServices";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { translateSpecialty } from "@/utils/translateEnums";

interface IAddModalProps {
  show: boolean;
  setShow: (value: boolean) => void;
  onSubmit: () => void;
}

const initialFormState = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  phoneNumber: "",
  fullName: "",
  dob: "",
  gender: "",
  address: "",
  hospitalId: 0,
  specialtyId: 0,
  licenseNumber: "",
  experienceYears: 0,
  degree: "",
};

const AddDoctorModal = (props: IAddModalProps) => {
  const { show, setShow, onSubmit } = props;

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // State cho dropdown
  const [hospitalOptions, setHospitalOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const [specialtyOptions, setSpecialtyOptions] = useState<
    { label: string; value: number }[]
  >([]);

  // 1. Lấy danh sách bệnh viện khi mở modal
  useEffect(() => {
    if (show) {
      const fetchHospitals = async () => {
        try {
          const res = await getAllHospitals({ size: 1000 }); // API lấy list bệnh viện
          // Giả sử res trả về mảng [{id, name}, ...]
          const options = res.data.map((h: Hospital) => ({
            label: h.name,
            value: h.id,
          }));
          setHospitalOptions(options);
        } catch (error) {
          console.error("Lỗi lấy danh sách bệnh viện", error);
        }
      };
      fetchHospitals();
    } else {
      setFormData(initialFormState); // Reset form khi đóng
    }
  }, [show]);

  // 2. Lấy danh sách chuyên khoa khi chọn bệnh viện
  useEffect(() => {
    const fetchSpecialties = async () => {
      if (formData.hospitalId) {
        try {
          const res = await getSpecialtiesByHospitalId(
            String(formData.hospitalId)
          );
          // Giả sử res trả về mảng [{id, specialtyName}, ...]
          const options = res.map((s: Specialty) => ({
            label: translateSpecialty(s.specialtyName),
            value: s.id,
          }));
          setSpecialtyOptions(options);
        } catch (error) {
          console.error("Lỗi lấy danh sách chuyên khoa", error);
          setSpecialtyOptions([]);
        }
      } else {
        setSpecialtyOptions([]);
      }
    };
    fetchSpecialties();
  }, [formData.hospitalId]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Xử lý các trường số
    if (["hospitalId", "specialtyId", "experienceYears"].includes(name)) {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleClose = () => {
    setShow(false);
  };

  const handleAdd = async () => {
    // Validate cơ bản
    if (
      !formData.username ||
      !formData.password ||
      !formData.fullName ||
      !formData.email ||
      !formData.hospitalId ||
      !formData.specialtyId ||
      !formData.gender
    ) {
      toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc!");
      return;
    }

    // --- THÊM LOGIC CHECK PASSWORD TẠI ĐÂY ---
    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }
    // -----------------------------------------

    setLoading(true);
    try {
      // Loại bỏ confirmPassword trước khi gửi đi (nếu API khắt khe về body)
      // const { confirmPassword, ...payload } = formData;
      // await createDoctor(payload);

      const payload = {
        ...formData,
        gender: formData.gender as Gender,
      };

      await createDoctor(payload);
      onSubmit();
      handleClose();
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      console.error("Lỗi khi thêm bác sĩ:", error);
      toast.error(
        err.response?.data?.message || "Có lỗi xảy ra khi thêm bác sĩ"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {show && (
        <form
          onSubmit={(e) => e.preventDefault()}
          className={`flex justify-between bg-[rgba(0,0,0,0.4)] fixed
          items-center w-full min-h-screen mb-6 top-0 right-0 p-4 z-50`}
        >
          <div
            className="mx-auto bg-white text-black 
            rounded-lg shadow-2xl border border-gray-400
            w-full max-w-6xl max-h-[90vh] overflow-y-auto"
          >
            <h1 className="px-6 py-4 text-2xl font-bold sticky top-0 bg-white z-10 border-b border-gray-300">
              Thêm bác sĩ mới
            </h1>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Cột 1: Thông tin tài khoản */}
              <div className="space-y-4">
                <h3 className="font-semibold text-blue-600 border-b pb-2">
                  Thông tin tài khoản
                </h3>
                <InputBar
                  label="Tên đăng nhập"
                  name="username"
                  value={formData.username}
                  placeholder="Nhập tên đăng nhập"
                  onChange={handleInputChange}
                />
                <InputBar
                  label="Mật khẩu"
                  name="password"
                  type={showPass ? "text" : "password"}
                  value={formData.password}
                  placeholder="Nhập mật khẩu"
                  onChange={handleInputChange}
                  rightIcon={showPass ? <FaEyeSlash /> : <FaEye />}
                  onRightIconClick={() => setShowPass((v) => !v)}
                />
                <InputBar
                  label="Mật khẩu nhập lại"
                  name="confirmPassword"
                  type={showConfirmPass ? "text" : "password"}
                  value={formData.confirmPassword}
                  placeholder="Nhập lại mật khẩu"
                  onChange={handleInputChange}
                  rightIcon={showConfirmPass ? <FaEyeSlash /> : <FaEye />}
                  onRightIconClick={() => setShowConfirmPass((v) => !v)}
                />
                <InputBar
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  placeholder="doctor@example.com"
                  onChange={handleInputChange}
                />
              </div>
              {/* Cột 2: Thông tin cá nhân */}
              <div className="space-y-4">
                <h3 className="font-semibold text-blue-600 border-b pb-2">
                  Thông tin cá nhân
                </h3>
                <InputBar
                  label="Họ và tên"
                  name="fullName"
                  value={formData.fullName}
                  placeholder="Nhập họ tên đầy đủ"
                  onChange={handleInputChange}
                />
                <div className="grid grid-cols-2 gap-4">
                  <InputBar
                    label="Ngày sinh"
                    name="dob"
                    type="date"
                    value={formData.dob}
                    onChange={handleInputChange}
                  />
                  <InputBar
                    type="select"
                    label="Giới tính"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    options={genderOptions}
                  />
                </div>
                <InputBar
                  label="Số điện thoại"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  placeholder="09xxxxxxxx"
                  onChange={handleInputChange}
                />
                <InputBar
                  label="Địa chỉ"
                  name="address"
                  value={formData.address}
                  placeholder="Nhập địa chỉ"
                  onChange={handleInputChange}
                />
              </div>

              {/* Cột 3: Thông tin chuyên môn */}
              <div className="space-y-4">
                <h3 className="font-semibold text-blue-600 border-b pb-2">
                  Thông tin chuyên môn
                </h3>

                <InputBar
                  type="select"
                  label="Bệnh viện làm việc"
                  name="hospitalId"
                  value={formData.hospitalId || ""}
                  placeholder="Chọn bệnh viện"
                  onChange={handleInputChange}
                  options={hospitalOptions}
                />

                <InputBar
                  type="select"
                  label="Chuyên khoa"
                  name="specialtyId"
                  value={formData.specialtyId || ""}
                  placeholder={
                    formData.hospitalId
                      ? "Chọn chuyên khoa"
                      : "Vui lòng chọn bệnh viện trước"
                  }
                  onChange={handleInputChange}
                  options={specialtyOptions}
                  disabled={!formData.hospitalId}
                />

                <InputBar
                  label="Số chứng chỉ hành nghề"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  placeholder="VD: CCHN001256/BYT"
                  onChange={handleInputChange}
                />

                <InputBar
                  label="Học vị / Bằng cấp"
                  name="degree"
                  value={formData.degree}
                  placeholder="VD: Tiến sĩ, Thạc sĩ..."
                  onChange={handleInputChange}
                />

                <InputBar
                  label="Số năm kinh nghiệm"
                  name="experienceYears"
                  value={formData.experienceYears}
                  placeholder="Nhập số năm"
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-300 bg-gray-50 rounded-b-lg">
              <Button variant="secondary" size="md" onClick={handleClose}>
                Hủy bỏ
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleAdd}
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "Thêm bác sĩ"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </>
  );
};

export default AddDoctorModal;
