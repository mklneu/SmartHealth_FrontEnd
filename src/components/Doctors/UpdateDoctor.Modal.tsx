import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "../Button";
import InputBar from "../Input";
import {
  DoctorProfile,
  getDoctorById,
  updateDoctor,
  updateRecurringScheduleByDoctorId,
  // updateDoctorSchedule, // Giả sử bạn có hàm này import từ service
} from "@/services/DoctorServices";
import { genderOptions } from "@/utils/map";
import {
  getSpecialtiesByHospitalId,
  Specialty,
} from "@/services/SpecialtyServices";
import { translateSpecialty } from "@/utils/translateEnums";

// --- 1. ĐỊNH NGHĨA TYPE CHO LỊCH ---
interface RecurringSchedule {
  id?: number;
  daysOfWeek: string[]; // ["MONDAY", "WEDNESDAY", ...]
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  price: number;
  startDate: string;
  endDate: string;
}

// Mở rộng interface DoctorProfile để chứa schedule (nếu chưa có trong file gốc)
interface DoctorProfileWithSchedule extends DoctorProfile {
  recurringSchedule?: RecurringSchedule;
}

interface IUpdateModalProps {
  show: boolean;
  setShow: (value: boolean) => void;
  onUpdate: () => void;
  doctorId: number;
  setDoctorId: (value: number | null) => void;
}

// Danh sách thứ trong tuần để render checkbox/button
const DAYS_OF_WEEK = [
  { label: "T2", value: "MONDAY" },
  { label: "T3", value: "TUESDAY" },
  { label: "T4", value: "WEDNESDAY" },
  { label: "T5", value: "THURSDAY" },
  { label: "T6", value: "FRIDAY" },
  { label: "T7", value: "SATURDAY" },
  { label: "CN", value: "SUNDAY" },
];

const initialDoctorState: Partial<DoctorProfileWithSchedule> = {
  fullName: "",
  email: "",
  // ... các trường cũ
  recurringSchedule: {
    daysOfWeek: [],
    startTime: "08:00",
    endTime: "17:00",
    slotDurationMinutes: 30,
    price: 0,
    startDate: "",
    endDate: "",
  },
};

