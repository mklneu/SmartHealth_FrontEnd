"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { IoIosArrowBack } from "react-icons/io";
import { FaFilePrescription, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import Button from "@/components/Button";
import {
  getPrescriptionById,
  updatePrescription,
  Prescription,
  PrescriptionBody,
  PrescriptionItemResponse,
} from "@/services/PrescriptionServices";
import { AxiosError } from "axios";
import { formatAppointmentDate } from "@/services/OtherServices";
import { getAllMedicines, Medicine } from "@/services/MedicineServices";
import { useDebounce } from "@/hooks/useDebounce";
// 1. Import service và type cho Test Result
import { translateTestType } from "@/utils/translateEnums";
import {
  getTestResultsByPatientId,
  TestResult,
} from "@/services/TestResultServices";
import DoctorOnly from "@/components/DoctorOnly";
import { useAuth } from "@/contexts/AuthContext";
import { ErrorResponse } from "@/types/frontend";

// Cập nhật interface để `quantity` có thể là chuỗi rỗng
interface EditablePrescriptionItem
  extends Omit<PrescriptionItemResponse, "quantity"> {
  quantity: number | "";
}

interface EditablePrescription extends Omit<Prescription, "prescriptionItems"> {
  prescriptionItems: EditablePrescriptionItem[];
}

const PrescriptionDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const prescriptionId = params.prescriptionId as string;

  const { userRole } = useAuth();

  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState<EditablePrescription | null>(
    null
  );
  const [isUpdating, setIsUpdating] = useState(false);

  // State cho tìm kiếm thuốc
  const [medicineSearchResults, setMedicineSearchResults] = useState<
    Medicine[]
  >([]);
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const debouncedSearchTerm = useDebounce(
    activeIndex !== null ? searchTerms[activeIndex] : "",
    500
  );
  const searchContainerRef = useRef<HTMLTableSectionElement>(null);

  // 2. Thêm state để quản lý danh sách Test Result
  // Bỏ state này đi vì nó không cần thiết và gây lỗi
  // const [existingTestResults, setExistingTestResults] = useState<
  //   TestResultItem[]
  // >([]);
  const [availableTestResults, setAvailableTestResults] = useState<
    TestResult[]
  >([]);

  useEffect(() => {
    if (!prescriptionId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getPrescriptionById(Number(prescriptionId));
        setPrescription(data);
        const editable = JSON.parse(JSON.stringify(data));
        // Đảm bảo testResultIds là một mảng
        if (!editable.testResultIds) {
          editable.testResultIds = [];
        }
        setEditableData(editable);

        if (data) {
          setSearchTerms(
            data.prescriptionItems.map((item) => item.medicine.name)
          );
          // Lấy danh sách KQXN của bệnh nhân
          // Không cần gọi API lần 2 và không cần setExistingTestResults nữa
          // const resEx = await getPrescriptionById(Number(prescriptionId));
          // setExistingTestResults(resEx.testResults || []);
          const resAv = await getTestResultsByPatientId(data.patient.id);
          setAvailableTestResults(resAv || []);
          console.log(">>>>>>>>>>>>>>>>>Available Test Results:", resAv);
        }
      } catch (error) {
        const err = error as AxiosError<ErrorResponse>;
        console.error("Error fetching data:", err.message);
        toast.error("Không thể tải chi tiết đơn thuốc.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [prescriptionId]);

  // useEffect để fetch thuốc khi tìm kiếm
  useEffect(() => {
    if (debouncedSearchTerm) {
      const fetchMedicines = async () => {
        try {
          const results = await getAllMedicines({
            search: debouncedSearchTerm,
          });
          setMedicineSearchResults(results?.data || []);
        } catch (error) {
          console.error("Failed to fetch medicines:", error);
        }
      };
      fetchMedicines();
    } else {
      setMedicineSearchResults([]);
    }
  }, [debouncedSearchTerm]);

  // useEffect cho click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setActiveIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchChange = (index: number, value: string) => {
    const newSearchTerms = [...searchTerms];
    newSearchTerms[index] = value;
    setSearchTerms(newSearchTerms);
    setActiveIndex(index);

    if (editableData) {
      const newItems = [...editableData.prescriptionItems];
      newItems[index].medicine.id = 0;
      setEditableData({ ...editableData, prescriptionItems: newItems });
    }
  };

  const handleSelectMedicine = (index: number, medicine: Medicine) => {
    if (!editableData) return;
    const newItems = [...editableData.prescriptionItems];
    newItems[index].medicine.id = medicine.id;
    newItems[index].medicine.name = medicine.name;
    setEditableData({ ...editableData, prescriptionItems: newItems });

    const newSearchTerms = [...searchTerms];
    newSearchTerms[index] = medicine.name;
    setSearchTerms(newSearchTerms);

    setActiveIndex(null);
    setMedicineSearchResults([]);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!editableData) return;
    const { name, value } = e.target;
    setEditableData({ ...editableData, [name]: value });
  };

  const handleItemChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!editableData) return;
    const { name, value } = e.target;

    const updatedItems = [...editableData.prescriptionItems];
    const itemToUpdate = { ...updatedItems[index] };

    if (name === "quantity") {
      itemToUpdate.quantity = value === "" ? "" : parseInt(value, 10) || 0;
    } else if (
      name === "unit" ||
      name === "usageInstructions" ||
      name === "note"
    ) {
      itemToUpdate[name] = value;
    }

    updatedItems[index] = itemToUpdate;
    setEditableData({ ...editableData, prescriptionItems: updatedItems });
  };

  // 3. Sửa lại hàm xử lý chọn/bỏ chọn Test Result
  const handleTestResultToggle = (resultId: number) => {
    if (!editableData) return;

    // Lấy ra mảng các ID từ mảng đối tượng testResults
    const currentIds = editableData.testResults.map((result) => result.id);

    const newIds = currentIds.includes(resultId)
      ? currentIds.filter((id) => id !== resultId)
      : [...currentIds, resultId];

    // Cập nhật lại mảng testResults dựa trên mảng ID mới
    const newTestResults = availableTestResults.filter((result) =>
      newIds.includes(result.id)
    );

    setEditableData({ ...editableData, testResults: newTestResults });
  };

  const handleUpdate = async () => {
    if (!editableData) return;
    const hasInvalidMedicine = editableData.prescriptionItems.some(
      (item) => !item.medicine.id || item.medicine.id === 0
    );
    if (hasInvalidMedicine) {
      toast.error(
        "Vui lòng chọn thuốc hợp lệ từ danh sách cho tất cả các mục."
      );
      return;
    }

    setIsUpdating(true);

    const payload: Partial<PrescriptionBody> = {
      prescriptionDate: new Date(editableData.prescriptionDate).toISOString(),
      diagnosis: editableData.diagnosis,
      advice: editableData.advice,
      // Lấy ID từ mảng testResults để gửi đi
      testResultIds: editableData.testResults.map((result) => result.id) || [],
      prescriptionItems: editableData.prescriptionItems.map((item) => ({
        medicine: { id: item.medicine.id },
        unit: item.unit,
        quantity: item.quantity === "" ? 0 : item.quantity,
        usageInstructions: item.usageInstructions,
        note: item.note,
      })),
    };

    try {
      const updatedResult = await updatePrescription(
        Number(prescriptionId),
        payload
      );
      setPrescription(updatedResult);
      const editable = JSON.parse(JSON.stringify(updatedResult));
      if (!editable.testResultIds) {
        editable.testResultIds = [];
      }
      setEditableData(editable);
      setSearchTerms(
        updatedResult.prescriptionItems.map((item) => item.medicine.name)
      );
      setIsEditing(false);
      toast.success("Cập nhật đơn thuốc thành công!");
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      console.error("Error updating prescription:", err.message);
      toast.error("Cập nhật thất bại, vui lòng thử lại.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    const originalData = JSON.parse(JSON.stringify(prescription));
    if (originalData) {
      if (!originalData.testResultIds) {
        originalData.testResultIds = [];
      }
      setEditableData(originalData);
      setSearchTerms(
        originalData.prescriptionItems.map(
          (item: PrescriptionItemResponse) => item.medicine.name
        )
      );
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="p-8 text-center min-h-screen">Đang tải đơn thuốc...</div>
    );
  }

  if (!prescription || !editableData) {
    return (
      <div className="p-8 text-center min-h-screen">
        Không tìm thấy đơn thuốc.
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 cursor-pointer
           text-gray-600 hover:text-gray-900
            font-semibold mb-6 transition-colors duration-200 focus:outline-none"
        >
          <IoIosArrowBack size={20} />
          Quay lại trang lịch hẹn
        </button>

        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg space-y-8">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold text-green-600 flex items-center gap-3">
              <FaFilePrescription />
              Chi tiết đơn thuốc
            </h1>
            <DoctorOnly userRole={userRole}>
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  icon={<FaEdit />}
                  variant="green"
                >
                  Cập nhật
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpdate}
                    icon={<FaSave />}
                    isLoading={isUpdating}
                    variant="green"
                  >
                    Lưu
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleCancel}
                    icon={<FaTimes />}
                  >
                    Hủy
                  </Button>
                </div>
              )}
            </DoctorOnly>
          </div>

          <div className="border-t pt-6 space-y-4">
            {/* ... Ngày kê đơn, Chẩn đoán, Lời dặn ... */}
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-2">
                Ngày kê đơn
              </h2>
              <p className="text-slate-700">
                {formatAppointmentDate(prescription.prescriptionDate)}
              </p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-2">
                Chẩn đoán
              </h2>
              {isEditing ? (
                <textarea
                  name="diagnosis"
                  value={editableData.diagnosis}
                  onChange={handleInputChange}
                  className="w-full p-2 border outline-none
                  border-gray-300 rounded-md 
                  text-slate-700 min-h-20"
                  rows={3}
                />
              ) : (
                <p className="text-slate-700 whitespace-pre-wrap">
                  {prescription.diagnosis}
                </p>
              )}
            </div>
            {editableData.advice && (
              <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-2">
                  Lời dặn của bác sĩ
                </h2>
                {isEditing ? (
                  <textarea
                    name="advice"
                    value={editableData.advice}
                    onChange={handleInputChange}
                    className="w-full p-2 border outline-none
                    border-gray-300 rounded-md 
                    text-slate-700 min-h-24"
                    rows={4}
                  />
                ) : (
                  <p className="text-slate-700 whitespace-pre-wrap">
                    {prescription.advice}
                  </p>
                )}
              </div>
            )}

            {/* 5. Thêm phần hiển thị/chỉnh sửa Test Result */}
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-2">
                Kết quả xét nghiệm đính kèm
              </h2>
              <div className="bg-white border border-gray-200 rounded-lg max-h-40 overflow-y-auto p-2 space-y-1">
                {/* Sửa lại logic hiển thị */}
                {!isEditing ? (
                  // 1. Luôn dùng `prescription.testResults` để hiển thị khi ở chế độ xem
                  prescription.testResults &&
                  prescription.testResults.length > 0 ? (
                    prescription.testResults.map((result, index) => (
                      <div
                        key={result.id}
                        className={`flex items-center gap-2 p-2 cursor-default
                          ${
                            index > 0
                              ? "mt-1 border-t border-gray-200 pt-3"
                              : ""
                          }
                        `}
                      >
                        {/* <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          checked={true} // Luôn checked khi ở chế độ xem
                          disabled={true}
                        /> */}
                        <span className={`text-sm text-gray-800 `}>
                          {translateTestType(result.testType)} (Ngày{" "}
                          {new Date(result.testTime).toLocaleDateString(
                            "vi-VN"
                          )}
                          )
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="p-2 text-sm text-gray-500">
                      Không có kết quả xét nghiệm nào đính kèm.
                    </p>
                  )
                ) : // 2. Dùng `availableTestResults` để hiển thị tất cả lựa chọn khi chỉnh sửa
                availableTestResults.length > 0 ? (
                  availableTestResults.map((result) => (
                    <label
                      key={result.id}
                      className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        checked={editableData.testResults
                          .map((r) => r.id)
                          .includes(result.id)}
                        onChange={() => handleTestResultToggle(result.id)}
                      />
                      <span className="text-sm text-gray-800">
                        {translateTestType(result.testType)} (Ngày{" "}
                        {new Date(result.testTime).toLocaleDateString("vi-VN")})
                      </span>
                    </label>
                  ))
                ) : (
                  <p className="p-2 text-sm text-gray-500">
                    Bệnh nhân chưa có kết quả xét nghiệm nào.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-800">
              Danh sách thuốc
            </h2>
            <div className=" border rounded-lg relative">
              <table className="min-w-full text-sm text-left table-auto">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="p-3 font-semibold text-slate-700 w-[30%] border-r border-gray-200">
                      Tên thuốc
                    </th>
                    <th className="p-3 font-semibold text-slate-700 w-[15%] border-r border-gray-200">
                      Số lượng
                    </th>
                    <th className="p-3 font-semibold text-slate-700 w-[15%] border-r border-gray-200">
                      Đơn vị
                    </th>
                    <th className="p-3 font-semibold text-slate-700 w-[40%]">
                      Cách dùng & Ghi chú
                    </th>
                  </tr>
                </thead>
                <tbody ref={searchContainerRef}>
                  {editableData.prescriptionItems.map((item, index) => (
                    <tr
                      key={item.id || index}
                      className="border-b last:border-none"
                    >
                      {isEditing ? (
                        <>
                          <td className="p-1 border-r border-gray-200 align-top">
                            <input
                              type="text"
                              value={searchTerms[index] || ""}
                              onChange={(e) =>
                                handleSearchChange(index, e.target.value)
                              }
                              onFocus={() => setActiveIndex(index)}
                              placeholder="Gõ để tìm thuốc..."
                              className="w-full p-2 text-slate-800 font-medium outline-none"
                            />
                            {activeIndex === index && (
                              <div
                                className="absolute z-10 w-fit 
                              bg-white border border-gray-200 rounded-lg mt-1 max-h-50 overflow-y-auto shadow-lg"
                              >
                                {medicineSearchResults.length > 0 ? (
                                  medicineSearchResults.map((result) => (
                                    <div
                                      key={result.id}
                                      onClick={() =>
                                        handleSelectMedicine(index, result)
                                      }
                                      className="p-2.5 text-sm
                                      text-gray-800 hover:bg-gray-100 cursor-pointer"
                                    >
                                      {result.name}
                                    </div>
                                  ))
                                ) : debouncedSearchTerm ? (
                                  <div className="p-2.5 text-sm text-gray-500 cursor-not-allowed">
                                    Không có kết quả
                                  </div>
                                ) : null}
                              </div>
                            )}
                          </td>
                          <td className="p-1 border-r border-gray-200 align-top">
                            <input
                              type="number"
                              name="quantity"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, e)}
                              className="w-full p-2 text-slate-700 outline-none"
                              placeholder="VD: 30"
                            />
                          </td>
                          <td className="p-1 border-r border-gray-200 align-top">
                            <input
                              name="unit"
                              value={item.unit}
                              onChange={(e) => handleItemChange(index, e)}
                              className="w-full p-2 text-slate-700 outline-none"
                              placeholder="VD: viên, vỉ, hộp..."
                            />
                          </td>
                          <td className="p-1 align-top">
                            <textarea
                              name="usageInstructions"
                              placeholder="Cách dùng..."
                              value={item.usageInstructions}
                              onChange={(e) => handleItemChange(index, e)}
                              className="w-full p-2 min-h-15 border-gray-200
                              text-slate-700 outline-none border-b"
                              rows={2}
                            />
                            <textarea
                              name="note"
                              placeholder="Ghi chú (nếu có)..."
                              value={item.note || ""}
                              onChange={(e) => handleItemChange(index, e)}
                              className="w-full p-2 min-h-15
                              text-slate-500 text-xs outline-none"
                              rows={2}
                            />
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-3 font-medium text-slate-800 border-r border-gray-200">
                            {item.medicine.name}
                          </td>
                          <td className="p-3 text-slate-700 border-r border-gray-200">
                            {item.quantity}
                          </td>
                          <td className="p-3 text-slate-700 border-r border-gray-200">
                            {item.unit}
                          </td>
                          <td className="p-3 text-slate-700">
                            {item.usageInstructions}
                            {item.note && (
                              <span className="block text-xs text-slate-500 mt-1">
                                Ghi chú: {item.note}
                              </span>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3">
              <span className="text-sm text-gray-500">
                Tổng chi phí:{" "}
                <span className="font-semibold text-gray-700">
                  {prescription.totalCost.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionDetailPage;
