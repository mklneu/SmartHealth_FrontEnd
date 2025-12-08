// import { useState } from "react";
// import Button from "../Button";
// import { toast } from "react-toastify";
// import InputBar from "../Input";
// import { createPatient } from "@/services/PatientServices";

// interface IAddNewModalProps {
//   show: boolean;
//   setShow: (value: boolean) => void;
//   onSubmit: () => void; // Callback function to handle submission
//   role: string;
// }

// const AddNewUserModal = (props: IAddNewModalProps) => {
//   const { show, setShow, onSubmit, role } = props;

//   const [username, setUsername] = useState<string>("");
//   const [password, setPassword] = useState<string>("");
//   const [email, setEmail] = useState<string>("");
//   const [dob, setDob] = useState<string>("");
//   const [address, setAddress] = useState<string>("");
//   const [gender, setGender] = useState<string>("");
//   const [roleId, setRoleId] = useState<number>(0);
//   const [fullName, setFullName] = useState<string>("");

//   const handleSubmit = async () => {
//     if (!username || !password || !email || !dob || !address) {
//       toast.error("Please fill in all fields!");
//       return;
//     }

//     try {
//       await createPatient(
//         username,
//         fullName,
//         email,
//         password,
//         gender,
//         address,
//         dob,
//         roleId
//       );

//       // Refresh the blogs list
//       onSubmit(); // Call the onSubmit callback if provided

//       setUsername("");
//       setPassword("");
//       setEmail("");
//       setDob("");
//       setAddress("");
//       setGender("");

//       setShow(false); // Close modal after submission
//     } catch (error) {
//       console.error("Error creating blog:", error);
//       // Error message đã được handle trong postBlog function
//     }
//   };

//   const handleClose = () => {
//     setUsername("");
//     setPassword("");
//     setEmail("");
//     setDob("");
//     setAddress("");
//     setGender("");
//     setShow(false); // Close modal
//   };

//   return (
//     <>
//       {show && (
//         <form
//           onSubmit={(e) => e.preventDefault()}
//           className={`flex justify-between bg-[rgba(0,0,0,0.4)] fixed
//           items-center w-full min-h-screen mb-6 top-0 right-0 p-4 z-50`}
//         >
//           <div
//             className="mx-auto bg-white text-black 
//           rounded-lg shadow-2xl border border-gray-400
//           w-300"
//           >
//             <h1 className="px-5 py-4 text-2xl">Thêm mới {role}</h1>
//             <hr className="mb-6 text-gray-200" />
//             <div className="w-full mx-auto grid grid-cols-2 gap-6 px-5 md:px-10 md:grid">
//               <div className="">
//                 <InputBar
//                   label="Họ và tên"
//                   placeholder="Nhập họ và tên"
//                   value={fullName}
//                   onChange={(e) => setFullName(e.target.value)}
//                 ></InputBar>
//                 <InputBar
//                   label="Tên tài khoản"
//                   placeholder="Nhập tên tài khoản"
//                   value={username}
//                   onChange={(e) => setUsername(e.target.value)}
//                 ></InputBar>
//                 <InputBar
//                   label="Mật khẩu"
//                   placeholder="Nhập mật khẩu"
//                   type="password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                 ></InputBar>
//                 <InputBar
//                   label="Email"
//                   placeholder="Nhập email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                 ></InputBar>
//               </div>
//               <div>
//                 <InputBar
//                   label="Ngày sinh"
//                   placeholder="Nhập ngày sinh"
//                   value={dob}
//                   type="date"
//                   onChange={(e) => setDob(e.target.value)}
//                   className="!pr-5"
//                 ></InputBar>
//                 <InputBar
//                   label="Địa chỉ"
//                   placeholder="Nhập địa chỉ"
//                   value={address}
//                   onChange={(e) => setAddress(e.target.value)}
//                 ></InputBar>
//                 <InputBar
//                   label="Giới tính"
//                   type="select"
//                   value={gender}
//                   placeholder="Chọn giới tính"
//                   onChange={(e) => setGender(e.target.value)}
//                   options={[
//                     { label: "Nam", value: "MALE" },
//                     { label: "Nữ", value: "FEMALE" },
//                     { label: "Khác", value: "OTHER" },
//                   ]}
//                 ></InputBar>
//                 <InputBar
//                   label="Vai trò"
//                   type="select"
//                   value={roleId}
//                   placeholder="Chọn vai trò"
//                   onChange={(e) => setRoleId(Number(e.target.value))}
//                   options={[
//                     { label: "Admin", value: 1 },
//                     { label: "Bác sĩ", value: 2 },
//                     { label: "Bệnh nhân", value: 4 },
//                     { label: "Nhân viên", value: 5 },
//                   ]}
//                 ></InputBar>
//               </div>
//             </div>
//             <div className="flex justify-end mx-auto gap-2 mt-6 mb-8 w-11/12">
//               <Button
//                 variant="secondary"
//                 size="md"
//                 onClick={() => {
//                   handleClose();
//                 }}
//               >
//                 Đóng
//               </Button>
//               <Button size="md" onClick={() => handleSubmit()}>
//                 Thêm
//               </Button>
//             </div>
//           </div>
//         </form>
//       )}
//     </>
//   );
// };

// export default AddNewUserModal;
