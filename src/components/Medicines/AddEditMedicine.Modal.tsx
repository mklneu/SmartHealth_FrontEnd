import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "../Button";
import InputBar from "../Input";
import {
  createMedicine,
  updateMedicine,
  Medicine,
  PackagingOption,
} from "@/services/MedicineServices";
import { FaTrash, FaPlus } from "react-icons/fa";
import { AxiosError } from "axios";
import { ErrorResponse } from "@/types/frontend";

interface IProps {
  show: boolean;
  setShow: (v: boolean) => void;
  onSuccess: () => void;
  dataEdit: Medicine | null; // Nếu null là thêm mới, có dữ liệu là sửa
}

const initialForm = {
  name: "",
  activeIngredient: "",
  baseUnit: "",
  basePrice: 0,
  expiryDate: "",
  description: "",
};

const AddEditMedicineModal = ({
  show,
  setShow,
  onSuccess,
  dataEdit,
}: IProps) => {
  const [formData, setFormData] = useState(initialForm);
  const [packagingList, setPackagingList] = useState<PackagingOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && dataEdit) {
      // Fill dữ liệu khi sửa
      setFormData({
        name: dataEdit.name,
        activeIngredient: dataEdit.activeIngredient,
        baseUnit: dataEdit.baseUnit,
        basePrice: dataEdit.basePrice,
        expiryDate: dataEdit.expiryDate
          ? dataEdit.expiryDate.split("T")[0]
          : "",
        description: dataEdit.description || "",
      });

      // Parse packagingOptions
      try {
        let options = [];
        if (typeof dataEdit.packagingOptions === "string") {
          options = JSON.parse(dataEdit.packagingOptions);
        } else {
          options = dataEdit.packagingOptions || [];
        }
        setPackagingList(options);
      } catch (error) {
        console.error("Error parsing packaging options:", error);
        setPackagingList([]);
      }
    } else {
      // Reset khi thêm mới
      setFormData(initialForm);
      setPackagingList([]);
    }
  }, [show, dataEdit]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- Logic xử lý Packaging Options ---
  const addOption = () => {
    setPackagingList([...packagingList, { unit: "", quantity: 1, price: 0 }]);
  };

  const removeOption = (index: number) => {
    const newList = [...packagingList];
    newList.splice(index, 1);
    setPackagingList(newList);
  };

  const handleOptionChange = (
    index: number,
    field: keyof PackagingOption,
    value: string | number
  ) => {
    const newList = [...packagingList];
    newList[index] = { ...newList[index], [field]: value };
    setPackagingList(newList);
  };
  // -------------------------------------

  const handleSubmit = async () => {
    if (!formData.name || !formData.baseUnit) {
      toast.error("Tên thuốc và đơn vị cơ bản là bắt buộc!");
      return;
    }

    setLoading(true);
    try {
      // Chuẩn bị body gửi đi
      const payload = {
        ...formData,
        basePrice: Number(formData.basePrice),
        // Chuyển mảng options thành chuỗi JSON theo yêu cầu body
        packagingOptions: JSON.stringify(packagingList),
        // Thêm giờ mặc định cho ngày hết hạn nếu cần
        expiryDate: formData.expiryDate
          ? `${formData.expiryDate}T00:00:00Z`
          : "",
      };

      if (dataEdit) {
        await updateMedicine(dataEdit.id, payload);
        toast.success("Cập nhật thuốc thành công!");
      } else {
        await createMedicine(payload);
        toast.success("Thêm thuốc mới thành công!");
      }
      onSuccess();
      setShow(false);
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      toast.error(err.response?.data?.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-hidden">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="bg-blue-600 px-6 py-4 sticky top-0 z-50">
          <h2 className="text-xl font-bold text-white">
            {dataEdit ? "Cập nhật thông tin thuốc" : "Thêm thuốc mới"}
          </h2>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cột trái: Thông tin cơ bản */}
          <div className="space-y-4">
            <h3 className="flex items-center font-semibold text-blue-600 border-b pb-2 h-[44.8px] ">
              Thông tin chung
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <InputBar
                label="Tên thuốc"
                placeholder="Điền tên thuốc"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
              <InputBar
                label="Hoạt chất"
                placeholder="VD: Paracetamol"
                name="activeIngredient"
                value={formData.activeIngredient}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputBar
                label="Đơn vị cơ bản"
                name="baseUnit"
                value={formData.baseUnit}
                placeholder="VD: viên"
                onChange={handleInputChange}
              />
              <InputBar
                label="Giá cơ bản"
                name="basePrice"
                value={formData.basePrice}
                onChange={handleInputChange}
              />
            </div>
            <InputBar
              label="Hạn sử dụng"
              name="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={handleInputChange}
            />
            <div className="flex flex-col gap-1">
              <InputBar
                type="textarea"
                label="Mô tả"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
          </div>

          {/* Cột phải: Quy cách đóng gói */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2 text-blue-600">
              <h3 className="font-semibold ">Quy cách đóng gói khác</h3>
              <Button onClick={addOption} icon={<FaPlus />} variant="green">
                Thêm quy cách
              </Button>
            </div>

            <div className="p-3 rounded-lg space-y-3 max-h-[400px] overflow-y-auto">
              {packagingList.length === 0 && (
                <p className="text-gray-400 text-sm text-center italic">
                  Chưa có quy cách đóng gói nào (VD: Hộp, Vỉ...)
                </p>
              )}

              {packagingList.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-2 items-center bg-white py-4 px-2 rounded border"
                >
                  <div className="w-1/3 h-10">
                    <InputBar
                      label="Đơn vị"
                      placeholder="VD: Hộp"
                      name="unit"
                      value={item.unit}
                      onChange={(e) =>
                        handleOptionChange(index, "unit", e.target.value)
                      }
                    />
                  </div>
                  <div className="w-1/3 h-10">
                    <InputBar
                      label="SL quy đổi"
                      name="quantity"
                      value={item.quantity}
                      onChange={(e) =>
                        handleOptionChange(
                          index,
                          "quantity",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div className="w-1/3 h-10">
                    <InputBar
                      label="Giá bán"
                      name="price"
                      value={item.price}
                      onChange={(e) =>
                        handleOptionChange(
                          index,
                          "price",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>
                  <Button onClick={() => removeOption(index)} variant="danger">
                    <FaTrash size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gray-100 px-6 py-4 flex justify-end gap-3 rounded-b-xl">
          <Button variant="secondary" onClick={() => setShow(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Đang lưu..." : "Lưu thông tin"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddEditMedicineModal;
