import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  ArrowLeft, 
  Edit, 
  Plus, 
  Trash2, 
  Settings, 
  Package, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  DollarSign,
  FileText,
  Download
} from 'lucide-react';
import { 
  useGetProductQuery, 
  useGetProductSpecificationsQuery,
  useAddProductSpecificationsMutation,
  useUpdateProductSpecificationsMutation,
  useDeleteProductSpecificationsMutation,
  useGetProductPdfsQuery,
  useDeleteProductPdfMutation
} from '../../store/API';
import { toast } from 'react-toastify';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editingSpecs, setEditingSpecs] = useState(false);
  const [specificationGroups, setSpecificationGroups] = useState([]);

  // API hooks
  const { data: product, isLoading: productLoading } = useGetProductQuery(id);
  
  const { data: specifications, isLoading: specsLoading, refetch: refetchSpecs } = useGetProductSpecificationsQuery(id);
  const [addSpecs, { isLoading: adding }] = useAddProductSpecificationsMutation();
  const [updateSpecs, { isLoading: updating }] = useUpdateProductSpecificationsMutation();
  const [deleteSpecs] = useDeleteProductSpecificationsMutation();

  // PDF hooks
  const { data: pdfs, isLoading: pdfsLoading, refetch: refetchPdfs } = useGetProductPdfsQuery();
  const [deleteProductPdf, { isLoading: deletingPdf }] = useDeleteProductPdfMutation();

  // Filter PDFs for this product
  const productPdfs = pdfs?.filter(pdf => pdf.productId === id) || [];

  React.useEffect(() => {
    if (specifications?.specificationGroups) {
      setSpecificationGroups(specifications.specificationGroups);
    } else if (editingSpecs && specificationGroups.length === 0) {
      // Initialize with empty group when starting to add specs
      setSpecificationGroups([
        {
          groupName: '',
          items: [{ name: '', value: '', unit: '', type: 0 }]
        }
      ]);
    }
  }, [specifications, editingSpecs]);

  // Specification editing functions
  const addSpecGroup = () => {
    setSpecificationGroups([
      ...specificationGroups,
      {
        groupName: '',
        items: [{ name: '', value: '', unit: '', type: 0 }]
      }
    ]);
  };

  const removeSpecGroup = (groupIndex) => {
    setSpecificationGroups(prev => 
      prev.length > 1 
        ? prev.filter((_, index) => index !== groupIndex) 
        : prev
    );
  };


  const updateGroupName = (groupIndex, groupName) => {
    const updated = [...specificationGroups];
    updated[groupIndex].groupName = groupName;
    setSpecificationGroups(updated);
  };

  const addItemToGroup = (groupIndex) => {
    setSpecificationGroups(prev => 
      prev.map((group, index) => 
        index === groupIndex
          ? { ...group, items: [...group.items, { name: '', value: '', unit: '', type: 0 }] }
          : group
      )
    );
  };


  const removeItemFromGroup = (groupIndex, itemIndex) => {
    setSpecificationGroups(prev =>
      prev.map((group, gIndex) =>
        gIndex === groupIndex
          ? {
              ...group,
              items:
                group.items.length > 1
                  ? group.items.filter((_, i) => i !== itemIndex)
                  : group.items,
            }
          : group
      )
    );
  };


  const updateItem = (groupIndex, itemIndex, field, value) => {
    const updated = [...specificationGroups];
    updated[groupIndex].items[itemIndex][field] = value;
    setSpecificationGroups(updated);
  };

  // Handle save specifications
  const handleSaveSpecs = async () => {
    const isValid = specificationGroups.every(group => 
      group.groupName.trim() !== '' && 
      group.items.every(item => item.name.trim() !== '' && item.value.trim() !== '')
    );

    if (!isValid) {
      toast.error('Zəhmət olmasa bütün sahələri doldurun');
      return;
    }

    try {
      if (specifications?.specificationGroups) {
        // Update existing specifications
        await updateSpecs({
          id: id,
          specificationGroups: specificationGroups
        }).unwrap();
        toast.success('Spesifikasiyalar uğurla yeniləndi!');
      } else {
        // Add new specifications
        await addSpecs({
          id: id,
          productId: id,
          specificationGroups: specificationGroups
        }).unwrap();
        toast.success('Spesifikasiyalar uğurla əlavə olundu!');
      }
      
      setEditingSpecs(false);
      refetchSpecs();
    } catch (error) {
      toast.error(error?.data?.message || 'Spesifikasiyalar saxlanılmadı');
    }
  };

  const handleDeleteSpecs = async () => {
      try {
        await deleteSpecs({ id }).unwrap();
        toast.success('Spesifikasiyalar silindi');
        setEditingSpecs(false);
        refetchSpecs();
      } catch (error) {
        toast.error('Spesifikasiyaları silmək mümkün olmadı');
      }
  };

  // Handle PDF deletion
  const handleDeletePdf = async (pdfId) => {
      try {
        await deleteProductPdf({ id: pdfId }).unwrap();
        toast.success('PDF uğurla silindi');
        refetchPdfs();
      } catch (error) {
        toast.error(error?.data?.message || 'PDF silinmədi');
      }
  };

  if (productLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Yüklənir...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Məhsul tapılmadı</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818] text-white">
      {/* Header */}
      <div className=" border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/admin/products')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Məhsullara qayıt
          </button>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">Məhsul ID: {product.id}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Product Management Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Image */}
          <div className="bg-white rounded-xl overflow-hidden">
            <img
              src={`https://ecommerce100-001-site1.ntempurl.com/${product.imageUrl}`}
              alt={product.name}
              className="w-full object-contain h-full max-h-[500px]"
              onError={(e) => {
                e.target.src = "/Icons/logo.svg";
                const parentDiv = e.target.closest("div");
                if (parentDiv) {
                  parentDiv.className = "bg-white rounded-xl overflow-hidden";
                }
              }}
            />
          </div>

          {/* Product Management Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{product.name}</h1>
              <p className="text-gray-400">Slug: {product.slug}</p>
            </div>

            {/* Product Status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {product.isActive ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-indigo-400" />
                )}
                <span className={`font-medium ${product.isActive ? 'text-green-400' : 'text-indigo-400'}`}>
                  {product.isActive ? 'Aktiv' : 'Deaktiv'}
                </span>
              </div>
              
              {product.isHotDeal && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-400" />
                  <span className="text-orange-400 font-medium">Xüsusi təklif</span>
                </div>
              )}
            </div>

            {/* Pricing Information */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Qiymətlər
              </h3>
              <div className="grid grid-cols-2 gap-4">
                
                <div className='flex flex-col justify-between'>
                  <p className="text-gray-400 text-sm">Orjinal qiymət</p>
                  <p className="text-2xl font-bold text-green-400">{product?.prices[0].discountedPrice} AZN</p>
                </div>
                <div className='flex flex-col justify-between'>
                  <p className="text-gray-400 text-sm">Topdan qiyməti</p>
                  <p className="text-2xl font-bold text-green-400">{product?.prices[1]?.discountedPrice} AZN</p>
                </div>
                <div className='flex flex-col justify-between'>
                  <p className="text-gray-400 text-sm">Diller qiyməti</p>
                  <p className="text-2xl font-bold text-green-400">{product.prices[2]?.discountedPrice} AZN</p>
                </div>
                <div className='flex flex-col justify-between'>
                  <p className="text-gray-400 text-sm">Eksklüziv qiyməti</p>
                  <p className="text-2xl font-bold text-green-400">{product.prices[3]?.discountedPrice} AZN</p>
                </div>
              </div>
            </div>

            {/* Inventory Information */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Anbar məlumatı
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Stok miqdarı</p>
                  <p className="text-xl font-bold text-white">{product.stockQuantity}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Vəziyyət</p>
                  <p className={`font-medium ${
                    product.stockQuantity === 0 ? 'text-indigo-400' :
                    product.stockQuantity <= 10 ? 'text-orange-400' : 'text-green-400'
                  }`}>
                    {product.stockQuantity === 0 ? 'Stokda yoxdur' :
                     product.stockQuantity <= 10 ? 'Az stok' : 'Stokda var'}
                  </p>
                </div>
              </div>
            </div>

            

          
          </div>
          
          {/* Product Details */}
          <div className="bg-gray-800 col-span-2 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Məhsul Məlumatları</h3>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Kateqoriya</p>
                <p className="text-white">{product.categoryName || 'Kateqoriyasız'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Açıqlama</p>
                <p className="text-gray-300">{product.description}</p>
              </div>
              {product.shortDescription && (
                <div>
                  <p className="text-gray-400 text-sm">Qısa açıqlama</p>
                  <p className="text-gray-300">{product.shortDescription}</p>
                </div>
              )}
            </div>
          </div>

          {/* Product Images Gallery */}
          {product.images && product.images.length > 0 && (
            <div className="bg-gray-800 col-span-2 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Məhsul şəkilləri ({product.images.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-square bg-gray-700 rounded-lg overflow-hidden">
                      <img
                        src={`https://ecommerce100-001-site1.ntempurl.com/${image.imageUrl}`}
                        alt={image.altText || `Product image ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = "/placeholder-image.jpg";
                        }}
                      />
                    </div>
                    {image.isPrimary && (
                      <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-md font-semibold">
                        Əsas
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 bg-gray-900/80 text-white text-xs px-2 py-1 rounded">
                      #{image.sortOrder}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PDF Documents Section */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Məhsul faylları
            </h2>
          </div>

          {pdfsLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-400">Fayllar yüklənir</div>
            </div>
          ) : productPdfs.length > 0 ? (
            <div className="space-y-4">
              {productPdfs.map((pdf) => {
                return (
                <div key={pdf.id} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-600 rounded-lg p-3">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">
                        {pdf.originalFileName || pdf.filename}
                      </h3>
                      {pdf.description && (
                        <p className="text-gray-400 text-sm mt-1">{pdf.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>{(pdf.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                        <span>Yüklənmə sayı: {pdf.downloadCount}</span>
                        {pdf.isActive ? (
                          <span className="text-green-400">Aktiv</span>
                        ) : (
                          <span className="text-indigo-400">Deaktiv</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://ecommerce100-001-site1.ntempurl.com/${pdf.filePath}`}
                      download
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      title="PDF yüklə"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDeletePdf(pdf.id)}
                      disabled={deletingPdf}
                      className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
                      title="PDF sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )})}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">Heç bir sənəd yüklənməyib</h3>
              <p className="text-gray-500">Məhsul sənədləri yükləndikdən sonra burada görünəcək</p>
            </div>
          )}
        </div>

        {/* Specifications Section */}
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Settings className="w-6 h-6" />
              Məhsul Spesifikasiyaları
            </h2>
            
            <div className="flex items-center gap-3">
              {!editingSpecs ? (
                <>
                  {specifications?.specificationGroups && (
                    <button
                      onClick={handleDeleteSpecs}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Hamısını sil
                    </button>
                  )}
                  <button
                    onClick={() => setEditingSpecs(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                  >
                    {specifications?.specificationGroups ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {specifications?.specificationGroups ? 'Redaktə et' : 'Əlavə et'} Spesifikasiyalar
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setEditingSpecs(false);
                      if (specifications?.specificationGroups) {
                        setSpecificationGroups(specifications.specificationGroups);
                      }
                    }}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Ləğv et
                  </button>
                  <button
                    onClick={handleSaveSpecs}
                    disabled={adding || updating}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg transition-colors"
                  >
                    {(adding || updating) ? 'Yadda saxlanılır...' : 'Spesifikasiyaları yadda saxla'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Specifications Content */}
          {specsLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-400">Spesifikasiyalar yüklənir...</div>
            </div>
          ) : !editingSpecs && specifications?.specificationGroups ? (
            // Display Mode
            <div className="space-y-6">
              {specifications.specificationGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">{group.groupName}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {group.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex justify-between items-center py-2 border-b border-gray-600 last:border-b-0">
                        <span className="text-gray-300">{item.name}</span>
                        <span className="text-white font-medium">
                          {item.value} {item.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : editingSpecs ? (
            // Edit Mode
            <div className="space-y-6">
              {specificationGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={group.groupName}
                        onChange={(e) => updateGroupName(groupIndex, e.target.value)}
                        placeholder="Qrup adı (məs: Texniki xüsusiyyətlər)"
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    {specificationGroups.length > 1 && (
                      <button
                        onClick={() => removeSpecGroup(groupIndex)}
                        className="p-2 text-indigo-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {group.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-gray-600 rounded">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItem(groupIndex, itemIndex, 'name', e.target.value)}
                          placeholder="Xüsusiyyət adı"
                          className="px-2 py-1.5 bg-gray-500 border border-gray-400 rounded text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500"
                          required
                        />
                        <input
                          type="text"
                          value={item.value}
                          onChange={(e) => updateItem(groupIndex, itemIndex, 'value', e.target.value)}
                          placeholder="Dəyər"
                          className="px-2 py-1.5 bg-gray-500 border border-gray-400 rounded text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500"
                          required
                        />
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => updateItem(groupIndex, itemIndex, 'unit', e.target.value)}
                          placeholder="Vahid (ixtiyari)"
                          className="px-2 py-1.5 bg-gray-500 border border-gray-400 rounded text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500"
                        />
                        <div className="flex items-center">
                          {group.items.length > 1 && (
                            <button
                              onClick={() => removeItemFromGroup(groupIndex, itemIndex)}
                              className="p-1.5 text-indigo-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => addItemToGroup(groupIndex)}
                    className="mt-3 flex items-center gap-2 px-3 py-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Yeni xüsusiyyət əlavə et
                  </button>
                </div>
              ))}

              <button
                onClick={addSpecGroup}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-600 hover:border-gray-500 rounded-lg text-gray-400 hover:text-gray-300 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Yeni xüsusiyyət qrupu əlavə et
              </button>
            </div>
          ) : (
            // No Specifications State
            <div className="text-center py-12">
              <Settings className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">Spesifikasiyalar əlavə edilməyib</h3>
              <p className="text-gray-500 mb-6">Məhsul idarəetməsini və müştəri məlumatını yaxşılaşdırmaq üçün ətraflı spesifikasiyalar əlavə edin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;

