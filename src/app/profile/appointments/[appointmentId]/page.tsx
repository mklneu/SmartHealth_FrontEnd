"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  FaUserInjured,
  FaCalendarCheck,
  FaNotesMedical,
  FaFileMedicalAlt, // Icon mới
  FaChevronUp,
  FaHistory,
} from "react-icons/fa";
import {
  completeAppointment,
  CompleteAppointmentBody,
  getAppointmentById,
  getPatientHistory, // Import hàm mới
  AppointmentHistory, // Import type mới
} from "@/services/AppointmentServices";
import { AxiosError } from "axios";
import { getPatientById, PatientProfile } from "@/services/PatientServices";
import {
  translateAppointmentType,
  translateGender,
  translateTestType,
} from "@/utils/translateEnums";
import { FaPlus, FaPrescriptionBottle, FaUserDoctor } from "react-icons/fa6";
import { IoIosArrowBack } from "react-icons/io";
// 1. Import service và type mới
import {
  detailedTestItems,
  getTestResultsByAppointmentId,
  TestResult,
} from "@/services/TestResultServices";
import Button from "@/components/Button";
import {
  getPrescriptionsByAppointmentId,
  Prescription,
  PrescriptionItemResponse,
} from "@/services/PrescriptionServices";
import { useAuth } from "@/contexts/AuthContext";
import { DoctorProfile, getDoctorById } from "@/services/DoctorServices";
import DoctorOnly from "@/components/DoctorOnly";
import {
  formatAppointmentDate,
  formatTime,
  formatTotalCost,
  TestResultStatusBadge,
} from "@/services/OtherServices";
import { Appointment, ErrorResponse } from "@/types/frontend";

const ExaminationDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const appointmentId = Number(params.appointmentId);

  const { userRole, folderName, STORAGE_BASE_URL } = useAuth();

  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);

  const otherPartyApp =
    userRole === "doctor" ? appointment?.patient : appointment?.doctor;
  const otherPartyUser = userRole === "doctor" ? patient : doctor;

  // 2. Thêm state để lưu danh sách kết quả xét nghiệm
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [showAllResults, setShowAllResults] = useState(false);

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [showAllPrescriptions, setShowAllPrescriptions] = useState(false);

  const itemsToShowInitially = 2;

  const [loading, setLoading] = useState(true);

  // 2. State cho modal và ghi chú của bác sĩ
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [doctorNote, setDoctorNote] = useState("");
  const [isCompleting, setIsCompleting] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  // --- THÊM STATE CHO LỊCH SỬ ---
  const [historyList, setHistoryList] = useState<AppointmentHistory[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (!appointmentId) return;

    const fetchAllData = async () => {
      try {
        setLoading(true);
        // Dùng Promise.all để gọi các API song song cho nhanh
        const [appResponse, resultsResponse, prescriptionResponse] =
          await Promise.all([
            getAppointmentById(appointmentId),
            getTestResultsByAppointmentId(appointmentId),
            getPrescriptionsByAppointmentId(appointmentId),
          ]);

        setAppointment(appResponse);
        setTestResults(resultsResponse); // 3. Lưu kết quả vào state
        setPrescriptions(prescriptionResponse);
        setDoctorNote(appResponse.doctorNote || ""); // Lấy ghi chú cũ nếu có

        // Gọi API lấy thông tin patient sau khi có appResponse
        const paResponse = await getPatientById(appResponse.patient.id);
        setPatient(paResponse);
        const drResponse = await getDoctorById(appResponse.doctor.id);
        setDoctor(drResponse);
      } catch (error) {
        const err = error as AxiosError<ErrorResponse>;
        console.error("Error fetching examination data:", err.message);
        toast.error("Không thể tải thông tin buổi khám.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [appointmentId]);

  const handleConfirmComplete = async () => {
    setIsCompleting(true);
    try {
      const payload: CompleteAppointmentBody = {
        doctorNote: doctorNote,
        testResultIds: testResults.map((result) => result.id),
        prescriptionIds: prescriptions.map((p) => p.id),
      };

      await completeAppointment(appointmentId, payload);

      toast.success("Buổi khám đã được hoàn thành!");
      setIsCompleteModalOpen(false);
      router.back(); // Quay về trang trước
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      console.error("Error completing appointment:", err.message);
      toast.error("Có lỗi xảy ra, không thể hoàn thành buổi khám.");
    } finally {
      setIsCompleting(false);
    }
  };

  const renderResultItem = (result: TestResult) => (
    <div
      key={result.id}
      className="flex items-center min-h-20
       cursor-pointer -translate-y-1
      hover:shadow-inner hover:-translate-y-[2px]
      justify-between p-3 duration-300 
      bg-gray-50 rounded-lg border"
      onClick={() => {
        if (result.status === "REQUESTED") {
          // toast.info("Kết quả xét nghiệm đang chờ xử lý.");
          router.push(
            `/profile/appointments/${appointmentId}/testResults/${result.id}`
          );
          return;
        } else if (result.status === "CANCELLED") {
          toast.info("Kết quả xét nghiệm đã bị hủy.");
          return;
        } else {
          router.push(
            `/profile/appointments/${appointmentId}/testResults/${result.id}`
          );
        }
      }}
    >
      <div className="flex items-center gap-3 w-full relative">
        <FaFileMedicalAlt className="text-blue-500 text-lg" />
        <div>
          <p className="font-semibold text-gray-800">
            {translateTestType(result.testType) || "Xét nghiệm khác"}
          </p>

          <p className="text-xs text-gray-500">
            Ngày: {new Date(result.testTime).toLocaleDateString("vi-VN")}
          </p>
          <div className="absolute -right-2 -bottom-4">
            {result.status && <TestResultStatusBadge status={result.status} />}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrescriptionItem = (result: Prescription) => (
    <div
      key={result.id}
      className="flex items-center
       cursor-pointer -translate-y-1
      hover:shadow-inner hover:-translate-y-[2px]
      justify-between p-3 duration-300 
      bg-gray-50 rounded-lg border"
      onClick={() =>
        router.push(
          `/profile/appointments/${appointmentId}/prescriptions/${result.id}`
        )
      }
    >
      <div className="flex items-center gap-3">
        <FaFileMedicalAlt className="text-green-500" />
        <div>
          {/* SỬA LỖI LOGIC HIỂN THỊ */}
          <p className="font-semibold text-gray-800">
            {result.diagnosis || "Đơn thuốc"}
          </p>
          <p className="text-xs text-gray-500">
            Ngày:{" "}
            {new Date(result.prescriptionDate).toLocaleDateString("vi-VN")}
          </p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    // CẢI THIỆN GIAO DIỆN TẢI TRANG
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Không tìm thấy thông tin lịch hẹn.</p>
      </div>
    );
  }

  // --- HÀM XỬ LÝ XEM LỊCH SỬ ---
  const handleViewHistory = async () => {
    if (!appointment?.patient?.id) return;

    setIsHistoryModalOpen(true);
    // Nếu đã có dữ liệu rồi thì không fetch lại để tiết kiệm API (tùy chọn)
    if (historyList.length > 0) return;

    setLoadingHistory(true);
    try {
      const data = await getPatientHistory(appointment.patient.id);
      setHistoryList(data);
    } catch (error) {
      console.error("Lỗi lấy lịch sử:", error);
      toast.error("Không thể tải lịch sử khám bệnh.");
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen w-full">
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 cursor-pointer
           text-gray-600 hover:text-gray-900
            font-semibold mb-6 transition-colors duration-200 focus:outline-none"
        >
          <IoIosArrowBack size={20} />
          {userRole !== "doctor" ? "Quay lại lịch hẹn" : "Quay lại danh sách "}
        </button>
      </div>
      <div className="mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Cột thông tin bệnh nhân */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md h-fit">
          <h2 className="text-xl font-bold text-sky-700 mb-4 flex items-baseline gap-2">
            {userRole === "doctor" ? (
              <>
                <FaUserInjured /> Thông tin bệnh nhân
              </>
            ) : (
              <>
                <FaUserDoctor /> Thông tin bác sĩ
              </>
            )}
          </h2>
          <div className="flex flex-col items-center text-center">
            {/* <img
              src={appointment.patient.avatar || "/default-avatar.png"}
              alt={appointment.patient.fullName}
              className="w-24 h-24 rounded-full object-cover border-4 border-blue-200 mb-4"
            /> */}
            <h3 className="text-lg font-semibold text-gray-800">
              {otherPartyApp?.fullName}
            </h3>
            <p className="text-gray-600">{otherPartyUser?.email}</p>
            <div className="text-left w-full mt-4 space-y-2 text-gray-700">
              <p>
                <strong>Giới tính:</strong>{" "}
                {otherPartyUser?.gender &&
                  translateGender(otherPartyUser.gender)}
              </p>
              <p>
                <strong>Ngày sinh:</strong>{" "}
                {otherPartyUser?.dob
                  ? new Date(otherPartyUser.dob).toLocaleDateString("vi-VN")
                  : "Chưa cập nhật"}
              </p>
            </div>
          </div>
          {appointment.doctorNote && (
            <div className="mt-6 border-t border-gray-300 pt-4">
              <h3 className="text-lg font-bold text-sky-700 mb-2 flex items-baseline gap-2">
                <FaNotesMedical /> Ghi chú của bác sĩ
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                - {appointment.doctorNote}
              </p>
            </div>
          )}
          {/* --- THÊM NÚT XEM LỊCH SỬ TẠI ĐÂY --- */}
          <DoctorOnly userRole={userRole}>
            <Button
              onClick={handleViewHistory}
              variant="white"
              className="mt-4 w-full border-blue-200 text-blue-600 hover:bg-blue-50"
              icon={<FaHistory />}
            >
              Lịch sử khám bệnh
            </Button>
          </DoctorOnly>
        </div>

        {/* Cột chính cho việc khám bệnh */}
        <div className="h-fit lg:col-span-3 bg-white p-6 rounded-lg shadow-md">
          <div>
            <div className="flex items-baseline text-xl font-bold text-sky-700 mb-1 gap-2">
              <FaCalendarCheck />
              <span> Thông tin buổi khám</span>{" "}
              <span className="text-sm font-medium text-gray-500">
                ({translateAppointmentType(appointment.appointmentType)})
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-300 my-2">
              <div className="text-gray-500 text-sm">
                Thời giam khám: {formatTime(appointment.appointmentTime)} -{" "}
                {formatAppointmentDate(appointment.appointmentDate)}
              </div>
              <div className="text-gray-500 text-sm">
                {appointment.clinicRoom}
              </div>
            </div>
          </div>

          <div className=" lg:space-x-3 lg:flex lg:flex-row w-full">
            {/* Khu vực tạo kết quả xét nghiệm */}
            <div className="mt-3 p-4 border rounded-lg space-y-3 lg:w-1/2 h-fit">
              <h3 className="font-semibold text-lg flex gap-2 text-gray-600 items-baseline">
                <FaNotesMedical /> <p>Chỉ định xét nghiệm</p>
              </h3>

              {testResults.length > 0 ? (
                <div>
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-600">
                      Các kết quả đã tạo:
                    </p>
                    {testResults
                      .slice(0, itemsToShowInitially)
                      .map(renderResultItem)}
                  </div>

                  <div
                    className={`grid transition-all duration-500 ease-in-out ${
                      showAllResults
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="space-y-3 pt-3">
                        {testResults
                          .slice(itemsToShowInitially)
                          .map(renderResultItem)}
                      </div>
                    </div>
                  </div>
                  {testResults.length > itemsToShowInitially && (
                    <Button
                      onClick={() => setShowAllResults(!showAllResults)}
                      className="w-full flex
                       items-center justify-center gap-2  
                      py-2 mt-4"
                      variant="white"
                    >
                      <div className="flex items-center gap-2">
                        {showAllResults
                          ? `Ẩn bớt `
                          : `Xem thêm ${
                              testResults.length - itemsToShowInitially
                            } kết quả`}
                        <FaChevronUp
                          className={`${
                            !showAllResults ? "rotate-180" : ""
                          } duration-500`}
                        />
                      </div>
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-left text-gray-500 py-2">
                  Chưa có kết quả xét nghiệm nào được tạo cho buổi khám này.
                </p>
              )}
              {!["COMPLETED", "CANCELLED"].includes(appointment.status) && (
                <DoctorOnly userRole={userRole}>
                  <div className="pt-2 ">
                    <Button
                      onClick={() =>
                        router.push(
                          `/profile/appointments/${appointmentId}/testResults`
                        )
                      }
                      icon={<FaPlus />}
                    >
                      Yêu cầu xét nghiệm mới
                    </Button>
                    {/* Nút xem tổng quan mới */}
                    {testResults.length > 0 && (
                      <Button
                        onClick={() => setIsSummaryModalOpen(true)}
                        variant="none"
                        className="text-gray-600 mt-4"
                      >
                        Xem Tổng Quan
                      </Button>
                    )}
                  </div>
                </DoctorOnly>
              )}
            </div>

            {/* Khu vực kê đơn thuốc */}
            <div className="mt-3 p-4 border rounded-lg space-y-3 lg:w-1/2 h-fit">
              <h3 className="font-semibold text-lg flex items-baseline gap-2 text-gray-600">
                <FaPrescriptionBottle />
                <p>Kê đơn thuốc</p>
              </h3>

              {prescriptions.length > 0 ? (
                <div>
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-600">
                      Các đơn thuốc đã tạo:
                    </p>
                    {prescriptions
                      .slice(0, itemsToShowInitially)
                      .map(renderPrescriptionItem)}
                  </div>

                  <div
                    className={`grid transition-all duration-500 ease-in-out ${
                      showAllPrescriptions
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="space-y-3 pt-3">
                        {prescriptions
                          .slice(itemsToShowInitially)
                          .map(renderPrescriptionItem)}
                      </div>
                    </div>
                  </div>
                  {prescriptions.length > itemsToShowInitially && (
                    <Button
                      onClick={() =>
                        setShowAllPrescriptions(!showAllPrescriptions)
                      }
                      className="w-full flex
                       items-center justify-center gap-2  
                      py-2 mt-4 hover:bg-blue-50"
                      variant="white"
                    >
                      <div className="flex items-center gap-2">
                        {showAllPrescriptions
                          ? `Ẩn bớt `
                          : `Xem thêm ${
                              prescriptions.length - itemsToShowInitially
                            } kết quả`}
                        <FaChevronUp
                          className={`${
                            !showAllPrescriptions ? "rotate-180" : ""
                          } transition-transform duration-500`}
                        />
                      </div>
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-left text-gray-500 py-2">
                  Chưa có đơn thuốc nào được tạo cho buổi khám này.
                </p>
              )}
              {prescriptions.length > 0 && (
                <div className="w-full">
                  <div className="w-fit mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-baseline space-x-1 text-sm">
                      <span className="font-medium text-gray-700">
                        Tổng chi phí thuốc:
                      </span>
                      <span className="font-bold text-green-600">
                        {formatTotalCost(prescriptions)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {!["COMPLETED", "CANCELLED"].includes(appointment.status) &&
                (testResults.length === 0 ||
                  testResults.every(
                    (result) => result.status === "REVIEWED"
                  )) && (
                  <DoctorOnly userRole={userRole}>
                    <div className="pt-2">
                      <Button
                        onClick={() =>
                          router.push(
                            `/profile/appointments/${appointmentId}/prescriptions`
                          )
                        }
                        variant="green"
                        icon={<FaPlus />}
                      >
                        Tạo đơn thuốc mới
                      </Button>
                    </div>
                  </DoctorOnly>
                )}
            </div>
          </div>
          {appointment.status === "COMPLETED" ? (
            <div className="flex mt-4 justify-end">
              <Button
                variant="green"
                translate={false}
                className="hover:-translate-x-[2px] 
                !cursor-default"
              >
                Buổi khám đã được hoàn thành
              </Button>
            </div>
          ) : appointment.status === "CANCELLED" ? (
            <div className="flex mt-4 justify-end">
              <Button
                variant="danger"
                translate={false}
                className="hover:-translate-x-[2px] 
                !cursor-default"
              >
                Buổi khám đã bị hủy
              </Button>
            </div>
          ) : appointment.status === "CONFIRMED" && prescriptions.length > 0 ? (
            <DoctorOnly userRole={userRole}>
              <div className="flex mt-4 justify-end">
                <Button
                  variant="purple"
                  onClick={() => setIsCompleteModalOpen(true)}
                  translate={false}
                  className="hover:-translate-x-[2px]"
                >
                  Hoàn thành buổi khám
                </Button>
              </div>
            </DoctorOnly>
          ) : appointment.status === "CONFIRMED" ? (
            <div className="flex mt-4 justify-end">
              <Button
                variant="alarm"
                translate={false}
                className="hover:-translate-x-[2px] 
                !cursor-default"
              >
                Buổi khám đã được xác nhận
              </Button>
            </div>
          ) : null}
        </div>
      </div>
      {isCompleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Hoàn thành buổi khám
            </h2>
            <textarea
              className="w-full p-2 border outline-none
              border-gray-300 rounded-md text-slate-700 min-h-24"
              rows={4}
              placeholder="Nhập ghi chú của bác sĩ..."
              value={doctorNote}
              onChange={(e) => setDoctorNote(e.target.value)}
            />
            <div className="flex justify-end gap-3 mt-5">
              <Button
                variant="secondary"
                onClick={() => setIsCompleteModalOpen(false)}
              >
                Hủy
              </Button>
              <Button
                variant="purple"
                onClick={handleConfirmComplete}
                isLoading={isCompleting}
              >
                {isCompleting ? "Đang xử lý..." : "Xác nhận"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Báo cáo Tổng hợp Kết quả Xét nghiệm */}
      {isSummaryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 ">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
            {/* Header Modal */}
            <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
              <h2 className="text-2xl font-bold text-sky-700 ">
                Báo Cáo Tổng Hợp Kết Quả Xét Nghiệm
              </h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsSummaryModalOpen(false)}
              >
                Đóng của sổ
              </Button>
            </div>

            {/* Body Modal */}
            <div className="flex-grow overflow-y-auto p-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {testResults.length > 0 ? (
                <div className="space-y-6">
                  {testResults.map((result) => (
                    <div
                      key={result.id}
                      className="p-4 border rounded-lg cursor-pointer
                    bg-gray-50/50 hover:shadow-md duration-300 overflow-hidden"
                      onClick={() =>
                        router.push(
                          `/profile/appointments/${appointmentId}/testResults/${result.id}`
                        )
                      }
                    >
                      {/* Header của mỗi kết quả */}
                      <div
                        className="flex justify-between items-start 
                    pb-3 border-b mb-3 relative"
                      >
                        <div>
                          <p className="font-bold text-lg text-blue-700">
                            {translateTestType(result.testType)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Ngày thực hiện:{" "}
                            {new Date(result.testTime).toLocaleString("vi-VN")}
                          </p>
                        </div>
                        <div className="absolute -right-2 bottom-2">
                          <TestResultStatusBadge status={result.status} />
                        </div>
                      </div>

                      {/* Nội dung chi tiết */}
                      <div className="space-y-4 text-sm">
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-1">
                            Kết luận của bác sĩ xét nghiệm:
                          </h4>
                          <p className="text-gray-700 pl-2 border-l-2 border-blue-400">
                            {result.generalConclusion || (
                              <i className="text-gray-400">Chưa có kết luận</i>
                            )}
                          </p>
                        </div>

                        {/* Bảng chỉ số chi tiết */}
                        {result.detailedTestItems &&
                          result.detailedTestItems.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-gray-800 mb-2">
                                Chỉ số chi tiết:
                              </h4>
                              <div className="overflow-x-auto border rounded-lg">
                                <table className="min-w-full text-sm text-left">
                                  <thead className="bg-slate-100">
                                    <tr>
                                      <th className="p-2 font-semibold text-slate-700 border-r border-gray-200">
                                        Tên chỉ số
                                      </th>
                                      <th className="p-2 font-semibold text-slate-700 border-r border-gray-200">
                                        Giá trị
                                      </th>
                                      <th className="p-2 font-semibold text-slate-700 border-r border-gray-200">
                                        Đơn vị
                                      </th>
                                      <th className="p-2 font-semibold text-slate-700 border-r border-gray-200">
                                        Khoảng tham chiếu
                                      </th>
                                      <th className="p-2 font-semibold text-slate-700">
                                        Ghi chú
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {result.detailedTestItems.map(
                                      (item, index) => (
                                        <tr
                                          key={item.id || index}
                                          className="border-b"
                                        >
                                          <td className="p-2 font-medium text-slate-800 border-r border-gray-200">
                                            {item.itemName}
                                          </td>
                                          <td className="p-2 text-slate-700 border-r border-gray-200">
                                            {item.value}
                                          </td>
                                          <td className="p-2 text-slate-700 border-r border-gray-200">
                                            {item.unit}
                                          </td>
                                          <td className="p-2 text-slate-700 border-r border-gray-200">
                                            {item.referenceRange}
                                          </td>
                                          <td className="p-2 text-slate-700">
                                            {item.notes || "-"}
                                          </td>
                                        </tr>
                                      )
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                        {result.attachmentFile && (
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-1">
                              Tệp đính kèm:
                            </h4>
                            <a
                              href={`${STORAGE_BASE_URL}/${folderName}/${result?.attachmentFile}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sky-600 hover:underline break-all"
                            >
                              {result.attachmentFile}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">
                  Không có kết quả xét nghiệm nào.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL LỊCH SỬ KHÁM BỆNH --- */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
            {/* Header Modal */}
            <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-teal-50 rounded-full text-teal-600 border border-teal-100">
                  <FaHistory size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wide">
                    Lịch sử khám bệnh
                  </h2>
                  <p className="text-slate-500 text-sm flex items-baseline gap-1">
                    Bệnh nhân:
                    <span className="font-bold text-slate-600 text-base">
                      {otherPartyApp?.fullName}
                    </span>
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsHistoryModalOpen(false)}
              >
                Đóng cửa sổ
              </Button>
            </div>

            {/* Body Modal */}
            <div className="flex-grow overflow-y-auto p-6 bg-gray-50 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {loadingHistory ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-500"></div>
                </div>
              ) : historyList.length > 0 ? (
                <div className="space-y-6">
                  {historyList.map((item) => (
                    <div
                      key={item.appointmentId}
                      className="bg-white rounded-lg hover:shadow-lg duration-300
                      shadow border border-gray-200 overflow-hidden"
                    >
                      {/* Header của từng lần khám */}
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 border-b border-slate-100 bg-white">
                        <div className="flex gap-4 items-center">
                          <div className="h-12 w-12 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 font-bold text-lg">
                            BS
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-slate-800">
                              {item.doctorName}
                            </h3>
                            <p className="text-sm text-slate-500">
                              {item.hospitalName}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 md:mt-0 flex flex-col items-end">
                          <div className="flex items-center gap-2 text-slate-700 font-semibold bg-slate-50 px-3 py-1 rounded-md border border-slate-200">
                            <FaCalendarCheck className="text-teal-500" />
                            {formatAppointmentDate(item.visitDate)}
                          </div>
                          <span className="text-xs text-slate-400 mt-1">
                            Mã hồ sơ: #{item.appointmentId}
                          </span>
                        </div>
                      </div>

                      {/* Nội dung chi tiết */}
                      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Cột trái: Chẩn đoán & Ghi chú */}
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase">
                              Chẩn đoán
                            </p>
                            <p className="text-gray-700 font-bold bg-gray-50 p-2 rounded border border-gray-100 text-sm">
                              {item.diagnosis || "Chưa có chẩn đoán"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase">
                              Ghi chú lâm sàng
                            </p>
                            <p className="text-gray-700 bg-gray-50 p-2 rounded border border-gray-100 text-sm">
                              {item.clinicalNote || "Không có ghi chú"}
                            </p>
                          </div>
                        </div>

                        {/* Cột phải: Thuốc & Xét nghiệm */}
                        <div className="space-y-3 border-l pl-0 md:pl-6 border-gray-100">
                          {/* Thuốc */}
                          <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase flex items-center gap-1">
                              <FaPrescriptionBottle /> Đơn thuốc (
                              {item.prescriptions?.length || 0})
                            </p>
                            {item.prescriptions &&
                            item.prescriptions.length > 0 ? (
                              <div className="mt-2 space-y-3">
                                {item.prescriptions.map(
                                  (pres: Prescription) => (
                                    <div
                                      key={pres.id}
                                      className="bg-gray-50 p-2 rounded border border-gray-200 text-sm"
                                    >
                                      <div className="flex justify-between font-medium text-gray-800 border-b border-gray-200 pb-1 mb-1">
                                        <span>{pres.diagnosis}</span>
                                        <span className="text-green-600">
                                          {formatTotalCost([pres])}
                                        </span>
                                      </div>

                                      {/* Danh sách thuốc chi tiết */}
                                      {pres.prescriptionItems &&
                                      pres.prescriptionItems.length > 0 ? (
                                        <ul className="space-y-1 pl-1">
                                          {pres.prescriptionItems.map(
                                            (
                                              drug: PrescriptionItemResponse
                                            ) => (
                                              <li
                                                key={drug.id}
                                                className="text-gray-600 text-xs flex justify-between"
                                              >
                                                <span>
                                                  • <b>{drug.medicine?.name}</b>
                                                  <span className="text-gray-500">
                                                    {" "}
                                                    ({drug.quantity} {drug.unit}
                                                    )
                                                  </span>
                                                </span>
                                                <span className="italic text-gray-500">
                                                  {'"'}
                                                  {drug.usageInstructions}
                                                  {'"'}
                                                </span>
                                              </li>
                                            )
                                          )}
                                        </ul>
                                      ) : (
                                        <p className="text-xs text-gray-400 italic">
                                          Không có thuốc chi tiết
                                        </p>
                                      )}
                                    </div>
                                  )
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400 italic">
                                Không có đơn thuốc
                              </p>
                            )}
                          </div>

                          {/* Xét nghiệm */}
                          <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase flex items-center gap-1">
                              <FaFileMedicalAlt /> Xét nghiệm (
                              {item.testResults?.length || 0})
                            </p>
                            {item.testResults && item.testResults.length > 0 ? (
                              <div className="mt-2 space-y-3">
                                {item.testResults.map((test: TestResult) => (
                                  <div
                                    key={test.id}
                                    className="bg-gray-50 p-2 rounded border border-gray-200 text-sm"
                                  >
                                    {/* Header: Loại xét nghiệm */}
                                    <div className="flex justify-between font-medium text-gray-800 border-b border-gray-200 pb-1 mb-1">
                                      <span>
                                        {translateTestType(test.testType)}
                                      </span>
                                    </div>

                                    {/* Kết luận chung */}
                                    <div className="mb-1">
                                      <span className="font-semibold text-xs text-gray-600">
                                        Kết luận:{" "}
                                      </span>
                                      <span
                                        className={`text-xs ${
                                          test.generalConclusion
                                            ? "text-gray-700"
                                            : "text-gray-400 italic"
                                        }`}
                                      >
                                        {test.generalConclusion ||
                                          "Chưa có kết luận"}
                                      </span>
                                    </div>

                                    {/* Chi tiết các chỉ số (nếu có) */}
                                    {test.detailedTestItems &&
                                    test.detailedTestItems.length > 0 ? (
                                      <ul className="space-y-1 pl-1 border-t border-gray-100 pt-1 mt-1">
                                        {test.detailedTestItems.map(
                                          (detail: detailedTestItems) => (
                                            <li
                                              key={detail.id}
                                              className="text-gray-600 text-xs flex justify-between"
                                            >
                                              <span>• {detail.itemName}</span>
                                              <span className="font-medium">
                                                {detail.value} {detail.unit}
                                              </span>
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    ) : null}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400 italic">
                                Không có xét nghiệm
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <FaHistory size={48} className="mb-4 opacity-20" />
                  <p>Bệnh nhân chưa có lịch sử khám bệnh nào.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExaminationDetailPage;
