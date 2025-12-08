"use client";
import { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaEye,
  FaTrash,
  FaSearch,
  FaUndoAlt,
  FaHospital,
} from "react-icons/fa";
import { toast } from "react-toastify";
// Giả sử bạn đã có các component Modal này (nếu chưa có, bạn cần tạo chúng tương tự như Doctor)
import AddHospitalModal from "@/components/Hospitals/AddHospital.Modal";
import UpdateHospitalModal from "@/components/Hospitals/UpdateHospital.Modal";

// Import Service (Cần đảm bảo bạn đã tạo HospitalServices)
import {
  deleteHospitalById,
  getAllHospitals,
  Hospital, // Interface Hospital
} from "@/services/HospitalServices";
import { Pagination } from "@/services/OtherServices";
import Button from "@/components/Button";
import { useDebounce } from "@/hooks/useDebounce";
import { ViewHospitalModal } from "@/components/Hospitals/ViewHospital.Modal";

export default function HospitalPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearch = useDebounce(searchTerm, 800);

  // Modal states
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [selectedHospitalId, setSelectedHospitalId] = useState<number | null>(
    null
  );

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 5;

  // Fetch hospitals from backend
  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        size: pageSize,
        search: debouncedSearch,
        // sort: "name,asc", // Có thể thêm sort mặc định nếu muốn
      };

      const responseData = await getAllHospitals(params);

      setHospitals(responseData.data);
      setTotalPages(responseData.meta.pages);
      setTotal(responseData.meta.total);
    } catch (error) {
      console.error("Failed to fetch hospitals:", error);
      toast.error("Lỗi khi tải danh sách bệnh viện");
    } finally {
      setLoading(false);
    }
  };

  // Effect để gọi API khi filter/page thay đổi
  useEffect(() => {
    const fetchHospitals = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          size: pageSize,
          search: debouncedSearch,
          // sort: "name,asc", // Có thể thêm sort mặc định nếu muốn
        };

        const responseData = await getAllHospitals(params);

        setHospitals(responseData.data);
        setTotalPages(responseData.meta.pages);
        setTotal(responseData.meta.total);
      } catch (error) {
        console.error("Failed to fetch hospitals:", error);
        toast.error("Lỗi khi tải danh sách bệnh viện");
      } finally {
        setLoading(false);
      }
    };
    fetchHospitals();
  }, [currentPage, debouncedSearch]);

  // Reset về trang 1 khi search thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // Scroll lên đầu trang khi chuyển trang
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // Handlers
  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bệnh viện này?")) {
      try {
        await deleteHospitalById(id);

        // Cập nhật UI ngay lập tức
        setHospitals((prev) => prev.filter((h) => h.id !== id));
        toast.success("Đã xóa bệnh viện thành công");

        // Tải lại để cập nhật phân trang
        fetchHospitals();
      } catch (error) {
        console.error("Lỗi khi xóa:", error);
        toast.error("Không thể xóa bệnh viện. Vui lòng thử lại sau.");
      }
    }
  };

  const handleUpdate = (id: number) => {
    setSelectedHospitalId(id);
    setShowUpdateModal(true);
  };

  const handleView = (id: number) => {
    setSelectedHospitalId(id);
    setShowViewModal(true);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4">
      <div className="container mx-auto">
        {/* Header with stats */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-800 rounded-xl p-6 mb-8 text-white shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold">Quản lý Bệnh viện</h1>
              <p className="mt-2 text-teal-100">
                Quản lý thông tin các cơ sở y tế trong hệ thống
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mt-4 md:mt-0">
              <div className="flex items-center">
                <div className="mr-3 text-3xl">🏥</div>
                <div>
                  <p className="text-xs text-teal-100">Tổng số bệnh viện</p>
                  <p className="text-2xl font-bold">{total}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search bar */}
            <div className="relative lg:col-span-1 lg:col-start-1 w-full lg:w-96">
              <FaSearch className="absolute top-1/2 left-3.5 -translate-y-1/2 text-gray-400" />
              <input
                value={searchTerm}
                type="text"
                placeholder="Tìm kiếm tên bệnh viện, địa chỉ..."
                className="w-full pl-10 p-2.5 border text-gray-700 focus:border-teal-500 border-gray-300 rounded-lg bg-gray-50 outline-none text-sm"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-row gap-4">
              <div className="relative lg:justify-end w-fit">
                <button
                  onClick={handleResetFilters}
                  className="w-full h-full px-4 cursor-pointer
                  py-2.5 border text-gray-700 duration-300
                  hover:bg-gray-100 border-gray-300 active:bg-gray-200
                  rounded-lg bg-gray-50 outline-none 
                  text-sm flex items-center justify-center gap-2"
                  title="Xóa bộ lọc"
                >
                  <FaUndoAlt className="text-gray-500" />
                  Xóa bộ lọc
                </button>
              </div>

              {/* Add button */}
              <Button
                onClick={() => setShowAddModal(true)}
                icon={<FaPlus />}
                className="!h-11 !bg-teal-600 hover:!bg-teal-700"
              >
                Thêm bệnh viện
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-20 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-500 mb-4"></div>
            <p className="text-gray-500">Đang tải danh sách bệnh viện...</p>
          </div>
        ) : hospitals?.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-20 text-center">
            <div className="text-gray-400 text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Không tìm thấy bệnh viện
            </h3>
            <p className="text-gray-500 mb-4">
              Không có bệnh viện nào khớp với điều kiện tìm kiếm của bạn
            </p>
            <button
              onClick={handleResetFilters}
              className="text-teal-600 hover:text-teal-800 font-medium
              cursor-pointer duration-300"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên bệnh viện
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Địa chỉ
                    </th>
                    {/* <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Liên hệ
                    </th> */}
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {hospitals?.map((hospital) => (
                    <tr
                      key={hospital.id}
                      className="hover:bg-teal-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600">
                            <FaHospital size={20} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {hospital.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {hospital.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className="text-sm text-gray-900 line-clamp-2 max-w-xs"
                          title={hospital.address}
                        >
                          {hospital.address}
                        </div>
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-900">
                          {hospital.contactEmail || "---"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {hospital.contactPhone || "---"}
                        </div>
                      </td> */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3 justify-center">
                          <button
                            onClick={() => handleView(hospital.id)}
                            className="text-blue-600 cursor-pointer
                            hover:text-blue-900 bg-blue-100 
                            hover:bg-blue-200 p-1.5 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => handleUpdate(hospital.id)}
                            className="text-green-700 cursor-pointer
                            hover:text-green-900 bg-green-200 
                            hover:bg-green-300 p-1.5 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(hospital.id)}
                            className="text-red-600 cursor-pointer
                            hover:text-red-900 bg-red-100 
                            hover:bg-red-200 p-1.5 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
          </div>
        )}
      </div>

      {/* Modals */}
      {/* Bạn cần đảm bảo các component này đã được tạo hoặc comment lại nếu chưa có */}
      {showAddModal && (
        <AddHospitalModal
          show={showAddModal}
          setShow={setShowAddModal}
          onSuccess={fetchHospitals}
        />
      )}

      {selectedHospitalId && showUpdateModal && (
        <UpdateHospitalModal
          show={showUpdateModal}
          setShow={setShowUpdateModal}
          hospitalId={selectedHospitalId}
          setHospitalId={setSelectedHospitalId}
          onSuccess={fetchHospitals}
        />
      )}

      {selectedHospitalId && showViewModal && (
        <ViewHospitalModal
          show={showViewModal}
          setShow={setShowViewModal}
          hospitalId={selectedHospitalId}
          setHospitalId={setSelectedHospitalId}
        />
      )}
    </div>
  );
}
