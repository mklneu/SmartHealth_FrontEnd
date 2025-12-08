"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";
import { getAllHospitals, Hospital } from "@/services/HospitalServices";
import Button from "@/components/Button";
import InputBar from "@/components/Input";
import { AxiosError } from "axios";
import { ErrorResponse } from "@/types/frontend";
import {
  getSpecialtiesByHospitalId,
  Specialty,
} from "@/services/SpecialtyServices";
import {
  DoctorTimeSlotGroup, // <--- Import kiểu dữ liệu mới
  getAvailableDates,
  getAvailableTimeSlots,
} from "@/services/ScheduleServices";
import { translateSpecialty } from "@/utils/translateEnums";
import { bookAppointment } from "@/services/AppointmentServices";

// const appointmentTypes = [
//   { value: "KHAM_TONG_QUAT", label: "Khám tổng quát" },
//   { value: "KHAM_CHUYEN_KHOA", label: "Khám chuyên khoa" },
//   { value: "TAI_KHAM", label: "Tái khám" },
// ];

export default function BookingPage() {
  const router = useRouter();
  const { isLoggedIn, userRole, userId, patientProfile } = useAuth();

  // States for the new booking flow
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>("");

  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(false);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string>("");

  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const [availableTimeSlots, setAvailableTimeSlots] = useState<
    DoctorTimeSlotGroup[]
  >([]); // <--- Sửa kiểu dữ liệu của state
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<number | null>(
    null
  );

  // States for the form data
  const [patientNote, setPatientNote] = useState("");
  // const [appointmentType, setAppointmentType] = useState("KHAM_CHUYEN_KHOA");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Khi `user` không còn là null (tức là đã tải xong), cuộn lên đầu.
    if (patientProfile) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [patientProfile]); // Phụ thuộc vào `user`

  // --- Authorization Effect ---
  useEffect(() => {
    if (
      userRole !== null &&
      (!isLoggedIn || (userRole !== "admin" && userRole !== "patient"))
    ) {
      toast.error("Bạn không có quyền truy cập trang này.");
      router.replace("/");
    }
  }, [isLoggedIn, userRole, router]);

  // --- Data Fetching Effects ---

  // 1. Fetch hospitals on component mount
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await getAllHospitals({ size: 1000 });
        setHospitals(res.data);
      } catch {
        toast.error("Không thể tải danh sách bệnh viện.");
      }
    };
    fetchHospitals();
  }, []);

  // 2. Fetch specialties when a hospital is selected
  useEffect(() => {
    // Reset subsequent selections
    setSpecialties([]);
    setSelectedSpecialtyId("");
    setAvailableDates([]);
    setSelectedDate("");
    setAvailableTimeSlots([]);
    setSelectedTimeSlotId(null);

    if (selectedHospitalId) {
      const fetchSpecialties = async () => {
        setLoadingSpecialties(true);
        try {
          const res = await getSpecialtiesByHospitalId(selectedHospitalId);
          setSpecialties(res);
        } catch {
          // Error is handled in the service
        } finally {
          setLoadingSpecialties(false);
        }
      };
      fetchSpecialties();
    }
  }, [selectedHospitalId]);

  // 3. Fetch available dates when a specialty is selected
  useEffect(() => {
    setAvailableDates([]);
    setSelectedDate("");
    setAvailableTimeSlots([]);
    setSelectedTimeSlotId(null);
    // console.log("user:", user);

    if (selectedHospitalId && selectedSpecialtyId) {
      const fetchDates = async () => {
        setLoadingDates(true);
        try {
          const res = await getAvailableDates(
            selectedHospitalId,
            selectedSpecialtyId
          );
          setAvailableDates(res);
        } catch {
          // Error is handled in the service
        } finally {
          setLoadingDates(false);
        }
      };
      fetchDates();
    }
  }, [selectedHospitalId, selectedSpecialtyId]);

  // 4. Fetch available time slots when a date is selected
  useEffect(() => {
    setAvailableTimeSlots([]);
    setSelectedTimeSlotId(null);

    if (selectedHospitalId && selectedSpecialtyId && selectedDate) {
      const fetchTimeSlots = async () => {
        setLoadingTimeSlots(true);
        try {
          const res = await getAvailableTimeSlots(
            selectedHospitalId,
            selectedSpecialtyId,
            selectedDate
          );
          setAvailableTimeSlots(res);
        } catch {
          // Error is handled in the service
        } finally {
          setLoadingTimeSlots(false);
        }
      };
      fetchTimeSlots();
    }
  }, [selectedHospitalId, selectedSpecialtyId, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientProfile || !selectedTimeSlotId) {
      toast.error(
        "Vui lòng chọn đầy đủ thông tin bệnh viện, chuyên khoa, ngày và giờ khám."
      );
      return;
    }

    setLoading(true);
    try {
      const body = {
        appointmentId: selectedTimeSlotId,
        patientId: patientProfile.profileId,
        patientNote: patientNote,
      };

      const res = await bookAppointment(body);
      toast.success(res.message || "Đặt lịch thành công!");
      router.push("/profile/appointments");
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      console.log("❌ Error in booking appointment:", err.response?.data);
      toast.error(
        err.response?.data?.error ||
          "Suất khám này đã được đặt hoặc không còn trống. Vui lòng chọn suất khám khác."
      );
    } finally {
      setLoading(false);
    }
  };

  // Sửa ở đây: Chặn render cho đến khi có đầy đủ thông tin user
  if (userRole === null || isLoggedIn === null || userId === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-600">
            Đang tải thông tin người dùng...
          </p>
          <p className="text-sm text-gray-500">Vui lòng chờ trong giây lát.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen p-4 sm:p-8 flex justify-center">
      <div className="max-w-4xl w-full mx-auto h-fit bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
        <h1 className="text-3xl font-bold mb-8 text-blue-700">
          Đặt lịch hẹn khám bệnh
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* --- Step 1: Hospital and Patient --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold mb-2 text-gray-700">
                Bệnh nhân
              </label>
              <InputBar
                type="text"
                value={patientProfile?.fullName || ""}
                disabled
              />
            </div>
            <div>
              <label
                htmlFor="hospital"
                className="block font-semibold mb-2 text-gray-700"
              >
                Chọn Bệnh viện <span className="text-red-500">*</span>
              </label>
              <InputBar
                type="select"
                value={selectedHospitalId}
                onChange={(e) => setSelectedHospitalId(e.target.value)}
                options={hospitals.map((h) => ({
                  label: h.name,
                  value: h.id.toString(),
                }))}
                placeholder="-- Chọn bệnh viện --"
              />
            </div>
          </div>

          {/* --- Step 2: Specialty (Conditional) --- */}
          {selectedHospitalId && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <label
                htmlFor="specialty"
                className="block font-semibold mb-2 text-gray-700"
              >
                Chọn Chuyên khoa <span className="text-red-500">*</span>
              </label>
              <InputBar
                type="select"
                value={selectedSpecialtyId}
                onChange={(e) => setSelectedSpecialtyId(e.target.value)}
                disabled={loadingSpecialties || specialties.length === 0}
                options={specialties.map((s) => ({
                  label: translateSpecialty(s.specialtyName),
                  value: s.id.toString(),
                }))}
                placeholder={
                  loadingSpecialties
                    ? "Đang tải chuyên khoa..."
                    : specialties.length > 0
                    ? "-- Chọn chuyên khoa --"
                    : "Bệnh viện chưa có chuyên khoa"
                }
              />
            </div>
          )}

          {/* --- Step 3: Date (Conditional) --- */}
          {selectedSpecialtyId && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <label className="block font-semibold mb-2 text-gray-700">
                Chọn Ngày khám <span className="text-red-500">*</span>
              </label>
              {loadingDates ? (
                <p className="text-gray-500">Đang tìm ngày khám...</p>
              ) : availableDates.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {availableDates.map((date) => (
                    <Button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`${
                        selectedDate === date
                          ? "bg-blue-600 text-white border-blue-600"
                          : ""
                      }`}
                    >
                      {new Date(date).toLocaleDateString("vi-VN", {
                        weekday: "short",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">
                  Không có lịch khám cho chuyên khoa này.
                </p>
              )}
            </div>
          )}

          {/* --- Step 4: Time Slot (Conditional) --- */}
          {selectedDate && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <label className="block font-semibold mb-2 text-gray-700">
                Chọn Giờ khám <span className="text-red-500">*</span>
              </label>
              {loadingTimeSlots ? (
                <p className="text-gray-500">Đang tìm khung giờ trống...</p>
              ) : availableTimeSlots.length > 0 ? (
                <div className="space-y-4">
                  {/* Lặp qua từng nhóm bác sĩ */}
                  {availableTimeSlots.map((doctorGroup) => (
                    <div key={doctorGroup.doctorId}>
                      {/* <h4 className="font-semibold text-gray-800 mb-2">
                        {doctorGroup.groupName}
                      </h4> */}
                      {/* Hiển thị các khung giờ của bác sĩ đó */}
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                        {doctorGroup.timeSlots.map((slot) => (
                          <Button
                            key={slot.appointmentId}
                            onClick={() =>
                              setSelectedTimeSlotId(slot.appointmentId)
                            }
                            className={`${
                              selectedTimeSlotId === slot.appointmentId
                                ? "bg-blue-600 text-white border-blue-600"
                                : ""
                            }`}
                          >
                            {slot.time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">
                  Đã hết khung giờ khám trong ngày này.
                </p>
              )}
            </div>
          )}

          {/* --- Additional Info --- */}
          {selectedTimeSlotId && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* <div>
                <label className="block font-semibold mb-2 text-gray-700">
                  Loại hình khám
                </label>
                <InputBar
                  type="select"
                  value={appointmentType}
                  onChange={(e) => setAppointmentType(e.target.value)}
                  options={appointmentTypes}
                />
              </div> */}
              <div className="md:col-span-2">
                <label className="block font-semibold mb-2 text-gray-700">
                  Triệu chứng hoặc lý do khám
                </label>
                <InputBar
                  type="textarea"
                  value={patientNote}
                  onChange={(e) => setPatientNote(e.target.value)}
                  rows={3}
                  placeholder="Vui lòng mô tả ngắn gọn tình trạng của bạn (ví dụ: ho, sốt, đau đầu...)"
                />
              </div>
            </div>
          )}

          {/* --- Submit Button --- */}
          <div className="pt-4">
            <Button
              isLoading={loading}
              className="w-full"
              size="lg"
              disabled={!selectedTimeSlotId || loading}
              type="submit"
            >
              Xác nhận đặt lịch
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
