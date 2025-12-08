import { toast } from "react-toastify";
import axiosInstance from "./axiosInstance";
import { AxiosError } from "axios";
import { ErrorResponse, Gender, PaginatedResponse } from "@/types/frontend";

export interface DoctorProfile {
  profileId: number;
  userId: number;
  username: string;
  email: string;
  address: string;
  fullName: string;
  dob: string;
  gender: Gender;
  phoneNumber: string;
  experienceYears: number;
  licenseNumber: string;
  degree: string;
  hospital: {
    id: number;
    name: string;
  };
  specialty: {
    id: number;
    specialtyName: string;
    description: string;
  };
  createdAt: string;
  updatedAt: string | null;
}

export interface ReqCreateDoctor {
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
  fullName: string;
  dob: string;
  gender: Gender;
  address: string;
  hospitalId: number;
  specialtyId: number;
  licenseNumber: string;
  experienceYears: number;
  degree: string;
}

export interface ReqUpdateDoctor {
  phoneNumber: string;
  fullName: string;
  dob: string;
  gender: Gender;
  address: string;
  licenseNumber: string;
  experienceYears: number;
  degree: string;
  hospitalId: number | string;
  specialtyId: number | string;
}

interface DoctorQueryParams {
  page: number;
  size: number;
  sort?: string;
  search?: string;
  filterSpecialization?: string;
  filterStatus?: string;
}

// THÊM: Interface cho request tạo lịch định kỳ
export interface RecurringScheduleRequest {
  profileId: number;
  daysOfWeek: string[];
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  price: number;
  startDate: string;
  endDate: string;
}

export interface RecurringScheduleResponse {
  id: number;
  doctor: { id: number; name: string };
  specialty: { id: number; specialtyName: string; description: string };
  daysOfWeek: string[];
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  price: number;
  startDate: string;
  endDate: string;
}

