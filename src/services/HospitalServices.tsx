import { toast } from "react-toastify";
import axiosInstance from "./axiosInstance";
import { AxiosError } from "axios";
import { ErrorResponse, PaginatedResponse } from "@/types/frontend";

export interface Hospital {
  id: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  address: string;
  logo: string;
  description: string;
  specialties: Specialty[];
}

interface Specialty {
  id: number;
  specialtyName: string;
  description: string;
}

export interface HospitalRequest {
  name: string;
  address: string;
  description: string;
  logo?: string;
  specialtyIds: number[]; // Mảng ID chuyên khoa
  contactPhone?: string; // Giữ lại nếu cần
  contactEmail?: string; // Giữ lại nếu cần
}

// 3. Định nghĩa Interface cho Query Params
interface HospitalQueryParams {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
}

// Lấy tất cả bệnh viện
const getAllHospitals = async (
  params: HospitalQueryParams
): Promise<PaginatedResponse<Hospital>> => {
  try {
    // Chuẩn bị tham số cơ bản
    const apiParams: Record<string, string | number> = {
      page: params.page || 1,
      size: params.size || 10,
    };

    if (params.sort) {
      apiParams.sort = params.sort;
    }

    // Xây dựng chuỗi filter RSQL
    const filterParts: string[] = [];

    // Logic tìm kiếm: Tìm theo Tên OR Địa chỉ OR Email
    if (params.search && params.search.trim() !== "") {
      const safeSearchTerm = params.search.trim().replace(/'/g, "''");
      filterParts.push(
        `(name~'${safeSearchTerm}' or address~'${safeSearchTerm}')`
      );
    }

    // Nối filter nếu có
    if (filterParts.length > 0) {
      apiParams.filter = filterParts.join(" and ");
    }

    // Gọi API
    const response = await axiosInstance.get("/hospitals", {
      params: apiParams,
    });

    return response.data.data;
  } catch (error) {
    const err = error as AxiosError<ErrorResponse>;
    console.error("❌ Error in getAllHospitals:", err);

    if (err.response?.data?.message) {
      toast.error(err.response.data.message);
    } else {
      toast.error("Không thể lấy danh sách bệnh viện!");
    }

    // Trả về dữ liệu rỗng để tránh crash UI
    return {
      meta: { page: 1, pageSize: params.size || 10, pages: 0, total: 0 },
      data: [],
    };
  }
};

// Lấy bệnh viện theo id
const getHospitalById = async (hospitalId: number) => {
  try {
    const response = await axiosInstance.get(`/hospitals/${hospitalId}`);
    return response.data.data;
  } catch (error) {
    console.error("❌ Error in getHospitalById:", error);
    toast.error("❌ Error while fetching hospital by ID!");
    throw error;
  }
};

// Thêm bệnh viện mới
const postHospital = async (data: HospitalRequest) => {
  try {
    const response = await axiosInstance.post("/hospitals", data);
    toast.success(response.data.message || "Thêm bệnh viện thành công");
    return response.data.data;
  } catch (error) {
    const err = error as AxiosError<ErrorResponse>;
    console.error("❌ Error in postHospital:", error);
    toast.error(err?.response?.data?.message || "Lỗi khi thêm bệnh viện");
    throw error;
  }
};

// Cập nhật bệnh viện
const updateHospitalById = async (
  hospitalId: number,
  data: HospitalRequest
) => {
  try {
    const response = await axiosInstance.put(`/hospitals/${hospitalId}`, data);
    toast.success(response.data.message || "Cập nhật thành công");
    return response.data.data;
  } catch (error) {
    const err = error as AxiosError<ErrorResponse>;
    console.error("❌ Error in updateHospital:", error);
    toast.error(err?.response?.data?.message || "Lỗi khi cập nhật");
    throw error;
  }
};

// Xóa bệnh viện
const deleteHospitalById = async (hospitalId: number) => {
  try {
    const response = await axiosInstance.delete(`/hospitals/${hospitalId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error in deleteHospitalById:", error);
    throw error;
  }
};

export {
  getAllHospitals,
  getHospitalById,
  postHospital,
  updateHospitalById,
  deleteHospitalById,
};
