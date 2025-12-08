import { ErrorResponse, PaginatedResponse } from "@/types/frontend";
import axiosInstance from "./axiosInstance";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
/**
 * Đại diện cho một lựa chọn đóng gói trong chuỗi JSON
 * Ví dụ: { unit: "vỉ", quantity: 10, price: 19500 }
 */
export interface PackagingOption {
  unit: string;
  quantity: number;
  price: number;
}

export interface MedicineBody {
  name: string;
  activeIngredient: string;
  baseUnit: string;
  basePrice: number;
  packagingOptions: string;
  expiryDate: string; // Dạng ISO string
  description?: string;
}

/**
 * Dữ liệu trả về hoàn chỉnh cho một loại thuốc (bao gồm cả id).
 */
export interface Medicine extends MedicineBody {
  id: number;
}

interface MedicineQueryParams {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
}

// --- 2. Các hàm gọi API ---

/**
 * Tạo một loại thuốc mới
 * @param body Dữ liệu của thuốc
 * @returns Thuốc vừa được tạo
 */
const createMedicine = async (body: MedicineBody): Promise<Medicine> => {
  try {
    const response = await axiosInstance.post("/medicines", body);
    return response.data.data;
  } catch (error) {
    console.error("❌ Error creating medicine:", error);
    throw error;
  }
};

/**
 * Lấy danh sách thuốc, có thể tìm kiếm theo tên
 * @param name Tên thuốc để tìm kiếm (tùy chọn)
 * @returns Mảng các loại thuốc
 */
const getAllMedicines = async (
  params: MedicineQueryParams
): Promise<PaginatedResponse<Medicine>> => {
  try {
    // 1. Chuẩn bị các tham số cơ bản
    const apiParams: Record<string, string | number> = {
      page: params.page || 1,
      size: params.size || 10,
    };

    if (params.sort) {
      apiParams.sort = params.sort;
    }

    // 2. Xây dựng mảng các điều kiện lọc (filter)
    const filterParts: string[] = [];

    // 3. Thêm logic lọc cho 'search' (tìm theo Tên thuốc hoặc Hoạt chất)
    if (params.search && params.search.trim() !== "") {
      const safeSearchTerm = params.search.trim().replace(/'/g, "''");
      // Tìm kiếm trong tên thuốc (name) HOẶC hoạt chất (activeIngredient)
      filterParts.push(
        `(name~'${safeSearchTerm}' or activeIngredient~'${safeSearchTerm}')`
      );
    }

    // 4. Nối tất cả các điều kiện lọc lại bằng ' and '
    if (filterParts.length > 0) {
      apiParams.filter = filterParts.join(" and ");
    }

    // 5. Gửi request
    const res = await axiosInstance.get("/medicines", { params: apiParams });

    // 6. Trả về toàn bộ DTO phân trang
    return res.data.data;
  } catch (error) {
    // 7. Xử lý lỗi
    const err = error as AxiosError<ErrorResponse>;
    console.error("❌ Error getting medicines:", err);

    if (err.response?.data?.message) {
      toast.error(err.response.data.message);
    } else {
      toast.error("❌ Không thể tải danh sách thuốc!");
    }

    // Trả về cấu trúc rỗng để tránh crash UI
    return {
      meta: { page: 1, pageSize: params.size || 10, pages: 0, total: 0 },
      data: [],
    };
  }
};

/**
 * Lấy chi tiết một loại thuốc bằng ID
 * @param id ID của thuốc
 * @returns Dữ liệu chi tiết của thuốc
 */
const getMedicineById = async (id: number): Promise<Medicine> => {
  try {
    const response = await axiosInstance.get(`/medicines/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`❌ Error fetching medicine with id ${id}:`, error);
    throw error;
  }
};

/**
 * Cập nhật một loại thuốc đã có
 * @param id ID của thuốc cần cập nhật
 * @param body Dữ liệu mới của thuốc
 * @returns Thuốc sau khi đã được cập nhật
 */
const updateMedicine = async (
  id: number,
  body: Partial<MedicineBody>
): Promise<Medicine> => {
  try {
    const response = await axiosInstance.put(`/medicines/${id}`, body);
    return response.data.data;
  } catch (error) {
    console.error(`❌ Error updating medicine with id ${id}:`, error);
    throw error;
  }
};

/**
 * Xóa một loại thuốc
 * @param id ID của thuốc cần xóa
 */
const deleteMedicine = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/medicines/${id}`);
  } catch (error) {
    console.error(`❌ Error deleting medicine with id ${id}:`, error);
    throw error;
  }
};

export {
  createMedicine,
  getAllMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
};