const UpdateDoctorModal = (props: IUpdateModalProps) => {
  const { show, setShow, onUpdate, doctorId, setDoctorId } = props;

  // State chứa cả profile và schedule
  const [doctorData, setDoctorData] = useState<
    Partial<DoctorProfileWithSchedule>
  >({});
  const [loading, setLoading] = useState(false);
  const [dynamicSpecOptions, setDynamicSpecOptions] = useState<
    { label: string; value: number }[]
  >([]);

  // --- EFFECT: FETCH DATA ---
  useEffect(() => {
    const fetchDoctorDetails = async () => {
      setLoading(true);
      try {
        const data = await getDoctorById(doctorId);
        // Nếu API trả về data có recurringSchedule null, ta init object rỗng để tránh lỗi null access
        if (!data.recurringSchedule) {
          data.recurringSchedule = initialDoctorState.recurringSchedule;
        }
        setDoctorData(data);
      } catch (error) {
        console.error(error);
        toast.error("Không thể lấy thông tin bác sĩ");
        setDoctorId(null);
        setShow(false);
        setDoctorData(initialDoctorState);
      } finally {
        setLoading(false);
      }
    };

    if (doctorId && show) fetchDoctorDetails();
  }, [doctorId, show, setDoctorId, setShow]);

  // --- EFFECT: FETCH SPECIALTIES (Giữ nguyên) ---
  useEffect(() => {
    const fetchSpecs = async () => {
      if (doctorData.hospital?.id) {
        try {
          const res = await getSpecialtiesByHospitalId(
            String(doctorData.hospital.id)
          );
          const options = res.map((item: Specialty) => ({
            label: translateSpecialty(item.specialtyName),
            value: item.id,
          }));
          setDynamicSpecOptions(options);
        } catch (error) {
          console.error(error);
        }
      }
    };
    fetchSpecs();
  }, [doctorData.hospital?.id]);

  // --- HANDLER: INPUT FORM PROFILE (Giữ nguyên logic cũ) ---
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "experienceYears") {
      setDoctorData((prev) => ({ ...prev, [name]: Number(value) }));
    } else if (name === "specialty") {
      setDoctorData((prev) => ({
        ...prev,
        specialty: { ...prev.specialty!, id: Number(value) },
      }));
    } else {
      setDoctorData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // --- HANDLER: INPUT FORM SCHEDULE (MỚI) ---
  const handleScheduleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setDoctorData((prev) => ({
      ...prev,
      recurringSchedule: {
        ...prev.recurringSchedule!,
        // Nếu là price hoặc slotDuration thì parse number, còn lại giữ string
        [name]:
          name === "price" || name === "slotDurationMinutes"
            ? Number(value)
            : value,
      },
    }));
  };

  // --- HANDLER: CHỌN THỨ TRONG TUẦN (MỚI) ---
  const toggleDay = (dayValue: string) => {
    const currentDays = doctorData.recurringSchedule?.daysOfWeek || [];
    let newDays;
    if (currentDays.includes(dayValue)) {
      newDays = currentDays.filter((d) => d !== dayValue);
    } else {
      newDays = [...currentDays, dayValue];
    }

    setDoctorData((prev) => ({
      ...prev,
      recurringSchedule: {
        ...prev.recurringSchedule!,
        daysOfWeek: newDays,
      },
    }));
  };

  const handleClose = () => {
    setDoctorId(null);
    setShow(false);
    setDoctorData(initialDoctorState);
  };

  // --- UPDATE LOGIC: GỌI 2 API RIÊNG BIỆT ---
  const handleUpdateAll = async () => {
    if (!doctorData.fullName || !doctorData.email) {
      toast.error("Vui lòng điền thông tin cơ bản!");
      return;
    }

    setLoading(true);
    try {
      // 1. Chuẩn bị Body cho Profile
      const profileBody = {
        phoneNumber: doctorData.phoneNumber,
        fullName: doctorData.fullName,
        dob: doctorData.dob,
        gender: doctorData.gender,
        address: doctorData.address,
        licenseNumber: doctorData.licenseNumber,
        experienceYears: doctorData.experienceYears,
        degree: doctorData.degree,
        hospitalId: doctorData.hospital?.id,
        specialtyId: doctorData.specialty?.id,
      };

      // 2. Chuẩn bị Body cho Schedule (Dựa theo cấu trúc bạn cung cấp)
      const scheduleBody = {
        profileId: doctorId,
        daysOfWeek: doctorData.recurringSchedule?.daysOfWeek,
        startTime: doctorData.recurringSchedule?.startTime,
        endTime: doctorData.recurringSchedule?.endTime,
        slotDurationMinutes: doctorData.recurringSchedule?.slotDurationMinutes,
        price: doctorData.recurringSchedule?.price,
        startDate: doctorData.recurringSchedule?.startDate,
        endDate: doctorData.recurringSchedule?.endDate,
        // Nếu cần doctorId trong body thì thêm vào đây, hoặc truyền qua params tuỳ API của bạn
      };

      // 3. Gọi song song hoặc tuần tự. Ở đây mình gọi tuần tự để dễ debug
      // Update Profile
      await updateDoctor(doctorId, profileBody);

      // Update Schedule (Giả sử bạn có hàm này)
      await updateRecurringScheduleByDoctorId(scheduleBody);
      console.log("Update Schedule Body:", scheduleBody); // Log để test

      // NOTE: Bạn hãy uncomment dòng trên và thay bằng hàm API thực tế của bạn

      toast.success("Cập nhật đầy đủ thông tin thành công!");
      onUpdate();
      handleClose();
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      toast.error("Có lỗi xảy ra khi cập nhật (Chi tiết trong console)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {show && (
        <form className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">
                Cập nhật Bác sĩ{" "}
                <span className="text-blue-600">#{doctorId}</span>
              </h1>
            </div>

            {loading ? (
              <div className="p-10 text-center">Đang xử lý dữ liệu...</div>
            ) : (
              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* --- CỘT TRÁI: THÔNG TIN CÁ NHÂN --- */}
                <div className="space-y-4 border-r pr-0 lg:pr-6 border-gray-200">
                  <h3 className="text-lg font-semibold text-blue-800 uppercase mb-4">
                    Thông tin hồ sơ
                  </h3>

                  <InputBar
                    label="Họ tên"
                    name="fullName"
                    value={doctorData.fullName || ""}
                    onChange={handleInputChange}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <InputBar
                      label="Ngày sinh"
                      type="date"
                      name="dob"
                      value={doctorData.dob || ""}
                      onChange={handleInputChange}
                    />
                    <InputBar
                      type="select"
                      label="Giới tính"
                      name="gender"
                      value={doctorData.gender || ""}
                      options={genderOptions}
                      onChange={handleInputChange}
                    />
                  </div>

                  <InputBar
                    label="Địa chỉ"
                    name="address"
                    value={doctorData.address || ""}
                    onChange={handleInputChange}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <InputBar
                      label="SĐT"
                      name="phoneNumber"
                      value={doctorData.phoneNumber || ""}
                      onChange={handleInputChange}
                    />
                    <InputBar
                      label="Email"
                      disabled
                      name="email"
                      value={doctorData.email || ""}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <InputBar
                      label="Số CCHN"
                      name="licenseNumber"
                      value={doctorData.licenseNumber || ""}
                      onChange={handleInputChange}
                    />
                    <InputBar
                      label="Học vị"
                      name="degree"
                      value={doctorData.degree || ""}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <InputBar
                      type="select"
                      label="Chuyên khoa"
                      name="specialty"
                      value={doctorData.specialty?.id || ""}
                      options={dynamicSpecOptions}
                      onChange={handleInputChange}
                    />
                    <InputBar
                      label="Kinh nghiệm (năm)"
                      type="number"
                      name="experienceYears"
                      value={doctorData.experienceYears?.toString() || "0"}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* --- CỘT PHẢI: LỊCH LÀM VIỆC (MỚI) --- */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-green-700 uppercase mb-2 flex justify-between">
                    Cấu hình lịch khám
                  </h3>

                  {/* Chọn Thứ */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      Ngày làm việc trong tuần
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS_OF_WEEK.map((day) => {
                        const isSelected =
                          doctorData.recurringSchedule?.daysOfWeek?.includes(
                            day.value
                          );
                        return (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => toggleDay(day.value)}
                            className={`px-3 py-1 rounded-full text-sm font-medium border duration-300 cursor-pointer
                              ${
                                isSelected
                                  ? "bg-green-600 text-white border-green-600 shadow-md"
                                  : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
                              }`}
                          >
                            {day.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Thời gian & Giá */}
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <InputBar
                      label="Giờ bắt đầu"
                      type="time"
                      name="startTime"
                      value={doctorData.recurringSchedule?.startTime || ""}
                      onChange={handleScheduleChange}
                    />
                    <InputBar
                      label="Giờ kết thúc"
                      type="time"
                      name="endTime"
                      value={doctorData.recurringSchedule?.endTime || ""}
                      onChange={handleScheduleChange}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <InputBar
                      label="Thời lượng khám (phút)"
                      type="number"
                      name="slotDurationMinutes"
                      value={
                        doctorData.recurringSchedule?.slotDurationMinutes?.toString() ||
                        "15"
                      }
                      onChange={handleScheduleChange}
                    />
                    <InputBar
                      label="Giá khám (VNĐ)"
                      type="number"
                      name="price"
                      value={
                        doctorData.recurringSchedule?.price?.toString() || "0"
                      }
                      onChange={handleScheduleChange}
                    />
                  </div>

                  {/* Ngày hiệu lực */}
                  <div className="grid grid-cols-2 gap-4 border-t pt-4 mt-2">
                    <InputBar
                      label="Ngày bắt đầu áp dụng"
                      type="date"
                      name="startDate"
                      value={doctorData.recurringSchedule?.startDate || ""}
                      onChange={handleScheduleChange}
                    />
                    <InputBar
                      label="Ngày kết thúc"
                      type="date"
                      name="endDate"
                      value={doctorData.recurringSchedule?.endDate || ""}
                      onChange={handleScheduleChange}
                    />
                  </div>

                  <div className="p-3 bg-blue-50 text-blue-800 text-sm rounded-xl border border-blue-200 mt-4">
                    ℹ️ <strong>Lưu ý:</strong> Việc cập nhật lịch sẽ tạo ra các
                    slot khám mới trong khoảng thời gian đã chọn.
                  </div>
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl sticky bottom-0">
              <Button variant="secondary" onClick={handleClose}>
                Đóng
              </Button>
              <Button
                variant="primary"
                onClick={handleUpdateAll}
                disabled={loading}
              >
                {loading ? "Đang lưu..." : "Lưu tất cả thay đổi"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </>
  );
};

export default UpdateDoctorModal;
