import { translateTestResultStatus } from "@/utils/translateEnums";
import { Prescription } from "./PrescriptionServices";
import { TestResultStatus } from "@/types/frontend";

// Pagination component
const Pagination = ({
  totalPages,
  currentPage,
  setCurrentPage,
}: {
  totalPages: number;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}) => {
  if (totalPages <= 1) return null;

  // Tính toán dải trang hiển thị tối đa 4 số, có ... nếu cần
  let pages: (number | string)[] = [];
  if (totalPages <= 4) {
    pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else if (currentPage <= 2) {
    pages = [1, 2, 3, 4, "...", totalPages];
  } else if (currentPage >= totalPages - 1) {
    pages = [
      1,
      "...",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  } else {
    pages = [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  }

  return (
    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
      <div className="flex-1" />
      <nav className="flex space-x-1 justify-end">
        <button
          onClick={() => {
            setCurrentPage((prev) => Math.max(prev - 1, 1));
            // window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded ${
            currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
          }`}
        >
          Trước
        </button>
        {pages.map((p, idx) =>
          p === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              className="px-2 text-gray-400 select-none"
            >
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => {
                setCurrentPage(Number(p));
                // window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`px-3 py-1 rounded cursor-pointer ${
                currentPage === p
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => {
            setCurrentPage((prev) => Math.min(prev + 1, totalPages));
            // window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded ${
            currentPage === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
          }`}
        >
          Sau
        </button>
      </nav>
    </div>
  );
};

const formatDateToDMY = (dateStr: string) => {
  if (!dateStr) return "";
  const [yyyy, mm, dd] = dateStr.split("-");
  return `${dd}/${mm}/${yyyy}`;
};

// Format ngày giờ lịch hẹn: HH:mm - dd/MM/yyyy
const formatAppointmentDate = (dateStr: string) => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

const formatAppointmentDateTime = (dateStr: string): string => {
  const d = new Date(dateStr);

  // Giữ nguyên logic kiểm tra date hợp lệ của bạn
  if (isNaN(d.getTime())) {
    console.error("Invalid date string provided:", dateStr);
    return dateStr;
  }

  // Hàm pad (lấy từ code của bạn)
  const pad = (n: number): string => n.toString().padStart(2, "0");

  // Lấy các thành phần
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1); // getMonth() trả về 0-11
  const year = d.getFullYear();

  // Format: 14:00 - 04/10/2025
  return `${hours}:${minutes} - ${day}/${month}/${year}`;
};

const formatTime = (timeStr: string): string => {
  if (!timeStr || typeof timeStr !== "string") {
    return "";
  }
  // Chỉ lấy 5 ký tự đầu tiên (HH:mm)
  return timeStr.slice(0, 5);
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const getStatusButtonClass = (status: string) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 w-full !text-yellow-700 hover:bg-yellow-200";
    case "CONFIRMED":
      return "bg-green-100 w-full !text-green-700 hover:bg-green-200";
    case "CANCELLED":
      return "bg-red-100 w-full !text-red-700 hover:bg-red-200";
    case "COMPLETED":
      return "bg-blue-100 w-full !text-white hover:bg-blue-200";
    case "REQUESTED":
      return "bg-indigo-100 w-full !text-indigo-700 hover:bg-indigo-200";
    case "IN_PROGRESS":
      return "bg-purple-100 w-full !text-purple-700 hover:bg-purple-200";
    case "PRELIMINARY":
      return "bg-teal-100 w-full !text-teal-700 hover:bg-teal-200";
    case "REVIEWED":
      return "bg-gray-100 w-full !text-gray-700 hover:bg-gray-200";
    default:
      return "bg-gray-100 w-full !text-gray-700 hover:bg-gray-200";
  }
};

const TestResultStatusBadge = ({ status }: { status: TestResultStatus }) => {
  // Định nghĩa màu sắc cho từng trạng thái
  const statusStyles: Record<TestResultStatus, string> = {
    REQUESTED: "bg-yellow-200 text-gray-600 border-yellow-200",
    IN_PROGRESS: "bg-blue-200 text-gray-700 border-blue-300",
    PRELIMINARY: "bg-purple-100 text-gray-700 border-purple-200",
    COMPLETED: "bg-green-500 text-white border-green-200",
    REVIEWED: "bg-indigo-500 text-white border-indigo-200",
    CANCELLED: "bg-red-200 text-red-800 border-red-200",
  };

  const style =
    statusStyles[status] || "bg-gray-100 text-gray-800 border-gray-200";

  return (
    <span
      className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-br-lg rounded-tl-lg border ${style}`}
    >
      {translateTestResultStatus(status) || status}
    </span>
  );
};

// Hàm khởi tạo giá trị thời gian mặc định là GMT+7
const getInitialGmt7Time = () => {
  // 1. Lấy thời gian hiện tại
  const now = new Date();

  // 2. Tính toán thời gian tại GMT+7
  // now.getTime() là mili giây tại UTC, ta chỉ cần cộng thêm 7 giờ
  const gmt7Time = new Date(now.getTime() + 7 * 60 * 60 * 1000);

  // 3. Định dạng lại thành chuỗi YYYY-MM-DDTHH:mm
  // toISOString() sẽ chuyển thời gian về định dạng chuẩn UTC.
  // Vì đối tượng `gmt7Time` đã chứa đúng giá trị thời gian của GMT+7,
  // nên khi định dạng, chuỗi kết quả sẽ chính xác.
  return gmt7Time.toISOString().slice(0, 16);
};

const formatTotalCost = (prescriptions: Prescription[]): string => {
  // 1. Tính tổng chi phí từ mảng prescriptions
  const totalCost = prescriptions.reduce(
    (total, prescription) => total + (prescription.totalCost || 0),
    0
  );

  // 2. Định dạng số tiền sang kiểu tiền tệ Việt Nam
  const formattedCost = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(totalCost);

  // 3. Trả về chuỗi đã định dạng
  return formattedCost;
};

export {
  Pagination,
  formatDateToDMY,
  formatAppointmentDate,
  formatAppointmentDateTime,
  scrollToTop,
  getStatusButtonClass,
  getInitialGmt7Time,
  formatTotalCost,
  TestResultStatusBadge,
  formatTime,
};