// Lấy tất cả bác sĩ
const getAllDoctors = async (
  params: DoctorQueryParams
): Promise<PaginatedResponse<DoctorProfile>> => {
  try {
    // 2. Chuẩn bị các tham số cơ bản
    const apiParams: Record<string, string | number> = {
      page: params.page, // Chuyển page 1-based sang 0-based
      size: params.size,
    };

    if (params.sort) {
      apiParams.sort = params.sort;
    }

    // 3. Xây dựng mảng các điều kiện lọc (filter)
    const filterParts: string[] = [];

    // 4. Thêm logic lọc cho 'searchTerm' (với cú pháp OR)
    if (params.search && params.search.trim() !== "") {
      const safeSearchTerm = params.search.trim().replace(/'/g, "''");
      // Dùng logic OR từ code cũ của bạn
      filterParts.push(
        `(user.phoneNumber~'${safeSearchTerm}' or user.email~'${safeSearchTerm}' or fullName~'${safeSearchTerm}' or user.username~'${safeSearchTerm}')`
      );
    }

    // 5. Thêm logic lọc cho 'filterSpecialization'
    if (params.filterSpecialization && params.filterSpecialization !== "ALL") {
      // Giả sử tên trường là 'specialization' và dùng toán tử '==' (hoặc '~' nếu bạn muốn)
      filterParts.push(
        `specialty.specialtyName:'${params.filterSpecialization}'`
      );
    }

    // 6. Thêm logic lọc cho 'filterStatus'
    if (params.filterStatus && params.filterStatus !== "ALL") {
      filterParts.push(`status~'${params.filterStatus}'`);
    }

    // 7. Nối tất cả các điều kiện lọc lại bằng ' and '
    if (filterParts.length > 0) {
      apiParams.filter = filterParts.join(" and ");
    }

    // 8. Gửi request
    // URL cuối cùng sẽ có dạng: /doctors?page=0&size=10&filter=(...) and (...)
    const response = await axiosInstance.get("/doctors", {
      params: apiParams,
    });

    // 9. Trả về toàn bộ DTO phân trang (giả sử nằm trong response.data.data)
    return response.data.data;
  } catch (error) {
    // 10. Xử lý lỗi
    const err = error as AxiosError<ErrorResponse>;
    console.error("❌ Error in getAllDoctors:", err);

    if (err.response?.data?.message) {
      toast.error(err.response.data.message);
    } else {
      toast.error("❌ Không thể lấy danh sách bác sĩ!");
    }

    // Trả về một cấu trúc rỗng để tránh lỗi crash component
    return {
      meta: { page: 1, pageSize: params.size, pages: 0, total: 0 },
      data: [],
    };
  }
};

// Lấy thông tin bác sĩ theo ID
const getDoctorById = async (doctorId: number) => {
  try {
    const response = await axiosInstance.get(`/doctors/${doctorId}`);
    return response.data.data;
  } catch (error) {
    const err = error as AxiosError<ErrorResponse>;
    console.error("❌ Error in getDoctorById:", err);

    if (err.response?.data?.message) {
      toast.error(err.response.data.message);
    } else {
      toast.error(`❌ Không thể lấy thông tin bác sĩ ID: ${doctorId}!`);
    }
    throw err;
  }
};

const getDoctorsByHospitalId = async (hospitalId: string) => {
  try {
    const response = await axiosInstance.get(`/doctors/company/${hospitalId}`);
    return response.data.data;
  } catch (error) {
    const err = error as AxiosError<ErrorResponse>;
    console.error("❌ Error in getDoctorById:", err);

    if (err.response?.data?.message) {
      toast.error(err.response.data.message);
    } else {
      toast.error(
        `❌ Không thể lấy thông tin bác sĩ của bệnh viện ID: ${hospitalId}!`
      );
    }
    throw err;
  }
};

// Tạo bác sĩ mới
const createDoctor = async (doctorData: ReqCreateDoctor) => {
  try {
    const response = await axiosInstance.post("/doctors", doctorData);
    toast.success("Thêm bác sĩ thành công!");
    return response.data.data;
  } catch (error) {
    const err = error as AxiosError<ErrorResponse>;
    console.error("❌ Error in createDoctor:", err);

    if (err.response?.data?.message) {
      toast.error(err.response.data.message);
    } else {
      toast.error("❌ Lỗi khi thêm bác sĩ!");
    }
    throw err;
  }
};

// Cập nhật thông tin bác sĩ
const updateDoctor = async (
  doctorId: number,
  doctorData: Partial<Omit<DoctorProfile, "id">>
) => {
  try {
    const response = await axiosInstance.put(
      `/doctors/${doctorId}`,
      doctorData
    );
    return response.data.data;
  } catch (error) {
    const err = error as AxiosError<ErrorResponse>;
    console.error("❌ Error in updateDoctor:", err);

    if (err.response?.data?.message) {
      toast.error(err.response.data.message);
    } else {
      toast.error("❌ Lỗi khi cập nhật thông tin bác sĩ!");
    }
    throw err;
  }
};

// Xóa bác sĩ
const deleteDoctor = async (doctorId: number) => {
  try {
    await axiosInstance.delete(`/doctors/${doctorId}`);
    toast.success("Xóa bác sĩ thành công!");
    return true;
  } catch (error) {
    const err = error as AxiosError<ErrorResponse>;
    console.error("❌ Error in deleteDoctor:", err);

    if (err.response?.data?.message) {
      toast.error(err.response.data.message);
    } else {
      toast.error("❌ Lỗi khi xóa bác sĩ!");
    }
    throw err;
  }
};

// Cập nhật trạng thái bác sĩ (kích hoạt/vô hiệu hóa)
const updateDoctorStatus = async (
  doctorId: number,
  status: "ACTIVE" | "INACTIVE"
) => {
  try {
    const response = await axiosInstance.patch(`/doctors/${doctorId}/status`, {
      status,
    });
    toast.success(
      `✅ Đã ${
        status === "ACTIVE" ? "kích hoạt" : "vô hiệu hóa"
      } tài khoản bác sĩ!`
    );
    return response.data.data;
  } catch (error) {
    const err = error as AxiosError<ErrorResponse>;
    console.error("❌ Error in updateDoctorStatus:", err);

    if (err.response?.data?.message) {
      toast.error(err.response.data.message);
    } else {
      toast.error("❌ Lỗi khi cập nhật trạng thái bác sĩ!");
    }
    throw err;
  }
};

// Helper để xóa bác sĩ và cập nhật giao diện
const deleteDoctorById = async (doctorId: number, callback: () => void) => {
  try {
    await deleteDoctor(doctorId);
    callback();
  } catch (error) {
    const err = error as AxiosError<ErrorResponse>;
    console.error("❌ Error in deleteDoctorById:", err);
  }
};

// THÊM: Hàm tạo lịch làm việc định kỳ cho bác sĩ
export const createRecurringSchedule = async (
  body: RecurringScheduleRequest
): Promise<RecurringScheduleResponse> => {
  try {
    const response = await axiosInstance.post("/recurring-schedules", body);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo lịch làm việc định kỳ:", error);
    throw error;
  }
};

// THÊM: Hàm cập nhật lịch làm việc định kỳ
export const updateRecurringScheduleByDoctorId = async (
  body: Partial<RecurringScheduleRequest>
): Promise<RecurringScheduleResponse> => {
  try {
    // Giả sử API của bạn dùng phương thức PUT
    const response = await axiosInstance.put(
      `/recurring-schedules/doctor`,
      body
    );
    console.log("Response from updateRecurringScheduleByDoctorId:", response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật lịch làm việc định kỳ:", error);
    throw error;
  }
};

// Hàm này có vẻ là một placeholder, bạn có thể xóa hoặc sửa lại
const gernerateScheduleByHand = async () => {
  try {
    await axiosInstance.post(`/recurring-schedules/generate-now`);
    toast.success("Tạo lịch mới thành công!");
  } catch (error) {
    const err = error as AxiosError<ErrorResponse>;
    console.error("Error in gernerateScheduleByHand:", err);

    if (err.response?.data?.message) {
      toast.error(err.response.data.message);
    } else {
      toast.error(`Không thể tạo lịch mới!`);
    }
    throw err;
  }
};

export {
  getAllDoctors,
  getDoctorById,
  getDoctorsByHospitalId,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  updateDoctorStatus,
  deleteDoctorById,
  gernerateScheduleByHand,
};
