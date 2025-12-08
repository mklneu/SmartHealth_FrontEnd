import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaEdit } from "react-icons/fa";
import Button from "@/components/Button";
import InputBar from "@/components/Input";
import {
  getHospitalById,
  updateHospitalById,
  HospitalRequest,
} from "@/services/HospitalServices";
import { AxiosError } from "axios";
import { ErrorResponse, SelectOption } from "@/types/frontend";
import { getAllSpecialties, Specialty } from "@/services/SpecialtyServices";
import { translateSpecialty } from "@/utils/translateEnums";

interface IProps {
  show: boolean;
  setShow: (v: boolean) => void;
  hospitalId: number;
  setHospitalId: (v: number | null) => void;
  onSuccess: () => void;
}

const UpdateHospitalModal = ({
  show,
  setShow,
  hospitalId,
  setHospitalId,
  onSuccess,
}: IProps) => {
  const [loading, setLoading] = useState(false);
  const [specialtyOptions, setSpecialtyOptions] = useState<SelectOption[]>([]);
  const [formData, setFormData] = useState<HospitalRequest>({
    name: "",
    address: "",
    contactPhone: "",
    contactEmail: "",
    description: "",
    specialtyIds: [],
  });

  // SỬA: Gộp hai useEffect lại để đảm bảo thứ tự thực thi
  useEffect(() => {
    if (show && hospitalId) {
      const fetchData = async () => {
        try {
          // Bước 1: Luôn lấy danh sách tất cả chuyên khoa trước
          const specialtiesRes = await getAllSpecialties({ size: 1000 });
          const options = specialtiesRes.data.map((spec: Specialty) => ({
            value: spec.id,
            label: translateSpecialty(spec.specialtyName),
          }));
          setSpecialtyOptions(options);

          // Bước 2: Lấy thông tin chi tiết của bệnh viện
          const hospitalData = await getHospitalById(hospitalId);

          // Bước 3: Cập nhật form với dữ liệu bệnh viện
          setFormData({
            name: hospitalData.name,
            address: hospitalData.address,
            contactPhone: hospitalData.contactPhone || "",
            contactEmail: hospitalData.contactEmail || "",
            description: hospitalData.description || "",
            specialtyIds: hospitalData.specialties
              ? hospitalData.specialties.map((s: { id: number }) => s.id)
              : [],
          });
        } catch (error) {
          console.error("Lỗi khi tải dữ liệu modal update:", error);
          toast.error("Không thể tải dữ liệu cần thiết.");
          setHospitalId(null);
          setShow(false);
        }
      };

      fetchData();
    }
  }, [show, hospitalId, setHospitalId, setShow]); // Bỏ các dependency không cần thiết

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, type, value } = e.target;

    // SỬA: Xử lý riêng cho input multi-select
    if (type === "select-multiple") {
      const selectedOptions = Array.from(
        (e.target as HTMLSelectElement).selectedOptions
      ).map((option) => option.value);

      // Chuyển các giá trị (dạng string) về lại number
      const numericValues = selectedOptions.map((val) => parseInt(val, 10));

      setFormData((prev) => ({ ...prev, [name]: numericValues }));
    } else {
      // Giữ nguyên logic cũ cho các input khác
      setFormData((prev: HospitalRequest) => ({ ...prev, [name]: value }));
    }
  };

  const handleClose = () => {
    setHospitalId(null);
    setShow(false);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.address) {
      toast.error("Tên và địa chỉ không được để trống!");
      return;
    }

    setLoading(true);
    try {
      // SỬA: Đổi updateHospital thành updateHospitalById (theo đúng import của bạn)
      await updateHospitalById(hospitalId, formData);

      onSuccess();
      handleClose();
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      toast.error(err.response?.data?.message || "Lỗi khi cập nhật");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fadeIn">
        <div className="bg-teal-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FaEdit /> Cập Nhật Bệnh Viện
          </h2>
        </div>

        <div className="p-6 space-y-6">
          <InputBar
            label="Tên bệnh viện"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
          />
          <InputBar
            label="Địa chỉ"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
          />
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputBar
              label="Số điện thoại"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleInputChange}
            />
            <InputBar
              label="Email liên hệ"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleInputChange}
            />
          </div> */}
          <div className="flex flex-col gap-1">
            <InputBar
              type="multiselect"
              name="specialtyIds"
              value={formData.specialtyIds}
              label="Chuyên khoa"
              placeholder="Chọn chuyên khoa..."
              onChange={handleInputChange}
              options={specialtyOptions}
            />
          </div>
          <div className="flex flex-col gap-1">
            <InputBar
              type="textarea"
              name="description"
              label="Mô tả"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
            />
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
          <Button variant="secondary" onClick={handleClose}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="!bg-teal-600 hover:!bg-teal-700"
          >
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UpdateHospitalModal;
