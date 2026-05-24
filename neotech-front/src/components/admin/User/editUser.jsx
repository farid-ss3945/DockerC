import { useEffect, useRef, useState } from "react";
import { useEditUserMutation, useGetUserRolesQuery } from "../../../store/API";
import { ChevronDown, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

const EditUserUi = ({ setOpen, edit }) => {
  if (!edit) return null;

  const [editUser, { isLoading }] = useEditUserMutation();

  const { data: optionsData, error, isRolesLoading, refetch } = useGetUserRolesQuery();
  const [options, setOptions] = useState([])
  useEffect(() => {
    setOptions(optionsData)
  },[optionsData])

  const [selected, setSelected] = useState(0);
  const [checked, setChecked] = useState(true);
  const [formData, setFormData] = useState({});
  const [openD, setOpenD] = useState(false);
  const modalRef = useRef(null);

  // Reset form whenever user changes
  useEffect(() => {
    if (edit) {
      setFormData({
        id: edit.id,
        firstName: edit.firstName || "",
        lastName: edit.lastName || "",
        phoneNumber: edit.phoneNumber || "",
        role: edit.role || 0,
        isActive: edit.isActive ?? true
      }); 
      setSelected(edit.role || 0);
      setChecked(edit.isActive ?? true);
    }
  }, [edit]);


  // Sync dropdown & checkbox with formData
  useEffect(() => setFormData(prev => ({ ...prev, role: selected })), [selected]);
  useEffect(() => setFormData(prev => ({ ...prev, isActive: checked })), [checked]);

  // Close modal on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await editUser(formData).unwrap();
      toast.success("İstifadəçi uğurla yeniləndi!");
      setOpen();
    } catch (error) {
      toast.error("İstifadəçini yeniləmək uğursuz oldu");
    }
  };

  return (
    <form
      ref={modalRef}
      onSubmit={handleEdit}
      className="flex flex-col gap-6 p-6 bg-[#1f1f1f] rounded-lg w-96"
    >
      {/* First Name */}
      <div className="flex flex-col">
        <label className="text-white text-sm mb-1" htmlFor="firstName">
          Ad <span className="text-indigo-500">*</span>
        </label>
        <input
          name="firstName"
          type="text"
          required
          value={formData.firstName || ""}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-white placeholder:text-gray-400"
        />
      </div>

      {/* Last Name */}
      <div className="flex flex-col">
        <label className="text-white text-sm mb-1" htmlFor="lastName">
          Soyad <span className="text-indigo-500">*</span>
        </label>
        <input
          name="lastName"
          type="text"
          required
          value={formData.lastName || ""}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-white placeholder:text-gray-400"
        />
      </div>

      {/* Phone Number */}
      <div className="flex flex-col">
        <label className="text-white text-sm mb-1" htmlFor="phoneNumber">
          Telefon nömrəsi <span className="text-indigo-500">*</span>
        </label>
        <input
          name="phoneNumber"
          type="text"
          required
          value={formData.phoneNumber || ""}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-white placeholder:text-gray-400"
        />
      
      
      </div>

      {/* User Role */}
      <div className="flex flex-col">
        <label className="text-white text-sm mb-1" htmlFor="parent">
          İstifadəçi rolu (tələb olunur)
        </label>
        <select
          value={formData.role}
          onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                role: Number(e.target.value),
              }))
            }
            id="parent"
          className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-white"
        >
          {options?.map((item, index) => 
            (
              <option key={item.id || index} value={Number(item.value)}>
                {item.name}
              </option>
            ))
          }
        </select>
      </div>

      {/* Active Checkbox */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="customCheckbox"
          checked={checked}
          onChange={() => setChecked(!checked)}
          className="w-5 h-5 rounded border-gray-600 bg-[#2a2a2a] text-blue-500 focus:outline-none cursor-pointer"
        />
        <label htmlFor="customCheckbox" className="text-white text-sm select-none">
          {checked ? "Aktiv" : "Deaktiv"}
        </label>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-white cursor-pointer text-black font-semibold rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center"
        >
          {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Yadda saxla"}
        </button>
      </div>
    </form>
  );
};

export default EditUserUi;
