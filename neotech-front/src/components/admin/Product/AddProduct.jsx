import { useEffect, useState } from "react";
import { X, Upload, Trash2, Plus, FileText } from "lucide-react";
import { useAddDetailImagesMutation, useAddProductMutation, useGetCategoriesQuery, useGetUserRolesQuery, useAddProductPdfMutation, useGetProductPdfsQuery, useGetBrandsQuery, useGetBrandQuery, useGetProductsBrandQuery } from "../../../store/API";
import { toast } from "react-toastify";
import { WiRefresh } from "react-icons/wi";
import { useTranslation } from "react-i18next";

const ProductFormUI = ({setOpen}) => {
  const { t } = useTranslation();

  const { data: userRoles, error, isRolesLoading, refetch } = useGetUserRolesQuery();

  // Map user role IDs to localized names
  const getRoleName = (roleId) => {
    const roleNames = {
      1: t("adminProduct.roles.general"),
      2: t("adminProduct.roles.wholesale"),
      3: t("adminProduct.roles.dealer"),
      4: t("adminProduct.roles.exclusiveDealer")
    };
    return roleNames[roleId] || userRoles?.[roleId]?.name || `Role ${roleId}`;
  };
  const { data: categories, isLoading, errorC } = useGetCategoriesQuery();
  const [sortedCat, setSortedCat] = useState([]);
  
  useEffect(() => {
    if (categories) {
      setSortedCat([...categories].sort((a, b) => a.name.localeCompare(b.name)));
    }
  }, [categories]);
  const { data: brands, isLoading: isBrandsLoading } = useGetBrandsQuery();
  const { data: brand, isLoading: isBrandLoading } = useGetBrandQuery("1cd62de1-35cd-4d90-b767-dc1a443bdb3f");
  const { data: brandPr, isLoading: is } = useGetProductsBrandQuery({brandSlug: "hp"});


  const { data: pdfs} = useGetProductPdfsQuery();
  const [addProduct, { isLoading: isProductLoading }] = useAddProductMutation(); 
  const [addDetailImages, { isLoading: isDetailLoading }] = useAddDetailImagesMutation(); 
  const [addProductPdf, { isLoading: isPdfLoading }] = useAddProductPdfMutation();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    shortDescription: "",
    sku: "",
    isHotDeal: false,
    stockQuantity: 0,
    categoryId: "",
    brandId: "",
    prices: [1, 2, 3, 4].map((role) => {
      const price = 0;
      return {
        userRole: role,
        price,
        discountedPrice: price, 
        discountPercentage: 0
      };
    })
  });





  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]); 
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfDescription, setPdfDescription] = useState("");
  const [pdfCustomName, setPdfCustomName] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [imageUrls, setImageUrls] = useState([]); 

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

  // Multiple files preview
  useEffect(() => {
    if (files && files.length > 0) {
      const urls = Array.from(files).map(file => URL.createObjectURL(file));
      setImageUrls(urls);

      return () => {
        urls.forEach(url => URL.revokeObjectURL(url));
      };
    } else {
      setImageUrls([]);
    }
  }, [files]);

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0]; 
    if (!selectedFile) return;

    setFile(selectedFile);
    e.target.value = ""; 
  };

  const handleMultipleFileUpload = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles || selectedFiles.length === 0) return;

    setFiles(prev => [...prev, ...selectedFiles]);
    e.target.value = ""; 
  };

  const handlePdfUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      toast.error(t("adminProduct.pleaseUploadOnlyPdf"));
      return;
    }

    setPdfFile(selectedFile);
    e.target.value = "";
  };

  const removeDetailImage = (indexToRemove) => {
    setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const removePdfFile = () => {
    setPdfFile(null);
    setPdfDescription("");
    setPdfCustomName("");
  };

  const close = () => {
    setFormData({
      name: "",
      description: "",
      shortDescription: "",
      sku: "",
      isHotDeal: false,
      stockQuantity: 0,
      categoryId: "",
      brandId: "",
      prices: [
        {
          userRole: 1,
          price: 0,
          discountedPrice: 0,
          discountPercentage: 0
        },
        {
          userRole: 2,
          price: 0,
          discountedPrice: 0,
          discountPercentage: 0
        },
        {
          userRole: 3,
          price: 0,
          discountedPrice: 0,
          discountPercentage: 0
        },
        {
          userRole: 4,
          price: 0,
          discountedPrice: 0,
          discountPercentage: 0
        }
      ]
    });
    setFile(null);
    setFiles([]);
    setPdfFile(null);
    setPdfDescription("");
    setPdfCustomName("");
    setOpen(false);
  }

  const handleProductFormData = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error(t("adminProduct.pleaseUploadImage"));
      return;
    }

    try {
      const formDataToSend = new FormData();
      const productDataString = JSON.stringify(formData);
      formDataToSend.append("productData", productDataString); 
      formDataToSend.append("imageFile", file, file.name);

      
      // Add the product first
      const result = await addProduct(formDataToSend).unwrap();

      // If there are detail images, upload them
      if (files.length > 0) {
        const detailImagesFormData = new FormData();

        files.forEach(file => {
          detailImagesFormData.append("imageFiles", file, file.name);
        });

        const resultDetail = await addDetailImages({
          id: result.id,
          images: detailImagesFormData  
        }).unwrap();
      }

      // If there is a PDF file, upload it
      if (pdfFile) {
        const pdfFormData = new FormData();
        pdfFormData.append("ProductId", result.id);
        pdfFormData.append("PdfFile", pdfFile, pdfFile.name);
        
        if (pdfCustomName) {
          pdfFormData.append("CustomFileName", pdfCustomName);
        }
        
        if (pdfDescription) {
          pdfFormData.append("Description", pdfDescription);
        }
        
        pdfFormData.append("IsActive", "true");

        await addProductPdf({
          productId: result.id,
          formData: pdfFormData
        }).unwrap();
      }

      toast.success(t("adminProduct.productAddedSuccess"));
      close();
    } catch (error) {
      toast.error(error?.data || error?.message || t("adminProduct.somethingWentWrong"));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name == "stockQuantity" ? Number(value) : value
    }));
  };

  const handlePriceChange = (value, field, index) => {
    setFormData((prev) => {
      const updatedPrices = prev.prices.map((priceObj, i) => {
        if (i === index) {
          const updatedObj = { ...priceObj, [field]: parseFloat(value) || 0 };

          const price = updatedObj.price;
          const discountedPrice = updatedObj.discountedPrice;
          const discountPercentage =
            price > 0
              ? Math.round(((price - discountedPrice) / price) * 100)
              : 0;

          return { ...updatedObj, discountPercentage };
        }
        return priceObj;
      });

      return { ...prev, prices: updatedPrices };
    });
  };

  return (
    <div className="bg-[#1f1f1f] text-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto dark-scrollbar">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t("adminProduct.addNewProduct")}</h2>
      </div>

      <div className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("adminProduct.productName")} *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 bg-[#2c2c2c] border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={t("adminProduct.productNamePlaceholder")}
            />
          </div>

          {/* SKU */}
          <div>
            <label className="block text-sm font-medium mb-2">{t("adminProduct.sku")} *</label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 bg-[#2c2c2c] border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={t("adminProduct.skuPlaceholder")}
            />
          </div>

          {/* Stock Quantity */}
          <div>
            <label className="block text-sm font-medium mb-2">{t("adminProduct.stockQuantity")} *</label>
            <input
              type="number"
              name="stockQuantity"
              value={formData.stockQuantity === 0 ? '' : formData.stockQuantity}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 bg-[#2c2c2c] border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="0"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">{t("adminProduct.category")} *</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 dark-scrollbar bg-[#2c2c2c] border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="" disabled>{t("adminProduct.selectCategory")}</option>
              {sortedCat?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Brand */}
          <div>
            <label className="block text-sm font-medium mb-2">{t("adminProduct.brand")} *</label>
            <select
              name="brandId"
              value={formData.brandId}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 bg-[#2c2c2c] border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">{t("adminProduct.selectBrand")}</option>
              {brands?.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Hot Deal Toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isHotDeal"
            name="isHotDeal"
            checked={formData.isHotDeal}
            onChange={handleInputChange}
            className="w-4 h-4 text-indigo-600 bg-[#2c2c2c] border-gray-600 rounded focus:ring-indigo-500 focus:ring-2"
          />
          <label htmlFor="isHotDeal" className="text-sm font-medium">
            {t("adminProduct.markAsHotDeal")}
          </label>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">{t("adminProduct.description")}</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="4"
            className="w-full px-3 py-2 bg-[#2c2c2c] border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder={t("adminProduct.descriptionPlaceholder")}
          />
        </div>

        {/* Short Description */}
        <div>
          <label className="block text-sm font-medium mb-2">{t("adminProduct.shortDescription")}</label>
          <textarea
            name="shortDescription"
            value={formData.shortDescription}
            onChange={handleInputChange}
            rows="2"
            className="w-full px-3 py-2 bg-[#2c2c2c] border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder={t("adminProduct.shortDescriptionPlaceholder")}
          />
        </div>

        {/* Pricing Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium">{t("adminProduct.pricesByUserRole")}</label>
          </div>
          <div className="border border-gray-600 rounded-md">
            {formData.prices.map((item, index) => (
              <div key={index} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 p-4 bg-[#2c2c2c] rounded-t-md">
                  {/* User Role */}
                  <div className="flex items-center">
                    <label className="block text-md font-medium mb-1">{getRoleName(index + 1)}</label>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-xs font-medium mb-1">{t("adminProduct.price")}</label>
                    <input
                      type="number"
                      value={item.price === 0 ? '' : item.price}
                      onChange={(e) => handlePriceChange(e.target.value, 'price', index)}
                      min="0"
                      step="1"
                      className="w-full px-2 py-2 bg-[#1f1f1f] border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Discounted Price */}
                  <div>
                    <label className="block text-xs font-medium mb-1 whitespace-nowrap">{t("adminProduct.discountedPrice")}</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={item.discountedPrice === 0 ? '' : item.discountedPrice}
                      onChange={(e) => handlePriceChange(e.target.value, 'discountedPrice', index)}
                      className="w-full px-2 py-2 bg-[#1f1f1f] border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium mb-2">{t("adminProduct.productImages")}</label>
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
                {t("adminProduct.uploadImage")}
              </span>
              <span className="text-sm text-gray-500">
                {t("adminProduct.imageFormats")}
              </span>
            </label>
          </div>

          {/* Image Previews */}
          {file && 
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="relative group">
                <img
                  src={imageUrl}
                  alt="Product preview"
                  className="w-full h-24 object-cover rounded-md border "
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

        {/* Detailed Images */}
        <div>
          <label className="block text-sm font-medium mb-2">{t("adminProduct.detailedImages")}</label>
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleMultipleFileUpload}
              className="hidden"
              id="detail-image-upload"
            />
            <label
              htmlFor="detail-image-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="text-gray-400">
                {t("adminProduct.uploadDetailedImages")}
              </span>
              <span className="text-sm text-gray-500">
                {t("adminProduct.imageFormats")}
              </span>
            </label>
          </div>

          {/* Multiple Image Previews */}
          {files.length > 0 && 
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {files.map((file, index) => (
                <div key={index} className="relative group">
                  <img
                    src={imageUrls[index]}
                    alt={`Detail preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md border "
                  />
                  <button
                    type="button"
                    onClick={() => removeDetailImage(index)}
                    className="absolute top-1 right-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          }
        </div>

        {/* PDF Upload Section */}
        <div>
          <label className="block text-sm font-medium mb-2">{t("adminProduct.productSpecificationPdf")}</label>
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
            <input
              type="file"
              accept="application/pdf"
              onChange={handlePdfUpload}
              className="hidden"
              id="pdf-upload"
            />
            <label
              htmlFor="pdf-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <FileText className="w-8 h-8 text-gray-400" />
              <span className="text-gray-400">
                {t("adminProduct.clickToUploadPdf")}
              </span>
              <span className="text-sm text-gray-500">
                {t("adminProduct.pdfFormat")}
              </span>
            </label>
          </div>

          {/* PDF Preview and Details */}
          {pdfFile && 
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3 p-4 bg-[#2c2c2c] rounded-md">
                <FileText className="w-8 h-8 text-indigo-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{pdfFile.name}</p>
                  <p className="text-xs text-gray-400">
                    {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={removePdfFile}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* PDF Custom Name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t("adminProduct.customFileName")}
                </label>
                <input
                  type="text"
                  value={pdfCustomName}
                  onChange={(e) => setPdfCustomName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#2c2c2c] border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder={t("adminProduct.customPdfNamePlaceholder")}
                />
              </div>

              {/* PDF Description */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t("adminProduct.pdfDescription")}
                </label>
                <textarea
                  value={pdfDescription}
                  onChange={(e) => setPdfDescription(e.target.value)}
                  rows="2"
                  className="w-full px-3 py-2 bg-[#2c2c2c] border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder={t("adminProduct.pdfDescriptionPlaceholder")}
                />
              </div>
            </div>
          }
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => close()}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-md font-semibold"
            disabled={isProductLoading || isDetailLoading || isPdfLoading}
          >
            {t("adminProduct.cancel")}
          </button>
          <button
            type="button"
            onClick={handleProductFormData}
            disabled={isProductLoading || isDetailLoading || isPdfLoading}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProductLoading || isDetailLoading || isPdfLoading ? t("adminProduct.adding") : t("adminProduct.addProduct")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductFormUI;
