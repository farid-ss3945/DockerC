import React, { useEffect, useState } from 'react';
import { useEditProductWithImageMutation, useGetCategoriesQuery, useGetBrandsQuery, useGetProductQuery, useGetUserRolesQuery, useDeleteDetailImageMutation, useDeleteProductImageMutation } from '../../../store/API';
import { toast } from 'react-toastify';
import { ClockFading } from 'lucide-react';
import { useTranslation } from "react-i18next";

const EditProduct = ({ setOpen, idPr }) => {
  const { t } = useTranslation();
  const { data: edit, isLoading: loading } = useGetProductQuery(idPr, { skip: !idPr });
  const [editProductWithImage, { isLoading: isEditLoading }] = useEditProductWithImageMutation();
  const [deleteDetailImage] = useDeleteProductImageMutation();
  const { data: categories } = useGetCategoriesQuery();
  const [sortedCat, setSortedCat] = useState([]);
  
  useEffect(() => {
    if (categories) {
      setSortedCat([...categories].sort((a, b) => a.name.localeCompare(b.name)));
    }
  }, [categories]);
  const { data: brands } = useGetBrandsQuery();
  const { data: userRoles } = useGetUserRolesQuery();

  // Map user role IDs to localized names
  const getRoleName = (roleId) => {
    const roleNames = {
      1: t("adminProduct.roles.general"),
      2: t("adminProduct.roles.wholesale"),
      3: t("adminProduct.roles.dealer"),
      4: t("adminProduct.roles.exclusiveDealer")
    };
    return roleNames[roleId] !== undefined ? roleNames[roleId] : (userRoles?.[roleId]?.name || `Role ${roleId}`);
  };

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [shouldUpdatePdf, setShouldUpdatePdf] = useState(false);
  
  // Gallery/Detail images
  const [existingGalleryImages, setExistingGalleryImages] = useState([]);
  const [newGalleryFiles, setNewGalleryFiles] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    sku: '',
    isActive: true,
    isHotDeal: false,
    stockQuantity: 0,
    categoryId: '',
    brandId: '',
    prices: [
      { userRole: 0, price: 0, discountedPrice: 0, discountPercentage: 0 },
      { userRole: 1, price: 0, discountedPrice: 0, discountPercentage: 0 },
      { userRole: 2, price: 0, discountedPrice: 0, discountPercentage: 0 },
      { userRole: 3, price: 0, discountedPrice: 0, discountPercentage: 0 }
    ]
  });


  // Initialize form with edit data
  useEffect(() => {
    if (edit && edit.id) {
      const pricesArray = edit.prices && edit.prices.length > 0
        ? edit.prices.map(p => ({
            userRole: p.userRole,
            price: p.price || 0,
            discountedPrice: p.discountedPrice || 0,
            discountPercentage: p.discountPercentage || 0
          }))
        : [
            { userRole: 0, price: 0, discountedPrice: 0, discountPercentage: 0 },
            { userRole: 1, price: 0, discountedPrice: 0, discountPercentage: 0 },
            { userRole: 2, price: 0, discountedPrice: 0, discountPercentage: 0 },
            { userRole: 3, price: 0, discountedPrice: 0, discountPercentage: 0 }
          ];

      setFormData({
        name: edit.name || '',
        description: edit.description || '',
        shortDescription: edit.shortDescription || '',
        sku: edit.sku || '',
        isActive: Boolean(edit.isActive),
        isHotDeal: Boolean(edit.isHotDeal),
        stockQuantity: edit.stockQuantity || 0,
        categoryId: edit.categoryId || '',
        brandId: edit.brandId || '',
        prices: pricesArray
      });

      if (edit.imageUrl) setImagePreview(edit.imageUrl);
      if (edit.images && edit.images.length > 0) setExistingGalleryImages(edit.images);
    }
  }, [edit]);

  // Input handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name === 'stockQuantity' ? Number(value) : value
    }));
  };

  const handlePriceChange = (value, field, index) => {
    setFormData(prev => {
      const updatedPrices = prev.prices.map((priceObj, i) => {
        if (i === index) {
          const updated = { ...priceObj, [field]: parseFloat(value) || 0 };
          const price = updated.price;
          const discountedPrice = updated.discountedPrice;
          const discountPercentage = price > 0 ? Math.round(((price - discountedPrice) / price) * 100) : 0;
          return { ...updated, discountPercentage };
        }
        return priceObj;
      });
      return { ...prev, prices: updatedPrices };
    });
  };

  // Main image handlers
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error(t("adminProduct.pleaseSelectValidImage"));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t("adminProduct.imageSizeLimit"));
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(edit?.imageUrl || null);
  };

  // PDF handlers
  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error(t("adminProduct.pleaseSelectValidPdf"));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t("adminProduct.pdfSizeLimit"));
        return;
      }
      setPdfFile(file);
      setShouldUpdatePdf(true);
    }
  };

  const removePdf = () => {
    setPdfFile(null);
    setShouldUpdatePdf(false);
  };

  // Gallery/Detail images handlers
  const handleGalleryImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} ${t("adminProduct.pleaseSelectValidImage")}`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} ${t("adminProduct.imageSizeLimit")}`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setNewGalleryFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeExistingGalleryImage = (index) => {
    const imageToRemove = existingGalleryImages[index];
    setImagesToDelete(prev => [...prev, imageToRemove]);
    setExistingGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewGalleryFile = (index) => {
    setNewGalleryFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleProductEdit = async (e) => {
  e.preventDefault();

  try {
    if (imagesToDelete.length > 0) {
      for (const image of imagesToDelete) {
        try {
          await deleteDetailImage({
            id: image.id,
          }).unwrap();
        } catch (error) {
        }
      }
    }

    const productData = {
      name: formData.name,
      description: formData.description ,
      shortDescription: formData.shortDescription,
      sku: formData.sku,
      isActive: formData.isActive,
      isHotDeal: formData.isHotDeal,
      stockQuantity: formData.stockQuantity,
      categoryId: formData.categoryId,
      brandId: formData.brandId,
      prices: formData.prices,
    };

    const formDataToSend = new FormData();
    formDataToSend.append('productData', JSON.stringify(productData));

    if (imageFile) {
      formDataToSend.append('imageFile', imageFile);
    }

    if (shouldUpdatePdf && pdfFile) {
      formDataToSend.append('pdfFile', pdfFile);
    }

    if (newGalleryFiles.length > 0) {
      newGalleryFiles.forEach((file) => {
        formDataToSend.append('detailImageFiles', file);
      });
    }

    const result = await editProductWithImage({
      id: idPr,
      formData: formDataToSend,
    }).unwrap();

    setImageFile(null);
    setPdfFile(null);
    setShouldUpdatePdf(false);
    setNewGalleryFiles([]);
    setImagesToDelete([]);

    toast.success(t("adminProduct.productUpdatedSuccess"));
    setOpen();
  } catch (error) {
    console.error('Edit error:', error);
  }
};


  if (loading) {
    return (
      <div className="bg-[#1f1f1f] text-white p-6 rounded-lg max-w-4xl w-full flex items-center justify-center">
        <p>{t("adminProduct.loadingProduct")}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1f1f1f] text-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto dark-scrollbar">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t("adminProduct.editProduct")}</h2>
      </div>

      <div className="space-y-6">
        {/* Main Product Image */}
        <div>
          <label className="block text-sm font-medium mb-2">{t("adminProduct.mainImage")}</label>
          <div className="flex items-center gap-4">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imageFile ? imagePreview : `https://ecommerce100-001-site1.ntempurl.com${imagePreview}`}
                  alt="Product preview"
                  className="w-32 h-32 object-cover rounded-md border border-gray-600"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-6 h-6 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="w-32 h-32 bg-[#2c2c2c] border-2 border-dashed border-gray-600 rounded-md flex items-center justify-center">
                <span className="text-gray-500 text-sm">{t("adminProduct.noImage")}</span>
              </div>
            )}
            <div className="flex-1">
              <input
                type="file"
                id="imageFile"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <label
                htmlFor="imageFile"
                className="inline-block px-4 py-2 bg-[#2c2c2c] hover:bg-[#3c3c3c] border border-gray-600 rounded-md cursor-pointer transition-colors"
              >
                {imageFile ? t("adminProduct.changeImage") : t("adminProduct.uploadPdf")}
              </label>
              <p className="text-xs text-gray-400 mt-2">{t("adminProduct.imageFormats")}</p>
            </div>
          </div>
        </div>

        {/* PDF Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">{t("adminProduct.productSpecificationPdf")}</label>
          <div className="flex items-center gap-4">
            {edit?.pdfUrl && !pdfFile && (
              <a
                href={`https://ecommerce100-001-site1.ntempurl.com${edit.pdfUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 text-sm underline"
              >
                {t("adminProduct.viewCurrentPdf")}
              </a>
            )}
            <div className="flex-1">
              <input
                type="file"
                id="pdfFile"
                accept="application/pdf"
                onChange={handlePdfChange}
                className="hidden"
              />
              <label
                htmlFor="pdfFile"
                className="inline-block px-4 py-2 bg-[#2c2c2c] hover:bg-[#3c3c3c] border border-gray-600 rounded-md cursor-pointer transition-colors"
              >
                {pdfFile ? `${t("adminProduct.selected")}: ${pdfFile.name}` : edit?.pdfUrl ? t("adminProduct.changePdf") : t("adminProduct.uploadPdf")}
              </label>
              {pdfFile && (
                <button
                  type="button"
                  onClick={removePdf}
                  className="ml-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-sm"
                >
                  {t("adminProduct.remove")}
                </button>
              )}
              <p className="text-xs text-gray-400 mt-2">{t("adminProduct.pdfFormat")}</p>
            </div>
          </div>
        </div>

        {/* Detail Images (Gallery) */}
        <div>
          <label className="block text-sm font-medium mb-2">{t("adminProduct.detailedImages")}</label>

          {existingGalleryImages.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-2">{t("adminProduct.currentImages")}</p>
              <div className="grid grid-cols-4 gap-4">
                {existingGalleryImages.map((image, index) => {
                  return (
                    <div key={image.id} className="relative">
                      <img
                        src={`https://ecommerce100-001-site1.ntempurl.com${image.imageUrl}`}
                        alt={`Detail ${index + 1}`}
                        className="w-full h-32 object-cover rounded-md border border-gray-600"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingGalleryImage(index)}
                        className="absolute -top-2 -right-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                )})}
              </div>
            </div>
          )}

          {newGalleryFiles.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-2">{t("adminProduct.newImages")}</p>
              <div className="grid grid-cols-4 gap-4">
                {newGalleryFiles.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`New ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md border border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewGalleryFile(index)}
                      className="absolute -top-2 -right-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <input
              type="file"
              id="galleryImages"
              accept="image/*"
              multiple
              onChange={handleGalleryImagesChange}
              className="hidden"
            />
            <label
              htmlFor="galleryImages"
              className="inline-block px-4 py-2 bg-[#2c2c2c] hover:bg-[#3c3c3c] border border-gray-600 rounded-md cursor-pointer transition-colors"
            >
              {t("adminProduct.uploadDetailedImages")}
            </label>
            <p className="text-xs text-gray-400 mt-2">{t("adminProduct.imageFormats")}</p>
          </div>
        </div>

        {/* Basic Product Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">{t("adminProduct.productName")} *</label>
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

          <div>
            <label className="block text-sm font-medium mb-2">{t("adminProduct.sku")}</label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-[#2c2c2c] border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={t("adminProduct.skuPlaceholder")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t("adminProduct.category")} *</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 bg-[#2c2c2c] border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">{t("adminProduct.selectCategory")}</option>
              {sortedCat?.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

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
              {brands?.map(brand => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t("adminProduct.stockQuantity")} *</label>
            <input
              type="number"
              name="stockQuantity"
              value={formData.stockQuantity}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 bg-[#2c2c2c] border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="0"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-6">
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

        </div>

        {/* Descriptions */}
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
          <label className="block text-sm font-medium mb-4">{t("adminProduct.pricesByUserRole")}</label>
          <div className="border border-gray-600 rounded-md">
            {formData.prices.length > 0 && userRoles ? (
              formData.prices.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-[#2c2c2c] border-b border-gray-600 last:border-b-0">
                  <div className="flex items-center">
                    <label className="block text-md font-medium">
                      {getRoleName(item.userRole)}
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">{t("adminProduct.price")}</label>
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => handlePriceChange(e.target.value, 'price', index)}
                      min="0"
                      step="0.01"
                      className="w-full px-2 py-2 bg-[#1f1f1f] border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">{t("adminProduct.discountedPrice")}</label>
                    <input
                      type="number"
                      value={item.discountedPrice}
                      onChange={(e) => handlePriceChange(e.target.value, 'discountedPrice', index)}
                      min="0"
                      step="0.01"
                      className="w-full px-2 py-2 bg-[#1f1f1f] border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">{t("adminProduct.discountPercentage")}</label>
                    <input
                      type="number"
                      value={item.discountPercentage}
                      readOnly
                      className="w-full px-2 py-2 bg-[#1f1f1f] border border-gray-600 rounded-md text-sm text-gray-400"
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-400">{t("itemsFoundPr", { count: 0 })}...</div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={setOpen}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-md font-semibold transition-colors"
          >
            {t("adminProduct.cancel")}
          </button>
          <button
            type="button"
            onClick={handleProductEdit}
            disabled={isEditLoading}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isEditLoading ? t("adminProduct.updating") : t("adminProduct.updateProduct")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;

