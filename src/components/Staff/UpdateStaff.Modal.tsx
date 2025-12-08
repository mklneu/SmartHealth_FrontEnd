import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "../Button";
import InputBar from "../Input";
import { departmentOptions, genderOptions } from "@/utils/map";
import { getAllHospitals, Hospital } from "@/services/HospitalServices";
import {
  getStaffById,
  StaffProfile,
  updateStaffById,
} from "@/services/StaffServices";
interface IUpdateModalProps {
  show: boolean;
  setShow: (value: boolean) => void;
  onUpdate: () => void;
  staffId: number; // Đổi từ doctorId sang staffId
  setStaffId: (value: number | null) => void;
}

type FormState = Partial<StaffProfile> & { hospitalId?: number };

const initialStaffState: FormState = {
  fullName: "",
  email: "",
  username: "", // Thường không update, chỉ để hiển thị
  dob: "",
  phoneNumber: "",
  address: "",
  gender: "MALE",
  employeeId: "",
  department: "",
  hospital: { id: 0, name: "" },
  hospitalId: 0, // Lưu ý: Staff thường lưu hospitalId trực tiếp hoặc qua object hospital
};

const UpdateStaffModal = (props: IUpdateModalProps) => {
  const { show, setShow, onUpdate, staffId, setStaffId } = props;

  const [staffData, setStaffData] = useState(initialStaffState);
  const [loading, setLoading] = useState(false);

  // State lưu danh sách bệnh viện để chọn
  const [hospitalOptions, setHospitalOptions] = useState<
    { label: string; value: number }[]
  >([]);

  // Effect 1: Lấy danh sách bệnh viện (Để populate dropdown)
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
    }
  }, [show]);

  // Effect 2: Lấy thông tin nhân viên (Staff)
  useEffect(() => {
    const fetchStaffDetails = async () => {
      setLoading(true);
      try {
        const data = await getStaffById(staffId);

        // Xử lý dữ liệu trả về để khớp với state form
        // Nếu API trả về hospital dạng object {id, name}, ta cần lấy id ra
        const formatedData = {
          ...data,
          // Kiểm tra xem BE trả về hospitalId hay hospital object
          hospitalId: data.hospital?.id || 0,
        };

        setStaffData(formatedData);
      } catch (error) {
        console.error("Lỗi:", error);
        toast.error("Không thể lấy thông tin nhân viên");
        setStaffId(null);
        setShow(false);
        setStaffData(initialStaffState);
      } finally {
        setLoading(false);
      }
    };

    if (staffId && show) {
      fetchStaffDetails();
    }
  }, [staffId, show, setStaffId, setShow]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Xử lý trường số (hospitalId)
    if (name === "hospitalId") {
      setStaffData((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setStaffData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleClose = () => {
    setStaffId(null);
    setShow(false);
    setStaffData(initialStaffState);
  };

  // --- HÀM UPDATE VỚI BODY ĐÚNG YÊU CẦU ---
  const handleUpdate = async () => {
    if (!staffData.fullName || !staffData.email) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    // Tạo payload chuẩn JSON yêu cầu
    const updateBody = {
      phoneNumber: staffData.phoneNumber,
      fullName: staffData.fullName,
      dob: staffData.dob,
      gender: staffData.gender,
      address: staffData.address,
      employeeId: staffData.employeeId,
      department: staffData.department,
      hospitalId: staffData.hospitalId, // Update trường này
    };

    setLoading(true);
    try {
      await updateStaffById(staffId, updateBody);
      toast.success("Cập nhật nhân viên thành công!");
      onUpdate();
      handleClose();
    } catch (error) {
      console.error("Lỗi khi cập nhật nhân viên:", error);
      toast.error("Có lỗi xảy ra khi cập nhật");
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
            max-w-5xl max-h-[90vh] overflow-y-auto"
          >
            <h1 className="px-5 py-4 text-2xl font-semibold sticky top-0 bg-white z-10 border-b">
              Cập nhật nhân viên{" "}
              <span className="text-gray-600 font-bold text-sm">
                ID: {staffId}
              </span>
            </h1>

            {loading && <p className="text-center py-4">Đang tải dữ liệu...</p>}

            {!loading && (
              <>
                <div className="w-11/12 mx-auto mt-8 space-y-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Cột 1: Thông tin cá nhân */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-blue-600 border-b pb-2">
                      Thông tin cá nhân
                    </h3>
                    <div className="mb-6">
                      <InputBar
                        label="Họ và tên"
                        name="fullName"
                        value={staffData.fullName || ""}
                        placeholder="Nhập họ tên nhân viên"
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <InputBar
                        label="Ngày sinh"
                        name="dob"
                        type="date"
                        value={staffData.dob || ""}
                        onChange={handleInputChange}
                      />
                      <InputBar
                        type="select"
                        label="Giới tính"
                        name="gender"
                        value={staffData.gender || ""}
                        onChange={handleInputChange}
                        options={genderOptions}
                      />
                    </div>

                    <div className="mb-6">
                      <InputBar
                        label="Địa chỉ"
                        name="address"
                        value={staffData.address || ""}
                        placeholder="Nhập địa chỉ"
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <InputBar
                        label="Số điện thoại"
                        name="phoneNumber"
                        value={staffData.phoneNumber || ""}
                        placeholder="Nhập số điện thoại"
                        onChange={handleInputChange}
                      />
                      <InputBar
                        label="Email"
                        disabled
                        type="email"
                        name="email"
                        value={staffData.email || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  {/* Cột 2: Thông tin Staff (Khác Doctor) */}
                  <div className="space-y-4 ">
                    <h3 className="font-semibold text-blue-600 border-b pb-2">
                      Thông tin công việc
                    </h3>

                    <div className="mb-6">
                      <InputBar
                        type="select"
                        label="Bệnh viện trực thuộc"
                        name="hospitalId"
                        value={staffData.hospitalId || ""}
                        onChange={handleInputChange}
                        options={hospitalOptions}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <InputBar
                        label="Mã nhân viên"
                        name="employeeId"
                        disabled
                        value={staffData.employeeId || ""}
                        placeholder="VD: NV1001"
                        onChange={handleInputChange}
                      />
                      <InputBar
                        type="select"
                        label="Phòng ban"
                        name="department"
                        value={staffData.department || ""}
                        onChange={handleInputChange}
                        options={departmentOptions}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mx-auto gap-2 mt-6 mb-6 w-11/12 pt-4 border-t">
                  <Button variant="secondary" onClick={handleClose}>
                    Hủy
                  </Button>
                  <Button variant="primary" onClick={handleUpdate}>
                    {loading ? "Đang cập nhật..." : "Cập nhật"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </form>
      )}
    </>
  );
};

export default UpdateStaffModal;
