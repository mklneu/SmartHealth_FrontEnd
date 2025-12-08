"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { IoIosArrowBack } from "react-icons/io";
import { FaPills, FaPlus, FaTrash } from "react-icons/fa";
import Button from "@/components/Button";
import {
  createPrescription,
  PrescriptionBody,
  PrescriptionItemBody,
} from "@/services/PrescriptionServices";
// 1. Import service và type của Medicine
import { getAllMedicines, Medicine } from "@/services/MedicineServices";
import { useDebounce } from "@/hooks/useDebounce";
import { AxiosError } from "axios";
import { getAppointmentById } from "@/services/AppointmentServices";
import { getInitialGmt7Time } from "@/services/OtherServices";
import {
  getTestResultsByPatientId,
  TestResult,
} from "@/services/TestResultServices";
import { translateTestType } from "@/utils/translateEnums";
import { ErrorResponse } from "@/types/frontend";

const CreatePrescriptionPage = () => {
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.appointmentId as string;

  const [medicines, setMedicines] = useState<
    (PrescriptionItemBody & { key: number })[]
  >([
    {
      key: Date.now(),
      medicine: { id: 0 },
      unit: "",
      quantity: "",
      usageInstructions: "",
      note: "",
    },
  ]);
  const [diagnosis, setDiagnosis] = useState("");
  const [advice, setAdvice] = useState("");
  const prescriptionDate = getInitialGmt7Time();

  // --- THÊM CÁC STATE NÀY ---
  const [availableTestResults, setAvailableTestResults] = useState<
    TestResult[]
  >([]);
  const [selectedTestResultIds, setSelectedTestResultIds] = useState<number[]>(
    []
  );
  const [patientId, setPatientId] = useState<number | null>(null);
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true); // State loading cho dữ liệu ban đầu
  // --- KẾT THÚC THÊM ---

  const [loading, setLoading] = useState(false);

  // --- State cho chức năng tìm kiếm thuốc ---
  const [medicineSearchResults, setMedicineSearchResults] = useState<
    Medicine[]
  >([]);
  const [searchTerms, setSearchTerms] = useState<string[]>([""]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const debouncedSearchTerm = useDebounce(
    activeIndex !== null ? searchTerms[activeIndex] : "",
    1000
  );
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  // -----------------------------------------

  // --- THÊM useEffect NÀY ĐỂ TẢI DỮ LIỆU ---
  useEffect(() => {
    const fetchData = async () => {
      if (appointmentId && typeof appointmentId === "string") {
        try {
          setIsDataLoading(true);
          // 1. Lấy thông tin lịch hẹn
          const appointmentData = await getAppointmentById(
            Number(appointmentId)
          );
          const currentPatientId = appointmentData.patient.id;

          // 2. Lưu ID bệnh nhân và bác sĩ vào state
          setPatientId(currentPatientId);
          setDoctorId(appointmentData.doctor.id);

          // 3. Lấy kết quả XN của bệnh nhân đó
          const results = await getTestResultsByPatientId(currentPatientId);
          setAvailableTestResults(results || []);
        } catch (error) {
          console.error("Failed to fetch initial data:", error);
          toast.error("Không thể tải dữ liệu (lịch hẹn/XN).");
        } finally {
          setIsDataLoading(false);
        }
      }
    };
    fetchData();
  }, [appointmentId]);
  // --- KẾT THÚC THÊM ---

  // 2. Lấy danh sách thuốc khi người dùng gõ
  useEffect(() => {
    if (debouncedSearchTerm) {
      const fetchMedicines = async () => {
        try {
          const results = await getAllMedicines({search: debouncedSearchTerm});
          setMedicineSearchResults(results?.data || []);
          console.log(">>>>>>>>>", results);
        } catch (error) {
          console.error("Failed to fetch medicines:", error);
        }
      };
      fetchMedicines();
    } else {
      setMedicineSearchResults([]);
    }
  }, [debouncedSearchTerm]);

  // 3. Xử lý khi thay đổi nội dung tìm kiếm
  const handleSearchChange = (index: number, value: string) => {
    const newSearchTerms = [...searchTerms];
    newSearchTerms[index] = value;
    setSearchTerms(newSearchTerms);
    setActiveIndex(index);

    // Xóa ID thuốc đã chọn nếu người dùng sửa lại tên
    const newMedicines = [...medicines];
    newMedicines[index].medicine.id = 0;
    setMedicines(newMedicines);
  };

  // 4. Xử lý khi chọn một thuốc từ danh sách
  const handleSelectMedicine = (index: number, medicine: Medicine) => {
    const newMedicines = [...medicines];
    newMedicines[index].medicine.id = medicine.id;
    setMedicines(newMedicines);

    const newSearchTerms = [...searchTerms];
    newSearchTerms[index] = medicine.name;
    setSearchTerms(newSearchTerms);

    setActiveIndex(null);
    setMedicineSearchResults([]);
  };

  // Xử lý khi thay đổi các input khác
  const handleMedicineDetailChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setMedicines((currentMedicines) => {
      // Tạo một bản sao của mảng để không thay đổi state cũ trực tiếp
      const newMedicines = [...currentMedicines];

      // Lấy ra đối tượng thuốc cần cập nhật
      const itemToUpdate = { ...newMedicines[index] };

      // Ép kiểu `name` thành một trong các key hợp lệ của đối tượng
      const key = name as keyof PrescriptionItemBody;

      // Cập nhật giá trị một cách an toàn
      if (key === "quantity") {
        // Nếu người dùng xóa hết, giữ nó là chuỗi rỗng để placeholder hiện ra
        // Nếu không, chuyển nó thành số (hoặc 0 nếu gõ chữ)
        itemToUpdate[key] = value === "" ? "" : parseInt(value, 10) || 0;
      } else if (
        key === "unit" ||
        key === "usageInstructions" ||
        key === "note"
      ) {
        itemToUpdate[key] = value;
      }

      // Đặt đối tượng đã cập nhật trở lại vào mảng
      newMedicines[index] = itemToUpdate;

      return newMedicines;
    });
  };

  // --- THÊM HÀM NÀY ---
  const handleTestResultToggle = (resultId: number) => {
    setSelectedTestResultIds((prevSelectedIds) => {
      if (prevSelectedIds.includes(resultId)) {
        // Nếu đã chọn -> Bỏ chọn
        return prevSelectedIds.filter((id) => id !== resultId);
      } else {
        // Nếu chưa chọn -> Thêm vào
        return [...prevSelectedIds, resultId];
      }
    });
  };
  // --- KẾT THÚC THÊM ---

  const addMedicine = () => {
    const newKey = Date.now();
    setMedicines([
      ...medicines,
      {
        key: newKey,
        medicine: { id: 0 },
        unit: "",
        quantity: "",
        usageInstructions: "",
        note: "",
      },
    ]);
    setSearchTerms([...searchTerms, ""]);
  };

  const removeMedicine = (index: number) => {
    if (medicines.length <= 1) {
      toast.info("Đơn thuốc phải có ít nhất một loại thuốc.");
      return;
    }

    // --- LOGIC MỚI ĐỂ SỬA LỖI ---
    if (activeIndex !== null) {
      if (index === activeIndex) {
        // 1. Nếu ta xóa chính mục đang active -> Đóng dropdown
        setActiveIndex(null);
      } else if (index < activeIndex) {
        // 2. Nếu ta xóa mục ở *trước* mục active -> Giảm activeIndex đi 1
        setActiveIndex(activeIndex - 1);
      }
      // 3. Nếu xóa mục ở *sau* mục active -> không cần làm gì
    }
    // --- KẾT THÚC LOGIC MỚI ---

    const newMedicines = medicines.filter((_, i) => i !== index);
    setMedicines(newMedicines);

    // THÊM 2 DÒNG NÀY:
    // Cập nhật cả mảng searchTerms
    const newSearchTerms = searchTerms.filter((_, i) => i !== index);
    setSearchTerms(newSearchTerms);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = medicines.every(
      (med) =>
        med.medicine.id && med.unit && med.quantity && med.usageInstructions
    );
    if (!isValid) {
      toast.error("Vui lòng điền đầy đủ thông tin cho tất cả các loại thuốc.");
      return;
    }

    setLoading(true);

    // TODO: Gọi API để tạo đơn thuốc
    try {
      // --- SỬA LẠI KHÚC NÀY ---
      // Không cần fetch lại appointment, dùng ID từ state
      if (!patientId || !doctorId) {
        throw new Error("Không tìm thấy ID bệnh nhân hoặc bác sĩ.");
      }
      // --- KẾT THÚC SỬA ---

      const payload: PrescriptionBody = {
        patient: { id: patientId },
        doctor: { id: doctorId },
        appointment: { id: Number(appointmentId) },
        prescriptionDate: new Date(prescriptionDate).toISOString(),
        diagnosis,
        advice,
        testResultIds: selectedTestResultIds,
        prescriptionItems: medicines.map((med) => ({
          medicine: { id: med.medicine.id },
          unit: med.unit,
          quantity: med.quantity,
          usageInstructions: med.usageInstructions,
          note: med.note,
        })),
      };

      await createPrescription(payload);
      toast.success("Tạo đơn thuốc thành công!");
      router.back();
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      console.error("Error creating prescription:", err.message);
      toast.error("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Đóng dropdown khi click ra ngoài
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

  // Thêm useEffect này
  useEffect(() => {
    // Focus vào input cuối cùng (cái mới thêm)
    const lastInput = inputRefs.current[inputRefs.current.length - 1];
    if (lastInput) {
      lastInput.focus();
    }
  }, [medicines.length]); // Chỉ chạy khi số lượng thuốc thay đổi

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="w-full mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 cursor-pointer
           text-gray-600 hover:text-gray-900
            font-semibold mb-6 transition-colors duration-200 focus:outline-none"
        >
          <IoIosArrowBack size={20} />
          Quay lại trang lịch hẹn
        </button>

        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg">
          <h1 className="text-xl font-bold text-green-700 mb-6 flex items-center gap-3">
            <FaPills />
            Tạo đơn thuốc
          </h1>

          {/* Các trường thông tin chung */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div>
                <label
                  htmlFor="prescriptionDate"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Thời gian kê đơn
                </label>
                <input
                  type="datetime-local"
                  id="prescriptionDate"
                  name="prescriptionDate"
                  value={prescriptionDate}
                  // onChange={(e) => setPrescriptionDate(e.target.value)}
                  readOnly
                  className="bg-white border
                border-gray-300 outline-none h-[45px]
                text-gray-900 text-sm rounded-lg 
                 focus:border-green-500 block w-full p-2.5 
                 placeholder:text-gray-400"
                />
              </div>
              {/* --- KẾT QUẢ XÉT NGHIỆM --- */}
              <div className="md:col-span-1 mt-4">
                <label className="block mb-2 text-sm font-medium text-gray-900">
                  Đính kèm Kết quả Xét nghiệm (Nếu có)
                </label>
                {isDataLoading ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    Đang tải danh sách KQXN...
                  </div>
                ) : (
                  <div
                    className="bg-white border border-gray-300 rounded-lg 
                         max-h-100 overflow-y-auto p-2 space-y-1"
                  >
                    {availableTestResults.length > 0 ? (
                      availableTestResults.map((result) => (
                        <label
                          key={result.id}
                          className="flex items-center gap-2 p-2 rounded 
                               hover:bg-gray-100 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 
                                 rounded "
                            checked={selectedTestResultIds.includes(result.id)}
                            onChange={() => handleTestResultToggle(result.id)}
                          />
                          <span className="text-sm text-gray-800">
                            {translateTestType(result.testType)} (Ngày{" "}
                            {new Date(result.testTime).toLocaleDateString(
                              "vi-VN"
                            )}
                            )
                          </span>
                        </label>
                      ))
                    ) : (
                      <p className="p-2 text-sm text-gray-500">
                        Bệnh nhân này chưa có kết quả xét nghiệm nào.
                      </p>
                    )}
                  </div>
                )}
              </div>
              {/* --- KẾT THÚC THAY THẾ --- */}
            </div>
            <form onSubmit={handleSubmit} className="space-y-8 mt-7">
              {/* Danh sách thuốc */}
              <div className="space-y-6" ref={searchContainerRef}>
                {medicines.map((med, index) => (
                  <div
                    key={med.key}
                    className="p-4 border border-gray-300 
                  rounded-lg relative space-y-4 bg-gray-50/50"
                  >
                    <p className="font-semibold text-gray-700">
                      Thuốc #{index + 1}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 5. Component tìm kiếm thuốc */}
                      <div className="relative">
                        <input
                          type="text"
                          value={searchTerms[index]}
                          onChange={(e) =>
                            handleSearchChange(index, e.target.value)
                          }
                          ref={(el) => {
                            inputRefs.current[index] = el;
                          }}
                          onFocus={() => setActiveIndex(index)}
                          placeholder="Gõ để tìm tên thuốc..."
                          className="bg-white border outline-none
                           border-gray-300 text-gray-900 
                           text-sm rounded-lg 
                            focus:border-green-500 block w-full p-2.5"
                          required
                        />
                        {activeIndex === index && (
                          <div
                            className="absolute z-10 w-full 
                          bg-white rounded-lg mt-1 max-h-50 overflow-y-auto shadow-lg"
                          >
                            {medicineSearchResults.length > 0 ? (
                              // 1. CÓ KẾT QUẢ: Hiển thị danh sách
                              medicineSearchResults.map((result) => (
                                <div
                                  key={result.id}
                                  onClick={() =>
                                    handleSelectMedicine(index, result)
                                  }
                                  className="p-2.5 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer"
                                >
                                  {result.name}
                                </div>
                              ))
                            ) : debouncedSearchTerm ? (
                              // 2. ĐÃ TÌM (có text) NHƯNG KHÔNG CÓ KẾT QUẢ
                              <div className="p-2.5 text-sm text-gray-500 cursor-not-allowed">
                                Không có kết quả tìm kiếm
                              </div>
                            ) : // // 3. CHƯA TÌM (vừa click vào, debouncedSearchTerm rỗng)
                            // <div className="p-2.5 text-sm text-gray-400">
                            //   Gõ để bắt đầu tìm...
                            // </div>
                            null}
                          </div>
                        )}
                      </div>
                      {/* --- Kết thúc component tìm kiếm --- */}

                      <input
                        type="text"
                        name="unit"
                        value={med.unit}
                        onChange={(e) => handleMedicineDetailChange(index, e)}
                        placeholder="Đơn vị (viên, vỉ, hộp)"
                        className="bg-white border 
                        border-gray-300 outline-none 
                        text-gray-900 text-sm rounded-lg
                          focus:border-green-500
                          block w-full p-2.5"
                        required
                      />
                    </div>
                    <input
                      type="number"
                      name="quantity"
                      value={med.quantity}
                      onChange={(e) => handleMedicineDetailChange(index, e)}
                      placeholder="Số lượng thuốc (ví dụ: 30 viên)"
                      className="bg-white border border-gray-300 outline-none text-gray-900 text-sm rounded-lg  focus:border-green-500 block w-full p-2.5 placeholder:text-gray-400"
                      required
                    />
                    <textarea
                      rows={2} // Thêm số dòng tùy ý
                      name="usageInstructions"
                      value={med.usageInstructions}
                      onChange={(e) => handleMedicineDetailChange(index, e)}
                      placeholder="Hướng dẫn thêm (ví dụ: Uống sau khi ăn no)"
                      className="bg-white border border-gray-300 min-h-10
                    outline-none text-gray-900 text-sm rounded-lg
                      focus:border-green-500 
                     block w-full p-2.5 placeholder:text-gray-400"
                    />
                    <textarea
                      rows={2}
                      name="note"
                      value={med.note}
                      onChange={(e) => handleMedicineDetailChange(index, e)}
                      placeholder="Ghi chú (nếu có)"
                      className="bg-white border border-gray-300 min-h-10
                    outline-none text-gray-900 text-sm rounded-lg
                      focus:border-green-500 
                     block w-full p-2.5 placeholder:text-gray-400"
                    />
                    {medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedicine(index)}
                        className="absolute top-3 right-3 cursor-pointer
                       text-red-500 hover:text-red-700 p-1"
                        title="Xóa thuốc này"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Nút thêm thuốc */}
              <Button onClick={addMedicine} icon={<FaPlus />} variant="green">
                Thêm thuốc
              </Button>

              {/* Chẩn đoán và lời khuyên của bác sĩ */}
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="diagnosis"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Chẩn đoán
                  </label>
                  <textarea
                    id="diagnosis"
                    rows={2}
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 outline-none  focus:border-green-500 placeholder:text-gray-400"
                    placeholder="Nhập chẩn đoán của bác sĩ..."
                  ></textarea>
                </div>
                <div>
                  <label
                    htmlFor="advice"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Lời khuyên của bác sĩ
                  </label>
                  <textarea
                    id="advice"
                    rows={4}
                    value={advice}
                    onChange={(e) => setAdvice(e.target.value)}
                    className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 outline-none  focus:border-green-500 placeholder:text-gray-400"
                    placeholder="Nhập lời khuyên về chế độ ăn uống, sinh hoạt, lịch tái khám..."
                  ></textarea>
                </div>
              </div>

              {/* Nút hành động */}
              <div className="flex justify-end gap-4 pt-4">
                <Button
                  onClick={() => router.back()}
                  variant="secondary"
                  size="sm"
                >
                  Hủy
                </Button>
                <Button type="submit" isLoading={loading} variant="green" size="sm">
                  {loading ? "Đang lưu..." : "Lưu đơn thuốc"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePrescriptionPage;
