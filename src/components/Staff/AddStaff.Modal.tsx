import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "../Button";
import InputBar from "../Input";
import { departmentOptions, genderOptions } from "@/utils/map";
import { AxiosError } from "axios";
import { ErrorResponse, Gender } from "@/types/frontend";
import { getAllHospitals, Hospital } from "@/services/HospitalServices";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { createStaff } from "@/services/StaffServices";

interface IAddModalProps {
  show: boolean;
  setShow: (value: boolean) => void;
  onSubmit: () => void;
}

const initialFormState = {
  // --- Common Fields ---
  username: "",
  email: "",
  password: "",
  confirmPassword: "", // UI only
  phoneNumber: "",
  fullName: "",
  dob: "",
  gender: "",
  address: "",
  hospitalId: 0,
  
  // --- Staff Specific Fields ---
  employeeId: "", // Mã nhân viên (VD: NV1002)
  department: "", // Phòng ban (VD: IT_SUPPORT)
};

const AddStaffModal = (props: IAddModalProps) => {
  const { show, setShow, onSubmit } = props;

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [hospitalOptions, setHospitalOptions] = useState<
    { label: string; value: number }[]
  >([]);

  // 1. Lấy danh sách bệnh viện
  useEffect(() => {
    if (show) {
      const fetchHospitals = async () => {
        try {
          const res = await getAllHospitals({size: 1000});
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
      setFormData(initialFormState);
    }
  }, [show]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Xử lý các trường số
    if (name === "hospitalId") {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleClose = () => {
    setShow(false);
  };

  const handleAdd = async () => {
    // 1. Validate
    if (
      !formData.username ||
      !formData.password ||
      !formData.fullName ||
      !formData.email ||
      !formData.hospitalId ||
      !formData.gender ||
      !formData.employeeId || // Check Staff field
      !formData.department    // Check Staff field
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
        gender: formData.gender as Gender, // Ép kiểu chuẩn TS
        // Đảm bảo department gửi lên đúng format (Enum string)
      };

      // Gọi API tạo Staff
      await createStaff(payload);
      
      onSubmit();
      handleClose();
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      console.error("Lỗi khi thêm nhân viên:", error);
      toast.error(
        err.response?.data?.message || "Có lỗi xảy ra khi thêm nhân viên"
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
              Thêm nhân viên mới (Staff)
            </h1>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Cột 1: Thông tin tài khoản (GIỮ NGUYÊN) */}
              <div className="space-y-4">
                <h3 className="font-semibold text-blue-600 border-b pb-2">
                  Thông tin tài khoản
                </h3>
                <InputBar
                  label="Tên đăng nhập"
                  name="username"
                  value={formData.username}
                  placeholder="VD: staff_khanh"
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
                  placeholder="staff@smarthealth.com"
                  onChange={handleInputChange}
                />
              </div>

              {/* Cột 2: Thông tin cá nhân (GIỮ NGUYÊN) */}
              <div className="space-y-4">
                <h3 className="font-semibold text-blue-600 border-b pb-2">
                  Thông tin cá nhân
                </h3>
                <div>
                  <InputBar
                    label="Họ và tên"
                    name="fullName"
                    value={formData.fullName}
                    placeholder="VD: Lê Minh Khánh"
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
              </div>

              {/* Cột 3: Thông tin công việc (THAY ĐỔI CHO STAFF) */}
              <div className="space-y-4">
                <h3 className="font-semibold text-blue-600 border-b pb-2">
                  Thông tin công việc
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
                  label="Mã nhân viên"
                  name="employeeId"
                  value={formData.employeeId}
                  placeholder="VD: NV1002"
                  onChange={handleInputChange}
                />

                <InputBar
                  type="select"
                  label="Phòng ban"
                  name="department"
                  value={formData.department}
                  placeholder="Chọn phòng ban"
                  onChange={handleInputChange}
                  options={departmentOptions}
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
                {loading ? "Đang xử lý..." : "Thêm nhân viên"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </>
  );
};

export default AddStaffModal;