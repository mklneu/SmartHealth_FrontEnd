import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaHospital } from "react-icons/fa";
import Button from "@/components/Button";
import InputBar from "@/components/Input";
import { postHospital, HospitalRequest } from "@/services/HospitalServices";
// Giả sử bạn có service này để lấy danh sách chuyên khoa
import { getAllSpecialties, Specialty } from "@/services/SpecialtyServices";
import { AxiosError } from "axios";
import { ErrorResponse, SelectOption } from "@/types/frontend";
import { translateSpecialty } from "@/utils/translateEnums";

interface IProps {
  show: boolean;
  setShow: (v: boolean) => void;
  onSuccess: () => void;
}

const AddHospitalModal = ({ show, setShow, onSuccess }: IProps) => {
  const [loading, setLoading] = useState(false);
  const [specialtyOptions, setSpecialtyOptions] = useState<SelectOption[]>([]);
  const [formData, setFormData] = useState<HospitalRequest>({
    name: "",
    address: "",
    description: "",
    logo: "",
    specialtyIds: [],
  });

  // Fetch danh sách chuyên khoa khi modal mở
  useEffect(() => {
    if (show) {
      const fetchSpecialties = async () => {
        try {
          // Giả sử getAllSpecialties trả về mảng các object { id, name }
          const res = await getAllSpecialties({ size: 1000 });
          const options = res.data.map((spec: Specialty) => ({
            value: parseInt(spec.id, 10),
            label: translateSpecialty(spec.specialtyName),
          }));
          setSpecialtyOptions(options);
        } catch (error) {
          console.error(error);
          toast.error("Không thể tải danh sách chuyên khoa");
        }
      };
      fetchSpecialties();
    }
  }, [show]);

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
    setFormData({
      name: "",
      address: "",
      description: "",
      logo: "",
      specialtyIds: [],
    });
    setShow(false);
  };

  const handleSubmit = async () => {
    // Validate cơ bản
    if (!formData.name || !formData.address) {
      toast.error("Tên bệnh viện và địa chỉ là bắt buộc!");
      return;
    }

    setLoading(true);
    try {
      await postHospital(formData);
      toast.success("Thêm bệnh viện thành công!");
      onSuccess();
      handleClose();
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      toast.error(
        err.response?.data?.message || "Có lỗi xảy ra khi thêm bệnh viện"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="bg-teal-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FaHospital /> Thêm Bệnh Viện Mới
          </h2>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <InputBar
            label="Tên bệnh viện"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Nhập tên bệnh viện"
          />
          <InputBar
            label="Địa chỉ"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Nhập địa chỉ chi tiết"
          />
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
              name="description"
              type="textarea"
              label="Mô tả thêm"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Thông tin giới thiệu..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
          <Button variant="secondary" onClick={handleClose}>
            Hủy bỏ
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="!bg-teal-600 hover:!bg-teal-700"
          >
            {loading ? "Đang xử lý..." : "Thêm mới"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddHospitalModal;
