"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getAppointmentByDoctorId,
  getPatientHistory,
  AppointmentHistory,
} from "@/services/AppointmentServices";
import { getPatientById, PatientProfile } from "@/services/PatientServices";
import {
  FaFlask,
  FaPills,
  FaChevronDown,
  FaChevronUp,
  FaBirthdayCake,
  FaVenusMars,
  FaMapMarkerAlt,
  FaPhone,
  FaUser,       // Thêm icon cho giao diện đẹp hơn
  FaStethoscope // Thêm icon
} from "react-icons/fa";
import {
  formatAppointmentDate,
  formatDateToDMY,
} from "@/services/OtherServices";
import { translateTestType } from "@/utils/translateEnums";
import { Appointment } from "@/types/frontend";
import { scrollToTop } from "@/components/ScrollToTopButton";
import Button from "@/components/Button";

interface SimplePatient {
  id: number;
  fullName: string;
}

const MedicalRecordsPage = () => {
  const { userRole, doctorProfile } = useAuth();

  const [patients, setPatients] = useState<SimplePatient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);

  const [selectedPatient, setSelectedPatient] = useState<SimplePatient | null>(
    null
  );
  
  const [detailedPatient, setDetailedPatient] = useState<PatientProfile | null>(
    null
  );
  const [history, setHistory] = useState<AppointmentHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [openAccordionId, setOpenAccordionId] = useState<number | null>(null);

  const accordionRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Effect 1: Lấy danh sách bệnh nhân
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

  // Effect 2: Lấy chi tiết khi chọn bệnh nhân
  useEffect(() => {
    if (selectedPatient?.id) {
      scrollToTop();

      const fetchDetails = async () => {
        setLoadingHistory(true);
        setHistory([]);
        setDetailedPatient(null);
        setOpenAccordionId(null);
        try {
          const [historyData, patientProfileData] = await Promise.all([
            getPatientHistory(selectedPatient.id),
            getPatientById(selectedPatient.id),
          ]);
          setHistory(historyData);
          setDetailedPatient(patientProfileData);
        } catch (error) {
          console.error("Failed to fetch patient details:", error);
        } finally {
          setLoadingHistory(false);
        }
      };

      fetchDetails();
    } else {
      setDetailedPatient(null);
      setHistory([]);
    }
  }, [selectedPatient]);

  // Xử lý Accordion
  const handleAccordionClick = (appointmentId: number) => {
    const isOpening = openAccordionId !== appointmentId;
    setOpenAccordionId(isOpening ? appointmentId : null);

    if (isOpening) {
      setTimeout(() => {
        const element = accordionRefs.current[appointmentId];
        if (element) {
          const topPos =
            element.getBoundingClientRect().top + window.scrollY - 75; // Margin top an toàn
          window.scrollTo({
            top: topPos,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  };

  return (
    // LAYOUT CHÍNH: Thêm padding và gap để sidebar tách biệt
    <div className="min-h-screen h-full w-full bg-gray-100 p-4 font-sans text-gray-800">
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-full">
        
        {/* --- SIDEBAR (STICKY) --- */}
        <aside className="col-span-1">
          {/* LOGIC STICKY CHUẨN:
             1. sticky top-4: Dính cách mép trên 16px
             2. h-[calc(100vh-32px)]: Chiều cao cố định bằng màn hình trừ padding
             3. rounded-xl shadow-lg: Giao diện thẻ nổi đẹp hơn
          */}
          <div className="sticky top-20 flex flex-col h-[calc(100vh-132px)] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            
            {/* Header Sidebar (Đứng im) */}
            <div className="p-4 border-b border-gray-100 bg-blue-50 flex-shrink-0">
              <h1 className="text-lg font-bold text-blue-800 flex items-center gap-2">
                <FaUser className="text-blue-600" />
                Danh sách Bệnh nhân
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Tổng số: {patients.length} bệnh nhân
              </p>
            </div>

            {/* List (Cuộn độc lập bên trong thẻ) */}
            <div className="flex-1 overflow-y-auto p-2 scroll-smooth custom-scrollbar">
              {loadingPatients ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                  <p>Đang tải...</p>
                </div>
              ) : patients.length > 0 ? (
                <ul className="space-y-1">
                  {patients.map((patient) => (
                    <li key={patient.id}>
                      <button
                        onClick={() => setSelectedPatient(patient)}
                        className={`w-full text-left p-3 rounded-lg transition-all border-l-4 group outline-none ${
                          selectedPatient?.id === patient.id
                            ? "bg-blue-100 border-blue-500 shadow-sm"
                            : "bg-gray-50 border-transparent hover:bg-gray-100 cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`font-semibold text-sm ${selectedPatient?.id === patient.id ? 'text-blue-900' : 'text-gray-700'}`}>
                              {patient.fullName}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">ID: {patient.id}</p>
                          </div>
                          {selectedPatient?.id === patient.id && (
                             <FaChevronDown className="text-blue-500 -rotate-90 text-xs" />
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  Không tìm thấy bệnh nhân nào.
                </div>
              )}
            </div>
            
            {/* Footer Sidebar (Optional) */}
            <div className="p-2 border-t border-gray-100 bg-gray-50 text-center text-[10px] text-gray-400 flex-shrink-0">
              Hệ thống quản lý y tế
            </div>
          </div>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <main className="col-span-1 md:col-span-3">
          {selectedPatient ? (
            <div className="space-y-6 animate-in fade-in duration-500 outline-none border-none">
              
              {/* Thông tin chi tiết bệnh nhân */}
              {detailedPatient ? (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-start justify-between mb-6 border-b pb-4">
                     <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                          {detailedPatient.fullName}
                        </h2>
                        <span className="text-sm text-gray-500">Hồ sơ bệnh án chi tiết</span>
                     </div>
                     <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                        Bệnh nhân
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-3">
                       <div className="flex items-center text-gray-700">
                          <FaBirthdayCake className="w-5 h-5 mr-3 text-gray-400" />
                          <span className="font-medium mr-2">Ngày sinh:</span>
                          {detailedPatient.dob ? formatDateToDMY(detailedPatient.dob) : "Chưa cập nhật"}
                       </div>
                       <div className="flex items-center text-gray-700">
                          <FaVenusMars className="w-5 h-5 mr-3 text-gray-400" />
                          <span className="font-medium mr-2">Giới tính:</span>
                          {detailedPatient.gender === "MALE" ? "Nam" : detailedPatient.gender === "FEMALE" ? "Nữ" : "Chưa cập nhật"}
                       </div>
                    </div>
                    <div className="space-y-3">
                       <div className="flex items-center text-gray-700">
                          <FaPhone className="w-5 h-5 mr-3 text-gray-400" />
                          <span className="font-medium mr-2">SĐT:</span>
                          {detailedPatient.phoneNumber || "Chưa cập nhật"}
                       </div>
                       <div className="flex items-center text-gray-700">
                          <FaMapMarkerAlt className="w-5 h-5 mr-3 text-gray-400" />
                          <span className="font-medium mr-2">Địa chỉ:</span>
                          {detailedPatient.address || "Chưa cập nhật"}
                       </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Loading Skeleton hoặc hiển thị tạm
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-pulse">
                   <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                   </div>
                </div>
              )}

              {/* Lịch sử khám bệnh */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                   <FaStethoscope className="text-blue-600" />
                   Lịch sử khám bệnh
                </h3>

                {loadingHistory ? (
                   <div className="text-center py-8 text-gray-500 bg-white rounded-xl border border-gray-200">
                      Đang tải lịch sử khám...
                   </div>
                ) : history.length > 0 ? (
                  <div className="space-y-4">
                    {history.map((record) => {
                      const isOpen = openAccordionId === record.appointmentId;
                      return (
                        <div
                          key={record.appointmentId}
                          ref={(el) => {
                            accordionRefs.current[record.appointmentId] = el;
                          }}
                          className={`rounded-xl border transition-all duration-300 ${
                            isOpen 
                              ? "bg-white border-blue-200 shadow-md ring-1 ring-blue-100" 
                              : "bg-white border-gray-200 shadow-sm hover:border-blue-300"
                          }`}
                        >
                          {/* Header Accordion */}
                          <div
                            className="flex cursor-pointer items-center justify-between p-5"
                            onClick={() => handleAccordionClick(record.appointmentId)}
                          >
                            <div className="space-y-1">
                              <p className="font-bold text-blue-700 text-lg">
                                {formatAppointmentDate(record.visitDate)}
                              </p>
                              <p className="text-gray-700 font-medium">
                                <span className="text-gray-500 font-normal mr-1">Chẩn đoán:</span> 
                                {record.diagnosis}
                              </p>
                            </div>
                            <div className={`p-2 rounded-full transition-colors ${isOpen ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                               <FaChevronDown className={`transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                            </div>
                          </div>

                          {/* Nội dung chi tiết */}
                          {isOpen && (
                            <div className="border-t border-gray-100 p-5 bg-gray-50/30 rounded-b-xl space-y-6">
                              
                              {/* Thông tin chung */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-white p-4 rounded-lg border border-gray-200">
                                <div>
                                   <span className="block text-gray-500 text-xs uppercase font-bold mb-1">Bác sĩ</span>
                                   <span className="text-gray-800 font-medium">{record.doctorName}</span>
                                </div>
                                <div>
                                   <span className="block text-gray-500 text-xs uppercase font-bold mb-1">Cơ sở</span>
                                   <span className="text-gray-800 font-medium">{record.hospitalName}</span>
                                </div>
                                <div className="md:col-span-2">
                                   <span className="block text-gray-500 text-xs uppercase font-bold mb-1">Ghi chú lâm sàng</span>
                                   <p className="text-gray-800 bg-gray-50 p-2 rounded border border-gray-100">
                                     {record.clinicalNote}
                                   </p>
                                </div>
                              </div>

                              {/* Kết quả xét nghiệm */}
                              {record.testResults && record.testResults.length > 0 && (
                                <div className="space-y-3">
                                  <h4 className="flex items-center font-bold text-gray-800 text-sm uppercase tracking-wide">
                                    <FaFlask className="mr-2 text-cyan-600" /> Kết quả xét nghiệm
                                  </h4>
                                  {record.testResults.map((test) => (
                                    <div key={test.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                       <div className="bg-cyan-50 px-4 py-2 border-b border-cyan-100 flex justify-between items-center">
                                          <span className="font-bold text-cyan-800">{translateTestType(test.testType)}</span>
                                          <span className="text-xs text-cyan-600 bg-white px-2 py-1 rounded border border-cyan-200 font-medium">Kết luận: {test.generalConclusion}</span>
                                       </div>
                                       <div className="overflow-x-auto">
                                          <table className="w-full text-sm text-left">
                                             <thead className="bg-gray-50 text-gray-500">
                                                <tr>
                                                   <th className="px-4 py-2 font-medium">Chỉ số</th>
                                                   <th className="px-4 py-2 font-medium">Kết quả</th>
                                                   <th className="px-4 py-2 font-medium">Đơn vị</th>
                                                   <th className="px-4 py-2 font-medium">Tham chiếu</th>
                                                </tr>
                                             </thead>
                                             <tbody className="divide-y divide-gray-100">
                                                {test.detailedTestItems.map((item) => (
                                                   <tr key={item.id} className="hover:bg-gray-50">
                                                      <td className="px-4 py-2 text-gray-800">{item.itemName}</td>
                                                      <td className="px-4 py-2 font-bold text-gray-900">{String(item.value)}</td>
                                                      <td className="px-4 py-2 text-gray-500">{item.unit}</td>
                                                      <td className="px-4 py-2 text-gray-500">{item.referenceRange}</td>
                                                   </tr>
                                                ))}
                                             </tbody>
                                          </table>
                                       </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Đơn thuốc */}
                              {record.prescriptions && record.prescriptions.length > 0 && (
                                <div className="space-y-3">
                                  <h4 className="flex items-center font-bold text-gray-800 text-sm uppercase tracking-wide">
                                    <FaPills className="mr-2 text-rose-600" /> Đơn thuốc
                                  </h4>
                                  {record.prescriptions.map((prescription) => (
                                    <div key={prescription.id} className="bg-white rounded-lg border border-gray-200 p-4">
                                       <div className="mb-3 pb-2 border-b border-gray-100">
                                          <p className="text-sm"><span className="font-bold text-gray-600">Chẩn đoán:</span> {prescription.diagnosis}</p>
                                          {prescription.advice && (
                                             <p className="text-sm mt-1 text-rose-700 italic"><span className="font-bold">Lời dặn:</span> {prescription.advice}</p>
                                          )}
                                       </div>
                                       <div className="overflow-x-auto bg-gray-50 rounded border border-gray-200">
                                          <table className="w-full text-sm text-left">
                                             <thead className="bg-gray-100 text-gray-600">
                                                <tr>
                                                   <th className="px-3 py-2 font-medium">Tên thuốc</th>
                                                   <th className="px-3 py-2 font-medium">Số lượng</th>
                                                   <th className="px-3 py-2 font-medium">HDSD</th>
                                                </tr>
                                             </thead>
                                             <tbody className="divide-y divide-gray-200">
                                                {prescription.prescriptionItems.map((item) => (
                                                   <tr key={item.id}>
                                                      <td className="px-3 py-2 font-medium text-gray-800">{item.medicine.name}</td>
                                                      <td className="px-3 py-2 text-gray-600">{item.quantity} {item.unit}</td>
                                                      <td className="px-3 py-2 text-gray-600">{item.usageInstructions}</td>
                                                   </tr>
                                                ))}
                                             </tbody>
                                          </table>
                                       </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Nút đóng */}
                              <div className="flex justify-center pt-2">
                                <Button
                                  onClick={() => {
                                    setOpenAccordionId(null);
                                    scrollToTop();
                                  }}
                                  variant="secondary"
                                  className="text-sm py-1 px-4"
                                  translate={false}
                                >
                                  <FaChevronUp className="mr-2 h-3 w-3" /> Thu gọn
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
                     <p className="text-gray-500">Bệnh nhân này chưa có lịch sử khám bệnh nào.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Trạng thái chưa chọn bệnh nhân (Placeholder)
            <div className="h-[calc(100vh-32px)] flex flex-col items-center justify-center text-gray-400 outline-none
            bg-white rounded-xl border-2 border-dashed border-gray-200">
              <div className="bg-gray-50 p-6 rounded-full mb-4">
                 <FaUser className="w-12 h-12 text-gray-300" />
              </div>
              <h2 className="text-xl font-semibold text-gray-600">Chưa chọn bệnh nhân</h2>
              <p className="text-sm mt-2">Vui lòng chọn một bệnh nhân từ danh sách bên trái để xem chi tiết.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MedicalRecordsPage;