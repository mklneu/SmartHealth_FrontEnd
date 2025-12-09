"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getTestResultsByPatientId,
  TestResult,
} from "@/services/TestResultServices";
import { formatAppointmentDate } from "@/services/OtherServices";
import {
  FaFileMedicalAlt,
  FaStethoscope,
  FaCalendarAlt,
  FaTimes,
  FaSearch,
  FaFilePrescription,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { translateTestType } from "@/utils/translateEnums";
import {
  getPrescriptionsByPatientId,
  Prescription,
} from "@/services/PrescriptionServices";
import { ErrorResponse } from "@/types/frontend";

// Component Skeleton cho trạng thái loading
const SkeletonCard = () => (
  <div className="bg-white p-4 rounded-lg shadow-md animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
  </div>
);

const MedicalTab = () => {
  const { user, userRole } = useAuth();
  const [results, setResults] = useState<TestResult[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);

  // 1. Luôn khởi tạo với giá trị mặc định, giống hệt server
  const [activeTab, setActiveTab] = useState<string>("testResults");

  // 2. Dùng useEffect để đọc từ localStorage SAU KHI component đã được mount ở client
  useEffect(() => {
    const savedTab = localStorage.getItem("activeTab");
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []); // Mảng rỗng `[]` đảm bảo nó chỉ chạy một lần duy nhất ở client

  // 3. Vẫn giữ useEffect này để LƯU lại mỗi khi activeTab thay đổi
  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!user || userRole == "doctor") {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [testResultsData, prescriptionsData] = await Promise.all([
          getTestResultsByPatientId(user.profileId),
          getPrescriptionsByPatientId(user.profileId),
        ]);

        console.log("Fetched test results:", testResultsData);
        setResults(testResultsData);
        setPrescriptions(prescriptionsData);
      } catch (error) {
        const err = error as AxiosError<ErrorResponse>;
        console.error("Error fetching test results:", err.message);
        toast.error("Không thể tải hồ sơ bệnh án.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [user, userRole]);

  const openModal = (result: TestResult) => {
    setSelectedResult(result);
  };

  const closeModal = () => {
    setSelectedResult(null);
  };

  // Giao diện chính
  return (
    <div className="p-2 sm:p-4 md:p-8 min-h-screen w-full mx-auto">
      <h2 className="text-2xl font-bold flex items-center gap-2 text-blue-800 mb-6">
        <FaFileMedicalAlt />
        Kết quả xét nghiệm & Đơn thuốc
      </h2>

      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("testResults")}
          className={`py-2 px-4 text-sm font-medium cursor-pointer 
            duration-300 outline-none
            ${
              activeTab === "testResults"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "border-b-2 border-transparent text-gray-500 hover:text-gray-700"
            }`}
        >
          Kết quả xét nghiệm
        </button>
        <button
          onClick={() => setActiveTab("prescriptions")}
          className={`py-2 px-4 text-sm font-medium cursor-pointer
            duration-300 outline-none
            ${
              activeTab === "prescriptions"
                ? "border-b-2 border-green-600 text-green-600"
                : "border-b-2 border-transparent text-gray-500 hover:text-gray-700"
            }`}
        >
          Đơn thuốc
        </button>
      </div>

      {loading ? (
        // 1. Luôn hiển thị skeleton khi đang tải
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        // 2. Khi không tải, hiển thị nội dung dựa trên tab
        <>
          {/* Khối hiển thị cho tab Kết quả xét nghiệm */}
          {activeTab === "testResults" &&
            (results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="bg-white p-5 rounded-lg border border-gray-300 shadow-md hover:shadow-xl hover:-translate-y-[2px] transition-all duration-300 cursor-pointer"
                    onClick={() => openModal(result)}
                  >
                    <h3 className="text-lg font-semibold text-gray-800 truncate">
                      {translateTestType(result.testType)}
                    </h3>
                    <div className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                      <FaStethoscope />
                      <span>BS. {result.doctor.fullName || "N/A"}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                      <FaCalendarAlt />
                      <span>{formatAppointmentDate(result.testTime)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 bg-white rounded-lg min-h-[300px] flex flex-col items-center justify-center text-center text-gray-500">
                <FaSearch className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700">
                  Không tìm thấy hồ sơ
                </h3>
                <p className="mt-2 max-w-sm">
                  Bạn chưa có kết quả xét nghiệm nào được ghi nhận trong hệ
                  thống.
                </p>
              </div>
            ))}

          {/* Khối hiển thị cho tab Đơn thuốc */}
          {activeTab === "prescriptions" &&
            (prescriptions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {prescriptions.map((presc) => (
                  <div
                    key={presc.id}
                    className="bg-white p-5 rounded-lg border border-gray-300 shadow-md hover:shadow-xl hover:-translate-y-[2px] transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedPrescription(presc)}
                  >
                    <h3 className="text-lg font-semibold text-gray-800 truncate">
                      Đơn thuốc: {presc.diagnosis}
                    </h3>
                    <div className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                      <FaStethoscope />
                      <span>BS. {presc.doctor.fullName || "N/A"}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                      <FaCalendarAlt />
                      <span>
                        {formatAppointmentDate(presc.prescriptionDate)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 bg-white rounded-lg min-h-[300px] flex flex-col items-center justify-center text-center text-gray-500">
                <FaFilePrescription className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700">
                  Không tìm thấy đơn thuốc
                </h3>
              </div>
            ))}
        </>
      )}

      {selectedResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.6)]"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg shadow-lg p-6 w-[90vw] max-w-2xl relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-5 right-5 text-gray-500 duration-300
               hover:text-gray-800 cursor-pointer"
            >
              <FaTimes size={20} />
            </button>
            <h3 className="text-xl font-bold text-blue-700 mb-4 border-b border-gray-300 pb-2">
              Chi tiết kết quả xét nghiệm
            </h3>
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>Loại xét nghiệm:</strong>{" "}
                {translateTestType(selectedResult.testType)}
              </p>
              <p>
                <strong>Ngày xét nghiệm:</strong>{" "}
                {formatAppointmentDate(selectedResult.testTime)}
              </p>
              <p>
                <strong>Bác sĩ chỉ định:</strong> BS.{" "}
                {selectedResult.doctor.fullName || "N/A"}
              </p>
              <div className="p-3 bg-gray-50 rounded-md mt-2">
                <p className="font-semibold">Kết luận chung:</p>
                <p>{selectedResult.generalConclusion}</p>
              </div>
              <h4 className="font-semibold pt-2">Chỉ số chi tiết:</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100 border border-gray-200">
                    <tr>
                      <th className="p-2 text-left border-r border-gray-200">
                        Chỉ số
                      </th>
                      <th className="p-2 text-left border-r border-gray-200">
                        Kết quả
                      </th>
                      <th className="p-2 text-left">Khoảng tham chiếu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedResult.detailedTestItems.map((item, index) => (
                      <tr
                        key={item.id}
                        className={` border border-gray-200
                           hover:bg-gray-100 ${index > 0 ? "" : ""}`}
                      >
                        <td className="p-2 font-medium border-r border-gray-200">
                          {item.itemName}
                        </td>
                        <td className="p-2 border-r border-gray-200">
                          {item.value} {item.unit}
                        </td>
                        <td className="p-2">{item.referenceRange}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {selectedResult.attachmentFile && (
                <a
                  href={selectedResult.attachmentFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 text-blue-600 hover:underline"
                >
                  Xem file đính kèm
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedPrescription && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.6)]"
          onClick={() => setSelectedPrescription(null)}
        >
          <div
            className="bg-white rounded-lg shadow-lg p-6 w-[90vw] max-w-2xl relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPrescription(null)}
              className="absolute top-5 right-5 duration-300
              text-gray-500 hover:text-gray-800 cursor-pointer"
            >
              <FaTimes size={20} />
            </button>
            <h3 className="text-xl font-bold text-green-700 mb-4 border-b border-gray-300 pb-2">
              Chi tiết đơn thuốc
            </h3>
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>Chẩn đoán:</strong> {selectedPrescription.diagnosis}
              </p>
              <p>
                <strong>Ngày kê đơn:</strong>{" "}
                {formatAppointmentDate(selectedPrescription.prescriptionDate)}
              </p>
              <p>
                <strong>Bác sĩ kê đơn:</strong> BS.{" "}
                {selectedPrescription.doctor.fullName || "N/A"}
              </p>
              <div className="p-3 bg-gray-50 rounded-md mt-2">
                <p className="font-semibold">Lời dặn của bác sĩ:</p>
                <p>{selectedPrescription.advice}</p>
              </div>
              <h4 className="font-semibold pt-2">Danh sách thuốc:</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100 border border-gray-200">
                    <tr>
                      <th className="p-2 text-left border-r border-gray-200">
                        Tên thuốc
                      </th>
                      <th className="p-2 text-left border-r border-gray-200">
                        Số lượng
                      </th>
                      <th className="p-2 text-left">Cách dùng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPrescription.prescriptionItems.map(
                      (item, index) => (
                        <tr
                          key={index}
                          className="border border-gray-200 hover:bg-gray-100"
                        >
                          <td className="p-2 font-medium border-r border-gray-200">
                            {item.medicine.name}
                          </td>
                          <td className="p-2 border-r border-gray-200">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="p-2">{item.usageInstructions}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalTab;
