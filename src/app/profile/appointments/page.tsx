"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getAppointmentByDoctorId,
  getAppointmentByPatientId,
  confirmAppointment,
  cancelAppointment,
} from "@/services/AppointmentServices";
import { AxiosError } from "axios";
import {
  translateAppointmentStatus,
  translateAppointmentType,
} from "@/utils/translateEnums";
import {
  formatAppointmentDate,
  getStatusButtonClass,
  Pagination,
} from "@/services/OtherServices";
import Button from "@/components/Button";
import { toast } from "react-toastify";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaCalendarCheck } from "react-icons/fa6";
import InputBar from "@/components/Input";
import { Appointment, ErrorResponse } from "@/types/frontend";

// Fake loading skeleton
const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="py-3 px-2 w-1/8">
      <div className="h-4 bg-gray-200 rounded" />
    </td>
    <td className="py-3 px-2 w-1/8">
      <div className="h-4 bg-gray-200 rounded" />
    </td>
    <td className="py-3 px-2 w-1/8">
      <div className="h-4 bg-gray-200 rounded" />
    </td>
    <td className="py-3 px-2 w-1/8">
      <div className="h-4 bg-gray-200 rounded" />
    </td>
    <td className="py-3 px-2 w-1/8">
      <div className="h-4 bg-gray-200 rounded" />
    </td>
    <td className="py-3 px-2 w-1/8">
      <div className="h-4 bg-gray-200 rounded" />
    </td>
    <td className="py-3 px-2 w-1/8">
      <div className="h-4 bg-gray-200 rounded" />
    </td>
    <td className="py-3 px-2 w-1/8">
      <div className="h-4 bg-gray-200 rounded" />
    </td>
  </tr>
);

