// Định nghĩa các loại xét nghiệm
export const testTypeMap: Record<string, string> = {
  HEMATOLOGY_BLOOD_CHEMISTRY: "Xét nghiệm Huyết học - Sinh hóa máu",
  URINALYSIS: "Xét nghiệm Nước tiểu",
  STOOL_TEST: "Xét nghiệm Phân",
  IMAGING_RADIOLOGY: "Chẩn đoán Hình ảnh X-Quang",
  PATHOLOGY_BIOPSY: "Giải phẫu bệnh - Sinh thiết",
  FUNCTIONAL_TEST: "Xét nghiệm Chức năng",
  MICROBIOLOGY: "Vi sinh vật học",
};

export const testTypeOptions = Object.entries(testTypeMap).map(
  ([value, label]) => ({
    label,
    value,
  })
);

export const appointmentTypeMap: Record<string, string> = {
  KHAM_TONG_QUAT: "Khám tổng quát",
  KHAM_CHUYEN_KHOA: "Khám chuyên khoa",
  TAI_KHAM: "Tái khám",
  TIEM_CHUNG: "Tiêm chủng",
  KHAM_SUC_KHOE_DINH_KY: "Khám sức khỏe định kỳ",
};

export const appointmentTypeOptions = Object.entries(appointmentTypeMap).map(
  ([value, label]) => ({
    label,
    value,
  })
);

export const appointmentStatusMap: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  CANCELLED: "Đã hủy",
  COMPLETED: "Hoàn thành",
};

export const appointmentStatusOptions = Object.entries(
  appointmentStatusMap
).map(([value, label]) => ({
  label,
  value,
}));

export const testResultStatusMap: Record<string, string> = {
  REQUESTED: "Yêu cầu đã được gửi", // Yêu cầu đã được gửi
  IN_PROGRESS: "Đang tiến hành", // Đang tiến hành
  PRELIMINARY: "Kết quả sơ bộ", // Kết quả sơ bộ
  COMPLETED: "Kết quả hoàn thành", // Kết quả hoàn thành
  REVIEWED: "Đã xem xét", // Đã xem xét
  CANCELLED: "Đã hủy", // Đã hủy
};

export const testResultStatusOptions = Object.entries(testResultStatusMap).map(
  ([value, label]) => ({
    label,
    value,
  })
);

export const specializationsMap: Record<string, string> = {
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
  RADIOLOGY: "X-quang",
  UROLOGY: "Tiết niệu",
};

export const specialtyOptions = Object.entries(specializationsMap).map(
  ([value, label]) => ({
    label,
    value,
  })
);

export const genderOptions = [
  // { label: "Chọn giới tính", value: "" },
  { label: "Nam", value: "MALE" },
  { label: "Nữ", value: "FEMALE" },
  { label: "Khác", value: "OTHER" },
];

export const bloodTypeOptions = [
  // { label: "Chọn nhóm máu", value: "" },
  { label: "A+", value: "A_POSITIVE" },
  { label: "A-", value: "A_NEGATIVE" },
  { label: "B+", value: "B_POSITIVE" },
  { label: "B-", value: "B_NEGATIVE" },
  { label: "AB+", value: "AB_POSITIVE" },
  { label: "AB-", value: "AB_NEGATIVE" },
  { label: "O+", value: "O_POSITIVE" },
  { label: "O-", value: "O_NEGATIVE" },
];

export const departmentOptions = [
  { label: "Phòng IT / Kỹ thuật", value: "IT_SUPPORT" },
  { label: "Phòng Nhân sự", value: "HR" },
  { label: "Phòng Kế toán", value: "ACCOUNTING" },
  { label: "Phòng Hành chính", value: "ADMINISTRATION" },
  { label: "Ban Giám đốc", value: "BOARD_OF_DIRECTORS" },
];

export const daysOfWeekOptions = [
  { value: "MONDAY", label: "Thứ Hai" },
  { value: "TUESDAY", label: "Thứ Ba" },
  { value: "WEDNESDAY", label: "Thứ Tư" },
  { value: "THURSDAY", label: "Thứ Năm" },
  { value: "FRIDAY", label: "Thứ Sáu" },
  { value: "SATURDAY", label: "Thứ Bảy" },
  { value: "SUNDAY", label: "Chủ Nhật" },
];
