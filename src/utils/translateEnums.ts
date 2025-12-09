import { Gender } from "@/types/frontend";

export const translateAppointmentStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    PENDING: "Chờ xác nhận",
    CONFIRMED: "Đã xác nhận",
    CANCELLED: "Đã hủy",
    COMPLETED: "Hoàn thành",
  };
  return statusMap[status] || status;
};
export const translateTestResultStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    REQUESTED: "Yêu cầu đã được gửi",
    IN_PROGRESS: "Đang tiến hành",
    PRELIMINARY: "Kết quả sơ bộ",
    COMPLETED: "Kết quả hoàn thành",
    REVIEWED: "Đã xem xét",
    CANCELLED: "Đã hủy",
  };
  return statusMap[status] || status;
};
export const translateAppointmentType = (type: string): string => {
  const typeMap: Record<string, string> = {
    KHAM_TONG_QUAT: "Khám tổng quát",
    KHAM_CHUYEN_KHOA: "Khám chuyên khoa",
    TAI_KHAM: "Tái khám",
    TIEM_CHUNG: "Tiêm chủng",
    KHAM_SUC_KHOE_DINH_KY: "Khám sức khỏe định kỳ",
  };
  return typeMap[type] || type;
};
export const translateSpecialty = (specialty: string): string => {
  const specialtyMap: Record<string, string> = {
    CARDIOLOGY: "Tim mạch",
    DERMATOLOGY: "Da liễu",
    ENDOCRINOLOGY: "Nội tiết",
    GASTROENTEROLOGY: "Tiêu hóa",
    GENERAL_PRACTICE: "Đa khoa",
    HEMATOLOGY: "Huyết học",
    NEUROLOGY: "Thần kinh",
    OBSTETRICS_GYNECOLOGY: "Sản phụ khoa",
    ONCOLOGY: "Ung thư học",
    OPHTHALMOLOGY: "Nhãn khoa",
    ORTHOPEDICS: "Chỉnh hình",
    OTOLARYNGOLOGY: "Tai mũi họng",
    PEDIATRICS: "Nhi khoa",
    PSYCHIATRY: "Tâm thần học",
    PULMONOLOGY: "Phổi",
    RADIOLOGY: "X quang",
    UROLOGY: "Tiết niệu",
  };

  return specialtyMap[specialty] || specialty;
};

export const translateGender = (gender: Gender): string => {
  const genderMap: Record<string, string> = {
    MALE: "Nam",
    FEMALE: "Nữ",
    OTHER: "Khác",
  };

  return genderMap[gender] || gender;
};

export const translateStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    ACTIVE: "Đang hoạt động",
    INACTIVE: "Tạm ngưng",
  };

  return statusMap[status] || status;
};

export const translateTestType = (testType: string): string => {
  const translations: { [key: string]: string } = {
    HEMATOLOGY_BLOOD_CHEMISTRY: "Xét nghiệm Huyết học - Sinh hóa máu",
    URINALYSIS: "Xét nghiệm Nước tiểu",
    STOOL_TEST: "Xét nghiệm Phân",
    IMAGING_RADIOLOGY: "Chẩn đoán Hình ảnh X-Quang",
    PATHOLOGY_BIOPSY: "Giải phẫu bệnh - Sinh thiết",
    FUNCTIONAL_TEST: "Xét nghiệm Chức năng",
    MICROBIOLOGY: "Vi sinh vật học",
  };
  return translations[testType] || testType.replace(/_/g, " ");
};

export const translateRole = (role: string): string => {
  const roleMap: Record<string, string> = {
    ADMIN: "Quản trị viên",
    DOCTOR: "Bác sĩ",
    NURSE: "Y tá",
    STAFF: "Nhân viên",
    PATIENT: "Bệnh nhân",
  };

  return roleMap[role] || role;
};

export const translateBloodType = (bloodType: string): string => {
  const bloodTypeMap: Record<string, string> = {
    A_POSITIVE: "A+",
    A_NEGATIVE: "A-",
    B_POSITIVE: "B+",
    B_NEGATIVE: "B-",
    AB_POSITIVE: "AB+",
    AB_NEGATIVE: "AB-",
    O_POSITIVE: "O+",
    O_NEGATIVE: "O-",
  };
  return bloodTypeMap[bloodType] || bloodType;
};

export const translateDepartment = (department: string): string => {
  const departmentMap: Record<string, string> = {
    IT_SUPPORT: "Phòng IT / Kỹ thuật",
    ACCOUNTING: "Phòng Kế toán",
    ADMINISTRATION: "Phòng Hành chính",
    HR: "Phòng Nhân sự",
    BOARD_OF_DIRECTORS: "Ban Giám đốc",
  };
  return departmentMap[department] || department;
};

export const translateDayOfWeek = (day: string): string => {
  const dayMap: Record<string, string> = {
    MONDAY: "Thứ Hai",
    TUESDAY: "Thứ Ba",
    WEDNESDAY: "Thứ Tư",
    THURSDAY: "Thứ Năm",
    FRIDAY: "Thứ Sáu",
    SATURDAY: "Thứ Bảy",
    SUNDAY: "Chủ Nhật",
  };
  return dayMap[day] || day;
};