const AppointmentsTab = () => {
  const router = useRouter();

  const { user, userRole, appointmentsUpdateTrigger } = useAuth();

  const [appointments, setAppointments] = useState<Appointment[] | null>(null);
  const [loading, setLoading] = useState(true);

  // Sorting
  const [sortField, setSortField] = useState<string>("appointmentDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Filter by Status
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const appointmentsPerPage = 8; // Số lượng lịch hẹn mỗi trang

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [modalDoctorNote, setModalDoctorNote] = useState("");
  const [modalClinicRoom, setModalClinicRoom] = useState("");
  const [modalPatientNote, setModalPatientNote] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  useEffect(() => {
    if (!user) return;
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const commonParams = {
          sortField,
          sortOrder,
          page: currentPage,
          appointmentsPerPage,
          filterStatus, // Thêm tham số filter
        };

        if (userRole === "doctor") {
          const data = await getAppointmentByDoctorId(
            user.profileId,
            commonParams
          );
          setAppointments(data?.data || []);
          setTotalPages(data?.meta?.pages || 1);
        } else if (userRole === "admin" || userRole === "patient") {
          const data = await getAppointmentByPatientId(
            user.profileId,
            commonParams
          );
          setAppointments(data?.data || []);
          console.log("Fetched appointments data:", data);
          setTotalPages(data?.meta?.pages || 1);
        }
      } catch (error) {
        const err = error as AxiosError<ErrorResponse>;
        console.error("❌ Error fetching appointments:", err);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [
    user,
    currentPage,
    appointmentsPerPage,
    userRole,
    sortField,
    sortOrder,
    filterStatus, // Thêm vào dependency array
    appointmentsUpdateTrigger,
  ]);

  const openModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setModalDoctorNote(appointment.doctorNote || "");
    setModalPatientNote(appointment.patientNote || "");
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const handleModalAction = async (
    action: "confirm" | "cancel" | "complete"
  ) => {
    if (!selectedAppointment) return;
    try {
      let newStatus = selectedAppointment.status;

      const fullClinicRoom = "Phòng khám " + modalClinicRoom;

      if (action === "confirm") {
        await confirmAppointment(selectedAppointment.id, {
          clinicRoom: fullClinicRoom,
          doctorNote: modalDoctorNote,
        });
        newStatus = "CONFIRMED";
        toast.success("Xác nhận lịch hẹn thành công!");
      }
      if (action === "cancel") {
        const note = userRole === "doctor" ? modalDoctorNote : modalPatientNote;
        await cancelAppointment(
          selectedAppointment.id,
          note,
          userRole ?? undefined
        );
        newStatus = "CANCELLED";
        toast.success("Đã huỷ lịch hẹn!");
      }
      if (action === "complete") {
        // await completeAppointment(selectedAppointment.id, modalDoctorNote);
        newStatus = "COMPLETED";
        toast.success("Đã hoàn thành lịch hẹn!");
      }
      // Cập nhật lại appointments trong state
      setAppointments((prev) =>
        prev
          ? prev.map((a) =>
              a.id === selectedAppointment.id
                ? {
                    ...a,
                    status: newStatus,
                    doctorNote:
                      userRole === "doctor" ? modalDoctorNote : a.doctorNote,
                    patientNote:
                      userRole === "patient" || userRole === "admin"
                        ? modalPatientNote
                        : a.patientNote,
                    clinicRoom:
                      userRole === "doctor" ? fullClinicRoom : a.clinicRoom,
                  }
                : a
            )
          : prev
      );
      closeModal();
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra!");
    }
  };

  return (
    <div className="p-2 sm:p-4 md:p-8 min-h-screen w-full max-w-none mx-auto">
      <h2 className="text-2xl font-bold flex items-center gap-2 text-blue-700">
        <FaCalendarCheck />
        Lịch hẹn của tôi
      </h2>
      <div className="flex items-center my-5 justify-end gap-4 ">
        {userRole !== "doctor" ? (
          <Link href="/booking">
            <Button size="md" className="rounded-lg">
              Đặt lịch khám mới
            </Button>
          </Link>
        ) : null}
        {/* Thay thế bộ lọc chuyên khoa bằng bộ lọc trạng thái */}
        <select
          className="bg-gray-50 border outline-none cursor-pointer
                      border-gray-300 text-gray-900 text-sm 
                        rounded-lg focus:ring-blue-500
                         focus:border-blue-500 block p-2.5"
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1); // Reset về trang 1 khi thay đổi filter
          }}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="PENDING">Chờ xác nhận</option>
          <option value="CONFIRMED">Đã xác nhận</option>
          <option value="COMPLETED">Đã hoàn thành</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="min-w-[1100px] w-full border rounded-lg">
          <thead className="bg-blue-100 border-b">
            <tr>
              <th className="py-3 px-2 flex justify-center font-semibold text-gray-700 w-20">
                <Button
                  onClick={() => {
                    setSortField("id");
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  }}
                  className={`!bg-transparent !font-semibold
                     !text-gray-700 !text-base  
                     !duration-300 !border-none shadow-none `}
                  translate={false}
                >
                  No
                </Button>
              </th>
              <th className="py-3 px-2 text-center font-semibold text-gray-700">
                {userRole == "doctor" ? "Bệnh nhân" : "Bác sĩ"}
              </th>
              <th className="py-3 px-2 flex justify-center font-semibold text-gray-700">
                <Button
                  onClick={() => {
                    setSortField("appointmentDate, appointmentTime");
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  }}
                  className={`!bg-transparent !font-semibold 
                    !text-gray-700 !text-base 
                    !duration-300 !border-none shadow-none`}
                  translate={false}
                >
                  Thời gian khám
                </Button>
              </th>
              <th className="py-3 px-2 text-center font-semibold text-gray-700">
                Phòng
              </th>
              <th className="py-3 px-2 text-center font-semibold text-gray-700">
                Loại khám
              </th>
              <th className="py-3 px-2 text-center font-semibold text-gray-700">
                Ghi chú bệnh nhân
              </th>
              <th className="py-3 px-2 text-center font-semibold text-gray-700">
                Ghi chú bác sĩ
              </th>
              <th className="py-3 px-2 text-center font-semibold text-gray-700">
                Trạng thái
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
            ) : appointments && appointments.length > 0 ? (
              appointments.map((a) => {
                const isDisabled =
                  a.status === "COMPLETED" ||
                  a.status === "CANCELLED" ||
                  a.status === "CONFIRMED";

                return (
                  <tr
                    key={a.id}
                    className={`hover:bg-blue-50 duration-300
                  text-gray-600 border-b border-b-gray-300
                  ${
                    a.status === "PENDING"
                      ? "bg-gray-50 cursor-not-allowed text-gray-400"
                      : "cursor-pointer hover:bg-blue-50"
                  }
                  `}
                    onClick={() => {
                      if (a.status !== "PENDING") {
                        router.push(`/profile/appointments/${a.id}`);
                      }
                    }}
                  >
                    <td className="py-3 px-2 text-center font-mono text-xs text-gray-500 w-20">
                      {a.id}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {userRole === "doctor"
                        ? a.patient?.fullName
                        : a.doctor?.fullName}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {a.appointmentTime} -{" "}
                      {formatAppointmentDate(a.appointmentDate)}
                    </td>
                    <td className="py-3 px-2 text-center">{a.clinicRoom}</td>
                    <td className="py-3 px-2 text-center">
                      {translateAppointmentType(a.appointmentType)}
                    </td>
                    <td
                      className="py-3 px-2 text-center text-gray-600 max-w-[180px] truncate"
                      title={a.patientNote || ""}
                    >
                      {a.patientNote}
                    </td>
                    <td
                      className="py-3 px-2 text-center text-gray-600 max-w-[180px] truncate"
                      title={a.doctorNote || ""}
                    >
                      {a.doctorNote}
                    </td>
                    <td className="py-3 px-2 text-center font-semibold ">
                      <Button
                        className={`px-3 py-1 rounded transition ${getStatusButtonClass(
                          a.status
                        )} disabled:cursor-not-allowed cursor-pointer`}
                        onClick={() => openModal(a)}
                        disabled={isDisabled}
                        translate={!isDisabled}
                      >
                        {translateAppointmentStatus(a.status) || "-"}
                      </Button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-400">
                  Không có lịch hẹn nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      )}

      {/* Modal for updating appointment status */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.6)]"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg shadow-lg p-6 w-[90vw] max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 cursor-pointer text-gray-400 hover:text-gray-600 text-xl"
              onClick={closeModal}
            >
              ×
            </button>
            <h3 className="text-lg font-semibold mb-3 text-center text-gray-700">
              Cập nhật trạng thái lịch hẹn
            </h3>
            {userRole === "doctor" ? (
              <div className="space-y-8">
                {" "}
                {/* Bọc trong div để dễ quản lý khoảng cách */}
                {/* Thêm Input cho Số phòng */}
                <div>
                  <InputBar
                    type="text"
                    label="Phòng khám"
                    required
                    placeholder="Nhập số phòng (VD: 101, 205...)"
                    value={modalClinicRoom} // << Giả sử bạn có state này
                    onChange={(e) => setModalClinicRoom(e.target.value)} // << Giả sử bạn có hàm set state này
                  />
                </div>
                {/* Textarea cho Ghi chú bác sĩ */}
                <div>
                  <InputBar
                    type="textarea"
                    label="Ghi chú bác sĩ"
                    placeholder="Nhập ghi chú (nếu có)"
                    value={modalDoctorNote}
                    onChange={(e) => setModalDoctorNote(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            ) : (
              <InputBar
                type="textarea"
                label="Ghi chú bệnh nhân"
                placeholder="Nhập ghi chú bệnh nhân"
                value={modalPatientNote}
                onChange={(e) => setModalPatientNote(e.target.value)}
              />
            )}
            <div className="flex justify-center gap-2 mt-4">
              {userRole === "doctor" && selectedAppointment ? (
                <>
                  {selectedAppointment.status === "PENDING" && (
                    <>
                      <Button
                        variant="green"
                        onClick={() => handleModalAction("confirm")}
                        translate={false}
                      >
                        Chấp nhận
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleModalAction("cancel")}
                        translate={false}
                      >
                        Hủy lịch
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <>
                  {selectedAppointment?.status === "PENDING" && (
                    <Button
                      variant="danger"
                      onClick={() => handleModalAction("cancel")}
                      translate={false}
                    >
                      Hủy lịch
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsTab;
