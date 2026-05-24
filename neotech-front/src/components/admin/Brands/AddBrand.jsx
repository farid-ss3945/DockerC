import { useEffect, useState } from "react";
import { useAddBrandImageMutation } from "../../../store/API";
import { Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "react-toastify";

const AddBrandUI = ({setOpen}) => {
  const [addBrandImage, { isLoading: isBrandImageLoading }] = useAddBrandImageMutation(); 
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    sortOrder: 1,
  });

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0]; 
    if (!selectedFile) return;

    setFile(selectedFile);
    e.target.value = ""; 
  };

  const close = () => {
    setFormData({
      name: "",
      sortOrder: 1,
    });
    setFile(null);
    setOpen(false);
  }

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setImageUrl(null);
    }
  }, [file]);

  const handleBrand = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error("Zəhmət olmasa əvvəlcə şəkil yükləyin");
      return;
    }

    try {
      // Build the brand data object
      const brandData = {
        name: formData.name,
        sortOrder: formData.sortOrder,
      };


      // Create FormData and append fields
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("sortOrder", formData.sortOrder);
      formDataToSend.append("imageFile", file, file.name);


      const result = await addBrandImage({
          name: formData.name,
          sortOrder: formData.sortOrder,
          file,
        }).unwrap();

      toast.success("Brend uğurla əlavə edildi");

      setFormData({
        name: "",
        sortOrder: 1
      });
      setFile(null);
      setOpen();

    } catch (error) {
      toast.error(error?.data || "Nəsə səhv getdi");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <form 
      onSubmit={handleBrand}
      className="flex flex-col gap-6 p-6 bg-[#1f1f1f] rounded-lg w-96"
    >
      {/* Name Field */}
      <div className="flex flex-col">
        <label className="text-white text-sm mb-1" htmlFor="name">
          Ad <span className="text-indigo-500">*</span>
        </label>
        <input
          id="name"
          onChange={handleChange}
          name="name"
          type="text"
          required
          placeholder="Brend adını daxil edin"
          className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-white placeholder:text-gray-400"
        />
      </div>

      {/* Sort Order Field */}
      <div className="flex flex-col">
        <label className="text-white text-sm mb-1" htmlFor="sortOrder">
          Sıra nömrəsi
        </label>
        <input
          id="sortOrder"
          onChange={handleChange}
          name="sortOrder"
          type="number"
          value={formData.sortOrder}
          className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-white"
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium mb-2 text-white">Brend loqosu</label>
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <Upload className="w-8 h-8 text-gray-400" />
            <span className="text-gray-400">
              Şəkil yükləmək üçün klik edin və ya sürükləyin
            </span>
            <span className="text-sm text-gray-500">
              PNG, JPG, GIF up to 10MB
            </span>
          </label>
        </div>

        {/* Image Preview */}
        {file && 
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="relative group">
              <img
                src={imageUrl}
                className="w-full h-24 object-cover rounded-md border"
                alt="Preview"
              />
              <button
                type="button"
                onClick={() => {setFile(null)}}
                className="absolute top-1 right-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        }
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isBrandImageLoading}
          className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-all"
        >
          {isBrandImageLoading ? <Loader2 className="w-12 h-12 text-white animate-spin" /> : "Yadda saxla"}
        </button>
      </div>
    </form>
  );
};

export default AddBrandUI;
