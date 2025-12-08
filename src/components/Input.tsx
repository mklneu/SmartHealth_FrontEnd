interface IOption {
  label: string;
  value: string | number;
}

interface IInputProps {
  type?:
    | "text"
    | "email"
    | "password"
    | "textarea"
    | "select"
    | "multiselect"
    | "date"
    | "datetime-local"
    | "number"
    | "time";
  placeholder?: string;
  value: string | number | (string | number)[];
  disabled?: boolean;
  onChange?: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  className?: string;
  rows?: number; // Chỉ dùng cho textarea
  onClick?: () => void; // Chỉ dùng cho input bình thường
  options?: IOption[]; // Chỉ dùng cho type select
  label?: string; // Chỉ dùng cho input bình thường
  name?: string; // Chỉ dùng cho input bình thường
  required?: boolean; // Chỉ dùng cho input bình thường
  icon?: React.ReactNode; // Chỉ dùng cho input bình thường
  rightIcon?: React.ReactNode; // Chỉ dùng cho input bình thường
  onRightIconClick?: () => void; // Chỉ dùng cho input bình thường
  autoFocus?: boolean; // Chỉ dùng cho input bình thường
}

const InputBar = ({
  type = "text",
  placeholder = "",
  value = "",
  disabled = false,
  onChange,
  className = "",
  rows = 4,
  options = [],
  onClick,
  label,
  name,
  required = false,
  icon,
  rightIcon,
  onRightIconClick,
  autoFocus = false,
}: IInputProps) => {
  const baseClasses =
    "w-full h-full bg-transparent rounded-xl pl-5 pr-5 text-gray-900 placeholder:text-gray-500 border border-gray-300 duration-300 outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-200/50 hover:border-blue-300 hover:shadow-md placeholder-opacity-70 focus:placeholder-opacity-40";

  const textareaClasses =
    "w-full min-h-15 h-full bg-transparent rounded-xl pl-5 pr-5 pt-3 text-gray-900 placeholder:text-gray-500 border border-gray-300 duration-300 outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-200/50 hover:border-blue-300 hover:shadow-md placeholder-opacity-70 focus:placeholder-opacity-40";

  const selectClasses =
    "w-full h-full bg-white rounded-xl pl-5 pr-10 text-gray-700 border border-gray-300 duration-300 outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-200/50 hover:border-blue-300 hover:shadow-md cursor-pointer";

  if (type === "textarea") {
    return (
      <div className="flex min-h-10 relative">
        {label && (
          <label
            className="text-sm 
        font-medium text-gray-700 
        px-1 absolute -top-3 left-3 bg-white"
          >
            {label}
          </label>
        )}
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
        <textarea
          placeholder={placeholder}
          name={name}
          required={required}
          value={value as string | number}
          disabled={disabled}
          onChange={onChange}
          autoFocus={autoFocus}
          rows={rows}
          className={`${textareaClasses} ${className}
          ${icon ? "!pl-10" : ""}`}
        />
      </div>
    );
  }

  if (type === "select") {
    return (
      <div className="flex h-12 relative ">
        {label && (
          <label
            className="text-sm 
          font-medium text-gray-700 
          px-1 absolute -top-[10.5px] 
          left-3 bg-white"
          >
            {label}
          </label>
        )}
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        {rightIcon && (
          <div
            onClick={onRightIconClick}
            className="cursor-pointer duration-300
            absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {rightIcon}
          </div>
        )}
        <select
          name={name}
          value={value as string | number}
          required={required}
          disabled={disabled}
          onChange={onChange}
          autoFocus={autoFocus}
          className={`${selectClasses} ${className} appearance-none 
          ${icon ? "!pl-10" : ""}`}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="py-2 px-4 hover:bg-blue-100"
            >
              {option.label}
            </option>
          ))}
        </select>
        {/* Custom dropdown arrow using Tailwind only */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
          <svg
            className="h-4 w-4 fill-current"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    );
  }

  if (type === "multiselect") {
    return (
      <div className="flex min-h-12 relative">
        {label && (
          <label
            className="text-sm 
          font-medium text-gray-700 
          px-1 absolute -top-[10.5px] 
          left-3 bg-white z-10"
          >
            {label}
          </label>
        )}
        <select
          multiple // Thêm thuộc tính multiple
          name={name}
          value={Array.isArray(value) ? value.map(String) : []}
          required={required}
          disabled={disabled}
          onChange={onChange}
          autoFocus={autoFocus}
          className={`${selectClasses} ${className} appearance-none h-auto py-2`}
        >
          {/* Multi-select không có placeholder, có thể dùng label */}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="py-1 px-4 hover:bg-blue-100"
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // Xử lý riêng cho type="date"
  if (type === "date") {
    return (
      <div className="flex h-12 relative">
        {label && (
          <label
            className="text-sm 
          font-medium text-gray-700 
          px-1 absolute -top-3 left-3 bg-white"
          >
            {label}
          </label>
        )}
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        {rightIcon && (
          <div
            onClick={onRightIconClick}
            className="cursor-pointer duration-300
            absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {rightIcon}
          </div>
        )}
        <input
          type="date"
          name={name}
          placeholder={placeholder}
          required={required}
          value={value as string | number}
          disabled={disabled}
          onChange={onChange}
          onClick={onClick}
          autoFocus={autoFocus}
          className={`${baseClasses} ${className}
          ${icon ? "!pl-10" : ""}`}
        />
      </div>
    );
  }

  if (type === "datetime-local") {
    return (
      <div className="flex h-12 relative">
        {label && (
          <label
            className="text-sm 
          font-medium text-gray-700 
          px-1 absolute -top-3 left-3 bg-white"
          >
            {label}
          </label>
        )}
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        {rightIcon && (
          <div
            onClick={onRightIconClick}
            className="cursor-pointer duration-300
            absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {rightIcon}
          </div>
        )}
        <input
          type="datetime-local"
          name={name}
          required={required}
          placeholder={placeholder}
          value={value as string | number}
          disabled={disabled}
          onChange={onChange}
          onClick={onClick}
          autoFocus={autoFocus}
          className={`${baseClasses} ${className}
          ${icon ? "!pl-10" : ""}`}
        />
      </div>
    );
  }

  return (
    <div className="flex h-12 relative">
      {label && (
        <label
          className="text-sm 
        font-medium text-gray-700 
        px-1 absolute -top-3 left-3 bg-white"
        >
          {label}
        </label>
      )}
      {icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      {rightIcon && (
        <div
          onClick={onRightIconClick}
          className="cursor-pointer duration-300
          absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        >
          {rightIcon}
        </div>
      )}
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        value={value as string | number}
        disabled={disabled}
        onChange={onChange}
        onClick={onClick}
        autoFocus={autoFocus}
        className={`${baseClasses} ${className}
        ${icon ? "!pl-10" : ""}`}
      />
    </div>
  );
};

export default InputBar;
