import { toast } from "react-toastify";
import axiosInstance from "./axiosInstance";
import { AxiosError } from "axios";
import { ErrorResponse, PaginatedResponse } from "@/types/frontend";

export interface Specialty {
  id: string;
  specialtyName: string;
  description: string;
}

interface SpecialtyQueryParams {
  page?: number;
  size?: number;
  search?: string;
}

// Lấy danh sách chuyên khoa theo ID bệnh viện
export const getSpecialtiesByHospitalId = async (hospitalId: string) => {
  try {
    const response = await axiosInstance.get(
      `/hospitals/${hospitalId}/specialties`
    );
    return response.data.data;
  } catch (error) {
    const err = error as AxiosError<ErrorResponse>;
    console.error("❌ Error in getSpecialtiesByHospitalId:", error);
    toast.error(
      err?.response?.data?.error || "Lỗi khi tải danh sách chuyên khoa."
    );
    throw error;
  }
};

// Lấy tất cả chuyên khoa (có phân trang và tìm kiếm)
export const getAllSpecialties = async (
  params: SpecialtyQueryParams = {}
): Promise<PaginatedResponse<Specialty>> => {
  try {
    const apiParams: Record<string, string | number> = {
      page: params.page || 1,
      pageSize: params.size || 10,
    };

    // Logic tìm kiếm theo tên chuyên khoa
    if (params.search && params.search.trim() !== "") {
      apiParams.filter = `name@=${params.search.trim()}`;
    }

    const response = await axiosInstance.get("/specialties", {
      params: apiParams,
    });

    // Giả sử API trả về cấu trúc { data: { data: [], meta: {} } }
    return response.data.data;
  } catch (error) {
    const err = error as AxiosError<ErrorResponse>;
    console.error("❌ Error in getAllSpecialties:", err);
    toast.error(
      err.response?.data?.message || "Không thể lấy danh sách chuyên khoa!"
    );

    // Trả về dữ liệu rỗng để tránh crash UI
    return {
      meta: { page: 1, pageSize: params.size || 10, pages: 0, total: 0 },
      data: [],
    };
  }
};
