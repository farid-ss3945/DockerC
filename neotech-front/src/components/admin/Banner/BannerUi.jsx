import { Loader2, Pen, Trash, Image, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import Modal from "../../UI/Modal";
import { toast } from "react-toastify";
import { useTranslation } from 'react-i18next';
import { 
  useAddBannerMutation, 
  useDeleteBannerMutation, 
  useGetBannersQuery, 
  useGetParentCategoriesQuery,
  useUpdateBannerMutation,
  useUploadMobileImageMutation,
  useUploadDesktopImageMutation 
} from '../../../store/API';

const BannersUI = () => {
  const { t } = useTranslation();
  const { data: categories, isCatsLoading } = useGetParentCategoriesQuery();
  const { data: bannersD, isBannersLoading, error, refetch } = useGetBannersQuery();
  const [deleteBanner] = useDeleteBannerMutation();
  const [addBanner, { isLoading: isBannerLoading }] = useAddBannerMutation();
  const [updateBanner, { isLoading: isUpdateLoading }] = useUpdateBannerMutation();

  const [modalType, setModalType] = useState(null);
  const [selectedBanner, setSelectedBanner] = useState(null);

  const AddBannerModal = ({ isOpen, onClose }) => {
    const [file, setFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [mobileFile, setMobileFile] = useState(null);
    const [mobileImagePreview, setMobileImagePreview] = useState(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [uploadMobileImage] = useUploadMobileImageMutation();
    const [formData, setFormData] = useState({
      title: "",
      description: "",
      linkUrl: "",
      buttonText: "",
      type: 0,
      isActive: true,
      sortOrder: 0,
      startDate: "2025-09-21T13:38:28.551Z",
      endDate: "2025-09-21T13:38:28.551Z"
    });

    const getCategoryOptions = () => {
      if (!categories) return [];
      const options = [];

      categories.forEach(parent => {
        options.push({
          id: parent.id,
          name: parent.name,
          slug: parent.slug,
          level: 0,
          parentName: null
        });

        if (parent.subCategories && parent.subCategories.length > 0) {
          parent.subCategories.forEach(sub => {
            options.push({
              id: sub.id,
              name: sub.name,
              slug: sub.slug,
              level: 1,
              parentName: parent.name
            });

            if (sub.subCategories && sub.subCategories.length > 0) {
              sub.subCategories.forEach(subSub => {
                options.push({
                  id: subSub.id,
                  name: subSub.name,
                  slug: subSub.slug,
                  level: 2,
                  parentName: `${parent.name} > ${sub.name}`
                });
              });
            }
          });
        }
      });

      return options;
    };

    const categoryOptions = getCategoryOptions();

    const handleCategorySelect = (option) => {
      setSelectedCategoryId(option.id);
      let url;
      if (option.level === 0) {
        url = `/${option.slug}`;
      } else {
        url = `/products/${option.slug}`;
      }
      setFormData(prev => ({ ...prev, linkUrl: url }));
      setIsDropdownOpen(false);
    };

    const getSelectedCategoryName = () => {
      if (!selectedCategoryId) return "";
      const option = categoryOptions.find(opt => opt.id === selectedCategoryId);
      return option ? option.name : "";
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      if (!file) {
        toast.error("Zəhmət olmasa şəkil faylı seçin");
        return;
      }

      const cleanFormData = {
        ...formData,
        type: Number(formData.type),
        sortOrder: Number(formData.sortOrder),
        isActive: Boolean(formData.isActive)
      };

      const formDataToSend = new FormData();
      const bannerDataString = JSON.stringify(cleanFormData);

      formDataToSend.append("bannerData", bannerDataString);
      formDataToSend.append("imageFile", file);

      try {
        const result = await addBanner(formDataToSend).unwrap();
        
        // Upload mobile image if provided
        if (mobileFile && result?.id) {
          try {
            await uploadMobileImage({
              id: result.id,
              imageFile: mobileFile
            }).unwrap();
          } catch (mobileError) {
            console.error("Error uploading mobile image:", mobileError);
            toast.warning("Banner yaradıldı, lakin mobil şəkil yüklənmədi: " + (mobileError.data?.message || mobileError.message));
          }
        }
        
        toast.success(t('adminBanners.addBannerSuccess') || "Banner uğurla əlavə edildi!");
        refetch();
        onClose();

        setFormData({
          title: "",
          description: "",
          linkUrl: "",
          buttonText: "",
          type: 0,
          isActive: true,
          sortOrder: 0,
          startDate: "2025-09-21T13:38:28.551Z",
          endDate: "2025-09-21T13:38:28.551Z"
        });
        setFile(null);
        setImagePreview(null);
        setMobileFile(null);
        setMobileImagePreview(null);
        setSelectedCategoryId("");
      } catch (error) {
        console.error("Error adding banner:", error);
        toast.error("Banner əlavə etmək uğursuz oldu: " + (error.data?.message || error.message));
      }
    };

    const handleImageChange = (e) => {
      const selectedFile = e.target.files[0];
      if (selectedFile) {
        if (selectedFile.size > 10 * 1024 * 1024) {
          toast.error("Fayl ölçüsü 10MB-dan az olmalıdır");
          return;
        }

        if (!selectedFile.type.startsWith('image/')) {
          toast.error("Zəhmət olmasa düzgün şəkil faylı seçin");
          return;
        }

        setFile(selectedFile);

        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(selectedFile);
      }
    };

    const handleRemoveImage = () => {
      setFile(null);
      setImagePreview(null);
      const fileInput = document.getElementById('banner-image-input');
      if (fileInput) {
        fileInput.value = '';
      }
    };

    const handleMobileImageChange = (e) => {
      const selectedFile = e.target.files[0];
      if (selectedFile) {
        if (selectedFile.size > 10 * 1024 * 1024) {
          toast.error("Fayl ölçüsü 10MB-dan az olmalıdır");
          return;
        }

        if (!selectedFile.type.startsWith('image/')) {
          toast.error("Zəhmət olmasa düzgün şəkil faylı seçin");
          return;
        }

        setMobileFile(selectedFile);

        const reader = new FileReader();
        reader.onload = (e) => {
          setMobileImagePreview(e.target.result);
        };
        reader.readAsDataURL(selectedFile);
      }
    };

    const handleRemoveMobileImage = () => {
      setMobileFile(null);
      setMobileImagePreview(null);
      const fileInput = document.getElementById('banner-mobile-image-input');
      if (fileInput) {
        fileInput.value = '';
      }
    };

    return (
      <div className=" rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-6">{t('adminBanners.addBanner')}</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Banner başlığı *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Banner başlığını daxil edin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Düymə mətni
            </label>
            <input
              type="text"
              value={formData.buttonText}
              onChange={(e) => setFormData(prev => ({ ...prev, buttonText: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="məs: İndi alış veriş et, Ətraflı öyrən"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Link URL
            </label>

            <div className="space-y-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg text-white text-left focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
                >
                  <span className={getSelectedCategoryName() ? "text-white" : "text-gray-400"}>
                    {getSelectedCategoryName() || "Kateqoriya seçin..."}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDropdownOpen && ( 
                  <div className="absolute bg-gray-800 z-10 w-full mt-1 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {isCatsLoading ? (
                      <div className="px-4 py-3 text-gray-400 text-center">Kateqoriyalar yüklənir...</div>
                    ) : categoryOptions.length === 0 ? (
                      <div className="px-4 py-3 text-gray-400 text-center">Kateqoriya mövcud deyil</div>
                    ) : (
                      categoryOptions.map(option => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handleCategorySelect(option)}
                          className={`w-full text-left px-4 py-2 hover:bg-gray-600 transition-colors ${selectedCategoryId === option.id ? 'bg-gray-600 text-blue-400' : 'text-white'
                            }`}
                          style={{ paddingLeft: `${(option.level * 1.5) + 1}rem` }}
                        >
                          <span className="flex items-center gap-2">
                            {option.level > 0 && (
                              <span className="text-gray-500">└─</span>
                            )}
                            {option.name}
                            {option.parentName && (
                              <span className="text-xs text-gray-400 ml-2">({option.parentName})</span>
                            )}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-gray-600"></div>
                <span className="text-xs text-gray-500">və ya əl ilə daxil edin</span>
                <div className="flex-1 h-px bg-gray-600"></div>
              </div>

              <input
                type="text"
                value={formData.linkUrl}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, linkUrl: e.target.value }));
                  setSelectedCategoryId("");
                }}
                className="w-full px-4 py-3 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://misal.com/səhifə və ya /xüsusi-yol"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              className="w-full px-4 py-3 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Açıqlama daxil edin..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Banner şəkli (Desktop) *
            </label>

            {!imagePreview ? (
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-lg hover:border-gray-500 transition-colors">
                <div className="space-y-1 text-center">
                  <Image className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-400">
                    <label className="relative cursor-pointer rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 px-2 py-1">
                      <span>Fayl yüklə</span>
                      <input
                        id="banner-image-input"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="pl-1">və ya sürükləyin</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="relative rounded-lg overflow-hidden border-2 border-gray-600">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full transition-colors duration-200"
                    >
                      <Trash className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between rounded-lg p-3">
                  <div className="flex items-center space-x-3">
                    <Image className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-white font-medium">{file?.name}</p>
                      <p className="text-xs text-gray-400">
                        {file ? (file.size / 1024 / 1024).toFixed(2) : 0} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-indigo-400 hover:text-red-300 p-1"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-2">
                  <label className="relative cursor-pointer rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 px-3 py-2 text-sm inline-block">
                    <span>Şəkli dəyişdir</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Banner şəkli (Mobile)
            </label>

            {!mobileImagePreview ? (
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-lg hover:border-gray-500 transition-colors">
                <div className="space-y-1 text-center">
                  <Image className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-400">
                    <label className="relative cursor-pointer rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 px-2 py-1">
                      <span>Fayl yüklə</span>
                      <input
                        id="banner-mobile-image-input"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleMobileImageChange}
                      />
                    </label>
                    <p className="pl-1">və ya sürükləyin</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="relative rounded-lg overflow-hidden border-2 border-gray-600">
                  <img
                    src={mobileImagePreview}
                    alt="Mobile Preview"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                    <button
                      type="button"
                      onClick={handleRemoveMobileImage}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full transition-colors duration-200"
                    >
                      <Trash className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between rounded-lg p-3">
                  <div className="flex items-center space-x-3">
                    <Image className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-white font-medium">{mobileFile?.name}</p>
                      <p className="text-xs text-gray-400">
                        {mobileFile ? (mobileFile.size / 1024 / 1024).toFixed(2) : 0} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveMobileImage}
                    className="text-indigo-400 hover:text-red-300 p-1"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-2">
                  <label className="relative cursor-pointer rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 px-3 py-2 text-sm inline-block">
                    <span>Şəkli dəyişdir</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleMobileImageChange}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-300">
              Aktiv (vebsaytda görünür)
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isBannerLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {isBannerLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('adminProduct.adding')}
                </>
              ) : (
                t('adminBanners.addBanner')
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {t('adminProduct.cancel')}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const EditBannerModal = ({ isOpen, onClose, banner }) => {
    const [file, setFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [mobileFile, setMobileFile] = useState(null);
    const [mobileImagePreview, setMobileImagePreview] = useState(null);
    const [uploadMobileImage] = useUploadMobileImageMutation();
    const [uploadDesktopImage] = useUploadDesktopImageMutation();
    
    // Initialize image previews from banner data
    useEffect(() => {
      if (banner) {
        if (banner.imageUrl && !file) {
          setImagePreview(`https://ecommerce100-001-site1.ntempurl.com/${banner.imageUrl}`);
        }
        if (banner.mobileImageUrl && !mobileFile) {
          setMobileImagePreview(`https://ecommerce100-001-site1.ntempurl.com/${banner.mobileImageUrl}`);
        }
      }
    }, [banner, file, mobileFile]);
    const [formData, setFormData] = useState({
      title: banner?.title || '',
      titleVisible: banner?.titleVisible ,
      description: banner?.description || '',
      descriptionVisible: banner?.descriptionVisible ,
      linkUrl: banner?.linkUrl || '',
      buttonText: banner?.buttonText || '',
      buttonVisible: banner?.buttonVisible ,
      type: banner?.type || 0,
      isActive: banner?.isActive ?? true,
      sortOrder: banner?.sortOrder || 0,
      startDate: banner?.startDate || "2025-09-21T13:38:28.551Z",
      endDate: banner?.endDate || "2025-09-21T13:38:28.551Z"
    });
    const handleSubmit = async (e) => {
      e.preventDefault();


      try {
        
        const cleanFormData = {
          title: formData.title,
          titleVisible: formData.titleVisible,
          description: formData.description,
          descriptionVisible: formData.descriptionVisible,
          linkUrl: formData.linkUrl,
          buttonText: formData.buttonText,
          buttonVisible: formData.buttonVisible,
          type: Number(formData.type),
          isActive: Boolean(formData.isActive),
          sortOrder: Number(formData.sortOrder),
          startDate: formData.startDate,
          endDate: formData.endDate
        };
      
        await updateBanner({
          id: banner.id,
          ...cleanFormData  // Spread the data at the same level as id
        }).unwrap();

        // Upload desktop image if provided
        if (file) {
          try {
            await uploadDesktopImage({
              id: banner.id,
              imageFile: file
            }).unwrap();
          } catch (desktopError) {
            console.error("Error uploading desktop image:", desktopError);
            toast.warning("Banner yeniləndi, lakin desktop şəkil yüklənmədi: " + (desktopError.data?.message || desktopError.message));
          }
        }

        // Upload mobile image if provided
        if (mobileFile) {
          try {
            await uploadMobileImage({
              id: banner.id,
              imageFile: mobileFile
            }).unwrap();
          } catch (mobileError) {
            console.error("Error uploading mobile image:", mobileError);
            toast.warning("Banner yeniləndi, lakin mobil şəkil yüklənmədi: " + (mobileError.data?.message || mobileError.message));
          }
        }

        toast.success("Banner uğurla yeniləndi!");
        refetch();
        onClose();
      } catch (error) {
        console.error("Error updating banner:", error);
        toast.error("Banneri yeniləmək uğursuz oldu: " + (error.data?.message || error.message));
      }
    };

    const handleMobileImageChange = (e) => {
      const selectedFile = e.target.files[0];
      if (selectedFile) {
        if (selectedFile.size > 10 * 1024 * 1024) {
          toast.error("Fayl ölçüsü 10MB-dan az olmalıdır");
          return;
        }

        if (!selectedFile.type.startsWith('image/')) {
          toast.error("Zəhmət olmasa düzgün şəkil faylı seçin");
          return;
        }

        setMobileFile(selectedFile);

        const reader = new FileReader();
        reader.onload = (e) => {
          setMobileImagePreview(e.target.result);
        };
        reader.readAsDataURL(selectedFile);
      }
    };

    const handleRemoveMobileImage = () => {
      setMobileFile(null);
      setMobileImagePreview(null);
      const fileInput = document.getElementById('edit-banner-mobile-image-input');
      if (fileInput) {
        fileInput.value = '';
      }
    };

    const handleImageChange = (e) => {
      const selectedFile = e.target.files[0];
      if (selectedFile) {
        if (selectedFile.size > 10 * 1024 * 1024) {
          toast.error("Fayl ölçüsü 10MB-dan az olmalıdır");
          return;
        }

        if (!selectedFile.type.startsWith('image/')) {
          toast.error("Zəhmət olmasa düzgün şəkil faylı seçin");
          return;
        }

        setFile(selectedFile);

        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(selectedFile);
      }
    };

    const handleRemoveImage = () => {
      setFile(null);
      setImagePreview(null);
      const fileInput = document.getElementById('edit-banner-image-input');
      if (fileInput) {
        fileInput.value = '';
      }
    };



    return (
      <div className=" rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Banneri redaktə et</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Banner başlığı *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Banner başlığını daxil edin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Düymə mətni
            </label>
            <input
              type="text"
              value={formData.buttonText}
              onChange={(e) => setFormData(prev => ({ ...prev, buttonText: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="məs: İndi alış veriş et, Ətraflı öyrən"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Link URL
            </label>
            <input
              type="text"
              value={formData.linkUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://misal.com/səhifə və ya /xüsusi-yol"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Açıqlama
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Banner açıqlamasını daxil edin"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
            <input
              type="checkbox"
              id="editIsActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
            />
            <label htmlFor="editIsActive" className="ml-2 block text-sm text-gray-300">
              Banner görünürlüyü
            </label>
            </div>
            <div className="flex items-center">
            <input
              type="checkbox"
              id="editIsActive"
              checked={formData.buttonVisible}
              onChange={(e) => setFormData(prev => ({ ...prev, buttonVisible: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
            />
            <label htmlFor="editIsActive" className="ml-2 block text-sm text-gray-300">
              Düymə görünürlüyü
            </label>
            </div>
            <div className="flex items-center">
            <input
              type="checkbox"
              id="editIsActive"
              checked={formData.titleVisible}
              onChange={(e) => setFormData(prev => ({ ...prev, titleVisible: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
            />
            <label htmlFor="editIsActive" className="ml-2 block text-sm text-gray-300">
              Başlıq görünürlüyü
            </label>
            </div>
            <div className="flex items-center">
            <input
              type="checkbox"
              id="editIsActive"
              checked={formData.descriptionVisible}
              onChange={(e) => setFormData(prev => ({ ...prev, descriptionVisible: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
            />
            <label htmlFor="editIsActive" className="ml-2 block text-sm text-gray-300">
              Açıqlama görünürlüyü
            </label>
            </div>

          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Banner şəkli (Desktop)
            </label>

            {!imagePreview && !banner?.imageUrl ? (
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-lg hover:border-gray-500 transition-colors">
                <div className="space-y-1 text-center">
                  <Image className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-400">
                    <label className="relative cursor-pointer rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 px-2 py-1">
                      <span>Fayl yüklə</span>
                      <input
                        id="edit-banner-image-input"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="pl-1">və ya sürükləyin</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="relative rounded-lg overflow-hidden border-2 border-gray-600">
                  <img
                    src={imagePreview || `https://ecommerce100-001-site1.ntempurl.com/${banner?.imageUrl}`}
                    alt="Desktop Preview"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full transition-colors duration-200"
                    >
                      <Trash className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between rounded-lg p-3">
                  <div className="flex items-center space-x-3">
                    <Image className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-white font-medium">{file?.name || 'Mövcud desktop şəkil'}</p>
                      <p className="text-xs text-gray-400">
                        {file ? (file.size / 1024 / 1024).toFixed(2) : ''} {file ? 'MB' : ''}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-indigo-400 hover:text-red-300 p-1"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-2">
                  <label className="relative cursor-pointer rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 px-3 py-2 text-sm inline-block">
                    <span>Şəkli dəyişdir</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Banner şəkli (Mobile)
            </label>

            {!mobileImagePreview && !banner?.mobileImageUrl ? (
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-lg hover:border-gray-500 transition-colors">
                <div className="space-y-1 text-center">
                  <Image className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-400">
                    <label className="relative cursor-pointer rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 px-2 py-1">
                      <span>Fayl yüklə</span>
                      <input
                        id="edit-banner-mobile-image-input"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleMobileImageChange}
                      />
                    </label>
                    <p className="pl-1">və ya sürükləyin</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="relative rounded-lg overflow-hidden border-2 border-gray-600">
                  <img
                    src={mobileImagePreview || `https://ecommerce100-001-site1.ntempurl.com/${banner?.mobileImageUrl}`}
                    alt="Mobile Preview"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                    <button
                      type="button"
                      onClick={handleRemoveMobileImage}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full transition-colors duration-200"
                    >
                      <Trash className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between rounded-lg p-3">
                  <div className="flex items-center space-x-3">
                    <Image className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-white font-medium">{mobileFile?.name || 'Mövcud mobil şəkil'}</p>
                      <p className="text-xs text-gray-400">
                        {mobileFile ? (mobileFile.size / 1024 / 1024).toFixed(2) : ''} {mobileFile ? 'MB' : ''}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveMobileImage}
                    className="text-indigo-400 hover:text-red-300 p-1"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-2">
                  <label className="relative cursor-pointer rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 px-3 py-2 text-sm inline-block">
                    <span>Şəkli dəyişdir</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleMobileImageChange}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isUpdateLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {isUpdateLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Yenilənir...
                </>
              ) : (
                "Banneri yenilə"
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Ləğv et
            </button>
          </div>
        </form>
      </div>
    );
  };

  const handleDeleteBanner = async (id) => {
    try {
      await deleteBanner({ id }).unwrap();
      toast.success("Banner uğurla silindi");
      refetch();
    } catch (error) {
      toast.error(error?.data || "Banneri silmək uğursuz oldu");
    }
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedBanner(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="text-white p-4 min-h-screen">
      <Modal open={modalType === "add"} setOpen={handleCloseModal}>
        <AddBannerModal isOpen={modalType === "add"} onClose={handleCloseModal} />
      </Modal>

      <Modal open={modalType === "edit"} setOpen={handleCloseModal}>
        <EditBannerModal
          isOpen={modalType === "edit"}
          onClose={handleCloseModal}
          banner={selectedBanner}
        />
      </Modal>

      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">{t('adminBanners.title')}</h2>
            <p className="text-gray-400">{t('adminBanners.subtitle')}</p>
          </div>
          <button
            onClick={() => setModalType("add")}
            className="md:px-6 md:py-3 px-4 py-2 bg-white text-sm md:text-base transition-all duration-300 rounded-lg font-semibold text-gray-900 shadow-lg transform hover:bg-gray-100 hover:scale-105 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {t('adminBanners.addBanner')}
          </button>
        </div>

        {isBannersLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {bannersD?.map((banner) => {
                return (
                  <div
                    key={banner.id}
                    className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="md:flex">
                      <div className="md:w-1/3 relative min-h-[180px] h-64 md:h-auto bg-gray-700">
                        <img
                          className="w-full h-full object-cover"
                          src={`https://ecommerce100-001-site1.ntempurl.com/${banner.imageUrl}`}
                          alt={banner.title}
                          onError={(e) => {
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect width='400' height='200' fill='%23374151'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239CA3AF' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E";
                          }}
                        />

                        <div className="absolute top-3 left-3">
                          <span className={`${banner.isActive ? 'bg-green-600' : 'bg-indigo-600'} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
                            {banner.isActive ? (t('adminProduct.active') || 'Aktiv') : (t('adminProduct.deactive') || 'Deaktiv')}
                          </span>
                        </div>
                      </div>

                      <div className="md:w-2/3 p-6 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="text-2xl font-bold text-white mb-2">
                                {banner.title}
                              </h3>
                              <p className="text-gray-400 text-base leading-relaxed">
                                {banner.description}
                              </p>
                            </div>

                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => {
                                  setModalType("edit");
                                  setSelectedBanner(banner);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 p-3 rounded-lg shadow-lg transform hover:scale-110 transition-all duration-200"
                              >
                                <Pen className="w-4 h-4 text-white" />
                              </button>
                              <button
                                onClick={() => handleDeleteBanner(banner.id)}
                                className="bg-indigo-600 hover:bg-indigo-700 p-3 rounded-lg shadow-lg transform hover:scale-110 transition-all duration-200"
                              >
                                <Trash className="w-4 h-4 text-white" />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {banner.linkUrl && (
                              <div className="flex items-center text-sm">
                                <span className="text-gray-400 w-20">Link:</span>
                                <a
                                  href={banner.linkUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:text-blue-300 hover:underline"
                                >
                                  {banner.linkUrl}
                                </a>
                              </div>
                            )}

                            <div className="flex items-center text-sm">
                              <span className="text-gray-400 w-20">{t('adminProduct.createdAt') || 'Yaradılıb'}:</span>
                              <span className="text-gray-300">
                                {formatDate(banner.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {bannersD && bannersD.length === 0 && (
              <div className="text-center py-20">
                <Image className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">{t('adminBanners.noBanners') || 'Banner tapılmadı'}</h3>
                <p className="text-gray-500 mb-6">{t('adminBanners.clickToCreate') || 'İlk bannerinizi yaradaraq başlayın'}</p>
                <button
                  onClick={() => setModalType("add")}
                  className="px-6 py-3 bg-white transition rounded-lg font-semibold text-gray-900 hover:bg-gray-100"
                >
                  {t('adminBanners.addBanner')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BannersUI;

