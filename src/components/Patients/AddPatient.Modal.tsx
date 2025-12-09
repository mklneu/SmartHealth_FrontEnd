import { useState } from "react";
import { toast } from "react-toastify";
import Button from "../Button";
import InputBar from "../Input";
import { bloodTypeOptions, genderOptions } from "@/utils/map";
import { AxiosError } from "axios";
import { ErrorResponse, Gender } from "@/types/frontend";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { createPatient } from "@/services/PatientServices";

interface IAddModalProps {
  show: boolean;
  setShow: (value: boolean) => void;
  onSubmit: () => void;
}

const initialFormState = {
  // --- Account Info ---
  username: "",
  email: "",
  password: "",
  confirmPassword: "",

  // --- Personal Info ---
  fullName: "",
  dob: "",
  gender: "",
  phoneNumber: "",
  address: "",
  citizenId: "", // CCCD/CMND

  // --- Medical Info ---
  insuranceId: "", // Mã BHYT
  bloodType: "", // Enum: O_POSITIVE...
  medicalHistorySummary: "", // Tiền sử bệnh

  // --- Emergency Contact ---
  emergencyContactName: "",
  emergencyContactPhone: "",
};

const AddPatientModal = (props: IAddModalProps) => {
  const { show, setShow, onSubmit } = props;

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Không cần useEffect load bệnh viện nữa vì Patient không cần chọn bệnh viện lúc tạo

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    setShow(false);
    setFormData(initialFormState); // Reset form
  };

  const handleAdd = async () => {
    // 1. Validate các trường bắt buộc
    if (
      !formData.username ||
      !formData.password ||
      !formData.fullName ||
      !formData.phoneNumber ||
      !formData.citizenId || // Bắt buộc CCCD
      !formData.gender
    ) {
      toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc!");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    setLoading(true);
    try {
      // 3. Tạo payload chuẩn
      const payload = {
        ...formData,
        gender: formData.gender as Gender,
        // Ép kiểu bloodType nếu cần thiết, hoặc để string nếu BE chấp nhận string enum
        bloodType: formData.bloodType || undefined,
      };

      // Gọi API tạo Patient
      await createPatient(payload);

      onSubmit();
      handleClose();
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      console.error("Lỗi khi thêm bệnh nhân:", error);
      toast.error(
        err.response?.data?.message || "Có lỗi xảy ra khi thêm bệnh nhân"
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
              Thêm bệnh nhân mới (Patient)
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
                  placeholder="VD: patient123"
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
                  placeholder="patient@example.com"
                  onChange={handleInputChange}
                />
              </div>

              {/* Cột 2: Thông tin cá nhân */}
              <div className="space-y-4">
                <h3 className="font-semibold text-blue-600 border-b pb-2">
                  Thông tin cá nhân
                </h3>
                <div className="space-y-4">
                  <InputBar
                    label="Họ và tên"
                    name="fullName"
                    value={formData.fullName}
                    placeholder="VD: Nguyễn Văn A"
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
                    label="Số CCCD / CMND"
                    name="citizenId"
                    value={formData.citizenId}
                    placeholder="Số định danh cá nhân"
                    onChange={handleInputChange}
                  />

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
              </div>

              {/* Cột 3: Hồ sơ y tế & Liên hệ khẩn cấp */}
              <div className="space-y-4">
                <h3 className="font-semibold text-blue-600 border-b pb-2">
                  Hồ sơ y tế & Khẩn cấp
                </h3>
                <InputBar
                  label="Tiền sử bệnh án"
                  name="medicalHistorySummary"
                  value={formData.medicalHistorySummary}
                  placeholder="VD: Dị ứng thuốc, bệnh nền..."
                  onChange={handleInputChange}
                />
                <div className="grid grid-cols-2 gap-4">
                  <InputBar
                    label="Mã BHYT"
                    name="insuranceId"
                    value={formData.insuranceId}
                    placeholder="VD: DN401..."
                    onChange={handleInputChange}
                  />
                  <InputBar
                    type="select"
                    label="Nhóm máu"
                    name="bloodType"
                    value={formData.bloodType}
                    placeholder="Chọn nhóm máu"
                    onChange={handleInputChange}
                    options={bloodTypeOptions}
                  />
                </div>

                {/* Phần liên hệ khẩn cấp */}
                <div className="">
                  <h4 className="text-sm font-bold text-red-600 mb-4">
                    Liên hệ khẩn cấp
                  </h4>
                  <div className="space-y-4">
                    <InputBar
                      label="Tên người thân"
                      name="emergencyContactName"
                      value={formData.emergencyContactName}
                      placeholder="VD: Lê Văn B (Bố)"
                      onChange={handleInputChange}
                    />
                    <InputBar
                      label="SĐT người thân"
                      name="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      placeholder="0909xxxxxx"
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
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
                {loading ? "Đang xử lý..." : "Thêm bệnh nhân"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </>
  );
};

export default AddPatientModal;
