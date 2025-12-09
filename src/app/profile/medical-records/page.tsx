"use client";

import { useState, useEffect, useRef } from "react"; // THÊM: import useRef
import { useAuth } from "@/contexts/AuthContext";
import {
  getAppointmentByDoctorId,
  getPatientHistory,
  AppointmentHistory,
} from "@/services/AppointmentServices";
import {
  FaFlask,
  FaPills,
  FaChevronDown,
  FaChevronUp, // THÊM: Icon cho nút đóng
} from "react-icons/fa";
import {
  formatAppointmentDate,
  formatDateToDMY,
} from "@/services/OtherServices";
import { translateTestType } from "@/utils/translateEnums"; // Giả sử bạn có hàm này
import { Appointment } from "@/types/frontend";
import { scrollToTop } from "@/components/ScrollToTopButton";
import Button from "@/components/Button";

// SỬA: Định nghĩa một kiểu dữ liệu mới cho đối tượng patient rút gọn từ API
interface SimplePatient {
  id: number;
  fullName: string;
  // Giả sử API trả về thêm các trường này trong appointment.patient
  // Nếu không, bạn cần lấy thông tin này từ một API khác khi cần
  dob?: string;
  gender?: string;
}

const MedicalRecordsPage = () => {
  const { userRole, doctorProfile } = useAuth();

  // SỬA: Sử dụng kiểu SimplePatient cho state
  const [patients, setPatients] = useState<SimplePatient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);

  const [selectedPatient, setSelectedPatient] = useState<SimplePatient | null>(
    null
  );
  const [history, setHistory] = useState<AppointmentHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [openAccordionId, setOpenAccordionId] = useState<number | null>(null);

  // THÊM: Ref để lưu trữ tham chiếu đến các phần tử accordion
  const accordionRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Effect 1: Lấy danh sách bệnh nhân duy nhất của bác sĩ
  useEffect(() => {
    if (userRole?.toLowerCase() === "doctor" && doctorProfile?.profileId) {
      const fetchUniquePatients = async () => {
        setLoadingPatients(true);
        try {
          const response = await getAppointmentByDoctorId(
            doctorProfile.profileId,
            {
              page: 1,
              appointmentsPerPage: 1000,
              sortField: "appointmentDate",
              sortOrder: "desc",
              filterStatus: "ALL",
            }
          );

          // SỬA: Map bây giờ sẽ lưu trữ kiểu SimplePatient
          const uniquePatientsMap = new Map<number, SimplePatient>();
          if (response.data) {
            response.data.forEach((appointment: Appointment) => {
              if (appointment.patient) {
                uniquePatientsMap.set(
                  appointment.patient.id,
                  appointment.patient
                );
              }
            });
          }

          setPatients(Array.from(uniquePatientsMap.values()));
        } catch (error) {
          console.error("Failed to fetch unique patients:", error);
        } finally {
          setLoadingPatients(false);
        }
      };

      fetchUniquePatients();
    }
  }, [userRole, doctorProfile]);

  // XÓA: useEffect này không còn cần thiết ở đây
  // useEffect(() => {
  //   scrollToTop();
  // }, []);

  // Effect 2: Lấy lịch sử khám và cuộn lên đầu khi một bệnh nhân được chọn
  useEffect(() => {
    if (selectedPatient?.id) {
      // SỬA: Gọi hàm cuộn lên đầu ở đây
      scrollToTop();

      const fetchHistory = async () => {
        setLoadingHistory(true);
        setHistory([]);
        setOpenAccordionId(null); // THÊM: Đóng tất cả accordion khi chọn bệnh nhân mới
        try {
          const historyData = await getPatientHistory(selectedPatient.id);
          setHistory(historyData);
        } catch (error) {
          console.error("Failed to fetch patient history:", error);
        } finally {
          setLoadingHistory(false);
        }
      };

      fetchHistory();
    }
  }, [selectedPatient]);

  // THÊM: Hàm xử lý click và cuộn đến accordion
  const handleAccordionClick = (appointmentId: number) => {
    const isOpening = openAccordionId !== appointmentId;
    setOpenAccordionId(isOpening ? appointmentId : null);

    // Nếu đang mở một accordion mới, cuộn đến nó
    if (isOpening) {
      // Dùng setTimeout để đảm bảo DOM đã cập nhật và có chiều cao đúng
      // trước khi thực hiện cuộn.
      setTimeout(() => {
        const element = accordionRefs.current[appointmentId];
        if (element) {
          // SỬA: Chuyển sang phương pháp cuộn thủ công để có margin top
          const topPos =
            element.getBoundingClientRect().top + window.scrollY - 65; // 16px margin top

          window.scrollTo({
            top: topPos,
            behavior: "smooth",
          });
        }
      }, 100); // Tăng nhẹ độ trễ để đảm bảo tính toán chính xác
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-gray-100 relative">
      {/* Cột danh sách bệnh nhân */}
      {/* SỬA: Thêm h-screen, top-0 và overflow-y-auto để làm sticky sidebar */}
      <aside className="top-0 flex min-h-screen w-1/3 max-w-sm flex-col border-r border-gray-200 bg-white sticky overflow-y-auto">
        <div className="border-b p-4">
          <h1 className="text-xl font-bold text-gray-800">
            Danh sách Bệnh nhân
          </h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingPatients ? (
            <p className="p-4 text-gray-500">Đang tải danh sách...</p>
          ) : patients.length > 0 ? (
            <ul>
              {patients.map((patient) => (
                <li key={patient.id}>
                  <button
                    onClick={() => setSelectedPatient(patient)}
                    className={`w-full border-l-4 p-4 text-left duration-300
                        cursor-pointer hover:bg-gray-50 ${
                          selectedPatient?.id === patient.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-transparent"
                        }`}
                  >
                    <p className="font-semibold text-gray-900">
                      {patient.fullName}
                    </p>
                    <p className="text-sm text-gray-600">ID: {patient.id}</p>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-4 text-gray-500">Không tìm thấy bệnh nhân nào.</p>
          )}
        </div>
      </aside>

      {/* Cột chi tiết lịch sử khám */}
      <main className="flex-1 p-8">
        {selectedPatient ? (
          <div>
            <h2 className="mb-1 text-3xl font-bold text-gray-900">
              {selectedPatient.fullName}
            </h2>
            {/* SỬA: Kiểm tra sự tồn tại của dob và gender trước khi hiển thị */}
            {(selectedPatient.dob || selectedPatient.gender) && (
              <p className="mb-6 text-gray-600">
                {selectedPatient.dob &&
                  `Ngày sinh: ${formatDateToDMY(selectedPatient.dob)}`}{" "}
                {selectedPatient.gender &&
                  `- Giới tính: ${
                    selectedPatient.gender === "MALE" ? "Nam" : "Nữ"
                  }`}
              </p>
            )}

            {loadingHistory ? (
              <p>Đang tải lịch sử khám bệnh...</p>
            ) : history.length > 0 ? (
              <div className="space-y-2">
                {/* SỬA: Chuyển sang layout Accordion */}
                {history.map((record) => {
                  const isOpen = openAccordionId === record.appointmentId;
                  return (
                    <div
                      key={record.appointmentId}
                      ref={(el) => {
                        accordionRefs.current[record.appointmentId] = el;
                      }}
                      // SỬA: Xóa class scroll-mt-4 không còn cần thiết
                      className="rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300"
                    >
                      {/* --- Header của Accordion (Luôn hiển thị) --- */}
                      <div
                        className="flex cursor-pointer items-center justify-between p-4"
                        // SỬA: Gọi hàm xử lý mới
                        onClick={() =>
                          handleAccordionClick(record.appointmentId)
                        }
                      >
                        <div className="text-lg">
                          <p className="font-semibold text-blue-700">
                            Ngày khám: {formatAppointmentDate(record.visitDate)}
                          </p>
                          <p className="text-md text-gray-600">
                            Chẩn đoán: {record.diagnosis}
                          </p>
                        </div>
                        <FaChevronDown
                          className={`transform text-gray-500 transition-transform duration-300 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </div>

                      {/* --- Nội dung chi tiết (Chỉ hiển thị khi mở) --- */}
                      {isOpen && (
                        <div className="space-y-6 border-t border-gray-200 p-4">
                          {/* SỬA: Chuyển thông tin chung vào bảng cho gọn */}
                          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                            <div className="font-semibold text-gray-600">
                              Bác sĩ điều trị:
                            </div>
                            <div className="text-gray-800">
                              {record.doctorName}
                            </div>

                            <div className="font-semibold text-gray-600">
                              Cơ sở y tế:
                            </div>
                            <div className="text-gray-800">
                              {record.hospitalName}
                            </div>

                            <div className="font-semibold text-gray-600">
                              Ghi chú lâm sàng:
                            </div>
                            <div className="text-gray-800">
                              {record.clinicalNote}
                            </div>
                          </div>

                          {/* --- Hiển thị chi tiết KẾT QUẢ XÉT NGHIỆM --- */}
                          {record.testResults &&
                            record.testResults.length > 0 && (
                              <div className="space-y-4">
                                <h3 className="flex items-baseline text-lg font-semibold text-gray-800">
                                  <FaFlask className="mr-2 text-blue-600" />
                                  Kết quả xét nghiệm
                                </h3>
                                {record.testResults.map((test) => (
                                  <div
                                    key={test.id}
                                    className="rounded-md border bg-gray-50/50 p-4"
                                  >
                                    <p className="font-semibold text-cyan-800">
                                      {translateTestType(test.testType)}
                                    </p>
                                    <p className="mt-1 text-sm text-gray-900">
                                      <span className="font-medium">
                                        Kết luận:
                                      </span>{" "}
                                      {test.generalConclusion}
                                    </p>
                                    {/* SỬA: Thêm border vào bảng */}
                                    <div className="mt-3 overflow-x-auto rounded-lg border">
                                      <table className="min-w-full text-sm">
                                        <thead className="bg-gray-100 text-left">
                                          <tr>
                                            <th className="p-2 font-medium text-gray-600">
                                              Chỉ số
                                            </th>
                                            <th className="p-2 font-medium text-gray-600">
                                              Kết quả
                                            </th>
                                            <th className="p-2 font-medium text-gray-600">
                                              Đơn vị
                                            </th>
                                            <th className="p-2 font-medium text-gray-600">
                                              Khoảng tham chiếu
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                          {test.detailedTestItems.map(
                                            (item) => (
                                              <tr
                                                key={item.id}
                                                className="text-gray-800"
                                              >
                                                <td className="p-2">
                                                  {item.itemName}
                                                </td>
                                                <td className="p-2 font-semibold">
                                                  {String(item.value)}
                                                </td>
                                                <td className="p-2">
                                                  {item.unit}
                                                </td>
                                                <td className="p-2">
                                                  {item.referenceRange}
                                                </td>
                                              </tr>
                                            )
                                          )}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                          {/* --- Hiển thị chi tiết ĐƠN THUỐC --- */}
                          {record.prescriptions &&
                            record.prescriptions.length > 0 && (
                              <div className="mt-6 space-y-4 border-t pt-6">
                                <h3 className="flex items-baseline text-lg font-semibold text-gray-800">
                                  <FaPills className="mr-2 text-green-600" />
                                  Đơn thuốc
                                </h3>
                                {record.prescriptions.map((prescription) => (
                                  <div
                                    key={prescription.id}
                                    className="rounded-md border bg-gray-50/50 p-4"
                                  >
                                    <p className="font-semibold text-rose-800">
                                      Chẩn đoán: {prescription.diagnosis}
                                    </p>
                                    {prescription.advice && (
                                      <p className="mt-1 text-sm text-gray-900">
                                        <span className="font-medium">
                                          Lời dặn:
                                        </span>{" "}
                                        {prescription.advice}
                                      </p>
                                    )}
                                    {/* SỬA: Thêm border vào bảng */}
                                    <div className="mt-3 overflow-x-auto rounded-lg border">
                                      <table className="min-w-full text-sm">
                                        <thead className="bg-gray-100 text-left">
                                          <tr>
                                            <th className="p-2 font-medium text-gray-600">
                                              Tên thuốc
                                            </th>
                                            <th className="p-2 font-medium text-gray-600">
                                              Số lượng
                                            </th>
                                            <th className="p-2 font-medium text-gray-600">
                                              Hướng dẫn sử dụng
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                          {prescription.prescriptionItems.map(
                                            (item) => (
                                              <tr
                                                key={item.id}
                                                className="text-gray-800"
                                              >
                                                <td className="p-2 font-semibold">
                                                  {item.medicine.name}
                                                </td>
                                                <td className="p-2">{`${item.quantity} ${item.unit}`}</td>
                                                <td className="p-2">
                                                  {item.usageInstructions}
                                                </td>
                                              </tr>
                                            )
                                          )}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                          {/* THÊM: Button để đóng accordion */}
                          <div className="mt-6 flex justify-center border-t pt-4">
                            <Button
                              onClick={() => {
                                setOpenAccordionId(null);
                                scrollToTop();
                              }}
                              variant="secondary"
                              translate={false}
                            >
                              <FaChevronUp className="mr-2 h-4 w-4" />
                              Đóng lại
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p>Bệnh nhân này chưa có lịch sử khám bệnh.</p>
            )}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-center text-gray-500">
            <div>
              <h2 className="text-2xl font-semibold">Chọn một bệnh nhân</h2>
              <p>
                Vui lòng chọn một bệnh nhân từ danh sách bên trái để xem lịch sử
                khám bệnh.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MedicalRecordsPage;
