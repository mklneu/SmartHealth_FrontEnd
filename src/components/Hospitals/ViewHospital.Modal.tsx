import { useState, useEffect } from "react";
import {
  FaEye,
  // FaTimes,
  FaMapMarkerAlt,
  FaStethoscope,
  // FaPhone,
  // FaEnvelope,
} from "react-icons/fa";
import Button from "@/components/Button";
import { getHospitalById, Hospital } from "@/services/HospitalServices";
import { translateSpecialty } from "@/utils/translateEnums";

interface IProps {
  show: boolean;
  setShow: (v: boolean) => void;
  hospitalId: number;
  setHospitalId: (v: number | null) => void;
}

export const ViewHospitalModal = ({
  show,
  setShow,
  hospitalId,
  setHospitalId,
}: IProps) => {
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHospitalData = async () => {
      if (show && hospitalId) {
        setLoading(true);
        try {
          const response = await getHospitalById(hospitalId);
          setHospital(response); // Lấy dữ liệu từ response.data
          console.log("Dữ liệu bệnh viện:", response);
        } catch (error) {
          console.error("Lỗi khi tải dữ liệu bệnh viện:", error);
          setHospital(null);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchHospitalData();
  }, [show, hospitalId]);

  const handleClose = () => {
    setHospitalId(null);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fadeIn">
        <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FaEye /> Chi Tiết Bệnh Viện
          </h2>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : hospital ? (
            <div className="space-y-6">
              <div className="text-center border-b pb-4">
                <h3 className="text-2xl font-bold text-gray-800">
                  {hospital.name}
                </h3>
                <p className="text-gray-500 text-sm mt-1">ID: {hospital.id}</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <FaMapMarkerAlt className="text-red-500 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">
                      Địa chỉ
                    </p>
                    <p className="text-gray-800">{hospital.address}</p>
                  </div>
                </div>

                {/* THÊM PHẦN HIỂN THỊ CHUYÊN KHOA */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FaStethoscope className="text-teal-600" />
                    <p className="text-xs text-gray-500 font-semibold uppercase">
                      Các chuyên khoa
                    </p>
                  </div>
                  {hospital.specialties && hospital.specialties.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {hospital.specialties.map((spec) => (
                        <span
                          key={spec.id}
                          className="bg-teal-100 text-teal-800 text-sm font-medium px-3 py-1 rounded-full"
                        >
                          {translateSpecialty(spec.specialtyName)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-sm">
                      Chưa có thông tin chuyên khoa.
                    </p>
                  )}
                </div>

                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FaPhone className="text-green-600" />
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">
                        Điện thoại
                      </p>
                      <p className="text-gray-800">
                        {hospital.contactPhone || "Chưa cập nhật"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FaEnvelope className="text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">
                        Email
                      </p>
                      <p className="text-gray-800">
                        {hospital.contactEmail || "Chưa cập nhật"}
                      </p>
                    </div>
                  </div>
                </div> */}

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 font-semibold uppercase mb-1">
                    Mô tả
                  </p>
                  <p className="text-gray-700 whitespace-pre-line">
                    {hospital.description || "Không có mô tả."}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              Không tìm thấy dữ liệu bệnh viện.
            </div>
          )}
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end border-t">
          <Button onClick={handleClose}>Đóng</Button>
        </div>
      </div>
    </div>
  );
};
