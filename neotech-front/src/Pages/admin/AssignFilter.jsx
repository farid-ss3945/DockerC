import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Save,
  X,
  Package,
  Tags,
  Loader2,
  Check,
  AlertCircle,
  Trash2
} from 'lucide-react';
import {
  useGetFiltersQuery,
  useAssignFilterMutation,
  useAssignFiltersBulkMutation,
  useGetProductsQuery,
  useRemoveAllFiltersFromProductMutation,
  useRemoveCustomFilterFromProductMutation
} from '../../store/API';
import { toast } from 'react-toastify';

const ProductFilterAssignment = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assignmentMode, setAssignmentMode] = useState('single');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('');
  const [selectedFilterOption, setSelectedFilterOption] = useState('');
  const [customValue, setCustomValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const { data: products, isLoading: isProductLoading, refetch } = useGetProductsQuery()
  const [expandedSections, setExpandedSections] = useState({
    products: true,
    filters: true
  });

  const { data: filters, isLoading: isFiltersLoading } = useGetFiltersQuery();
  const [assignFilter] = useAssignFilterMutation();
  const [assignFiltersBulk] = useAssignFiltersBulkMutation();
  const [removeAllFilters] = useRemoveAllFiltersFromProductMutation();
  const [removeCustomFilter] = useRemoveCustomFilterFromProductMutation();

  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedFilterData = filters?.find(f => f.id === selectedFilter);
  const availableOptions = selectedFilterData?.options || [];

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const openModal = () => {
    setIsModalOpen(true);
    setSelectedProducts([]);
    setSelectedFilter('');
    setSelectedFilterOption('');
    setCustomValue('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProducts([]);
    setSelectedFilter('');
    setSelectedFilterOption('');
    setCustomValue('');
  };

  const handleProductSelection = (productId) => {
    setSelectedProducts(prev => {
      if (assignmentMode === 'single') {
        return [productId];
      }
      return prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
    });
  };

  const handleBulkSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const handleAssignment = async () => {
    if (!selectedFilter || selectedProducts.length === 0) {
      toast.error('Zəhmət olmasa ən azı bir məhsul və bir filtr seçin');
      return;
    }

    if (!selectedFilterOption && !customValue) {
      toast.error('Zəhmət olmasa filtr seçimi seçin və ya xüsusi dəyər daxil edin');
      return;
    }

    setLoading(true);

    try {
      const assignmentData = {
        filterId: selectedFilter,
        filterOptionId: selectedFilterOption || null,
        customValue: customValue || null
      };

      if (assignmentMode === 'single' || selectedProducts.length === 1) {
        await assignFilter({
          productId: selectedProducts[0],
          ...assignmentData
        }).unwrap();
        toast.success('Filtr uğurla təyin edildi!');
        refetch()
      } else {
        await assignFiltersBulk({
          productIds: selectedProducts,
          ...assignmentData
        }).unwrap();
        toast.success(`Filtr ${selectedProducts.length} məhsula uğurla təyin edildi!`);
      }

      closeModal();
    } catch (error) {
      console.error('Assignment error:', error);
      toast.error(error?.data?.message || 'Filtrləri təyin etmək uğursuz oldu');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAllFilters = async (productId, productName) => {

    try {
      await removeAllFilters({ productId }).unwrap();
      toast.success('Bütün filtrlər uğurla silindi!');
      refetch()

    } catch (error) {
      console.error('Remove all filters error:', error);
      toast.error(error?.data?.message || 'Filtrləri silmək uğursuz oldu');
    }
  };

  const handleRemoveCustomFilter = async (productId, filterId, filterName) => {

    try {
      await removeCustomFilter({ productId, filterId }).unwrap();
      toast.success('Filtr uğurla silindi!');
      refetch()

    } catch (error) {
      console.error('Remove filter error:', error);
      toast.error(error?.data?.message || 'Filtrləri silmək uğursuz oldu');
    }
  };

  const getSelectedProductsText = () => {
    if (selectedProducts.length === 0) return 'Məhsul seçilməyib';
    if (selectedProducts.length === 1) {
      const product = products.find(p => p.id === selectedProducts[0]);
      return product?.name || 'Naməlum məhsul';
    }
    return `${selectedProducts.length} məhsul seçildi`;
  };

  return (
    <div className="min-h-screen bg-[#181818] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Məhsul Filtrinin Təyinatı</h1>
            <p className="text-gray-400 mt-1">Filtrləri məhsullara tək-tək və ya toplu şəkildə təyin et</p>
          </div>
          <button
            onClick={openModal}
            className="px-6 py-3 bg-white cursor-pointer text-gray-900 font-semibold rounded-lg shadow-lg flex items-center gap-2 hover:bg-gray-100 transition-all duration-200"
          >
            <Tags className="w-5 h-5" />
            Filtrləri təyin et
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{products?.length || 0}</h3>
                <p className="text-gray-400">Ümumi məhsul sayı</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-600 rounded-lg">
                <Filter className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{filters?.length || 0}</h3>
                <p className="text-gray-400">Mövcud filtrlər</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-600 rounded-lg">
                <Tags className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {filters?.reduce((acc, f) => acc + (f.options?.length || 0), 0) || 0}
                </h3>
                <p className="text-gray-400">Ümumi seçimlər</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product-Filter Relationships Table */}
        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 mb-8">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold text-white">Məhsul Filtrinin Təyinatıs</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Məhsullarda axtar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {isProductLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-4 px-4 font-semibold text-gray-300">Məhsul</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-300">Təyin olunmuş filtrlər</th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-300">Əməliyyatlar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredProducts?.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-750 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={`https://ecommerce100-001-site1.ntempurl.com/${product.primaryImageUrl}`}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover bg-gray-600"
                              onError={(e) => {
                                e.target.src = '/api/placeholder/48/48';
                              }}
                            />
                            <div>
                              <p className="font-medium text-white">{product.name}</p>
                              <p className="text-sm text-gray-400">ID: {product.id.substring(0, 8)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1">
                            {product.filters && product.filters.length > 0 ? (
                              product.filters.map((assignment, index) => {
                                return (

                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-blue-600 text-white rounded-full text-xs flex items-center gap-1 group"
                                    title={`${assignment.filterName}: ${assignment.value || assignment.optionName}`}
                                  >
                                    {assignment.filterOptionDisplayName}
                                    {assignment.value && (
                                      <span className="text-blue-200">: {assignment.value}</span>
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveCustomFilter(product.id, assignment.filterId, assignment.filterName);
                                      }}
                                      className="ml-1 hover:bg-blue-700 cursor-pointer rounded-full p-0.5 transition-colors"
                                      title="Bu filtri sil"
                                    >
                                      <X className="w-3 h-3 cursor-pointer" />
                                    </button>
                                  </span>
                                )
                              })
                            ) : (
                              <span className="text-gray-500 text-sm italic">Filtr təyin olunmayıb</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            {/* <button
                              onClick={() => {
                                setSelectedProducts([product.id]);
                                setAssignmentMode('single');
                                openModal();
                              }}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 cursor-pointer text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                            >
                              <Tags className="w-3 h-3" />
                              Assign
                            </button> */}
                            {product.filters && product.filters.length > 0 && (
                              <button
                                onClick={() => handleRemoveAllFilters(product.id, product.name)}
                                className="px-3 py-1 bg-indigo-600 whitespace-nowrap cursor-pointer hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                                title="Bütün filtrləri sil"
                              >
                                <Trash2 className="w-3 h-3" />
                                Hamısını sil
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {(!filteredProducts || filteredProducts.length === 0) && (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-500">Məhsul tapılmadı</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Assignment Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 backdrop-blur-md bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Filtrləri məhsullara təyin et</h2>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400 cursor-pointer" />
                  </button>
                </div>

                {/* Assignment Mode Toggle */}
                <div className="mb-6">
                  <div className="flex gap-2 p-1 bg-gray-700 rounded-lg w-fit">
                    <button
                      onClick={() => setAssignmentMode('single')}
                      className={`px-4 py-2 rounded-md cursor-pointer font-medium transition-colors ${assignmentMode === 'single'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:text-white'
                        }`}
                    >
                      Tək məhsul
                    </button>
                    <button
                      onClick={() => setAssignmentMode('bulk')}
                      className={`px-4 py-2 rounded-md cursor-pointer font-medium transition-colors ${assignmentMode === 'bulk'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:text-white'
                        }`}
                    >
                      Toplu təyinat
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Product Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Məhsulları seç
                      </h3>
                      <button
                        onClick={() => toggleSection('products')}
                        className="p-1 hover:bg-gray-700 rounded transition-colors"
                      >
                        {expandedSections.products ?
                          <ChevronUp className="w-4 h-4 text-gray-400" /> :
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        }
                      </button>
                    </div>

                    {expandedSections.products && (
                      <>
                        {/* Search */}
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            placeholder="Məhsullarda axtar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {/* Bulk Select All */}
                        {assignmentMode === 'bulk' && (
                          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                            <span className="text-sm text-gray-300">
                              {selectedProducts.length} / {filteredProducts?.length || 0} seçildi
                            </span>
                            <button
                              onClick={handleBulkSelectAll}
                              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                            >
                              {selectedProducts.length === filteredProducts?.length ? 'Hamısının seçimini ləğv et' : 'Hamısını seç'}
                            </button>
                          </div>
                        )}

                        {/* Product List */}
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {filteredProducts?.map((product) => (
                            <div
                              key={product.id}
                              onClick={() => handleProductSelection(product.id)}
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedProducts.includes(product.id)
                                  ? 'bg-blue-600 border-blue-500 text-white'
                                  : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                                }`}
                            >
                              <div className="flex-shrink-0 w-4">
                                {selectedProducts.includes(product.id) && (
                                  <Check className="w-4 h-4 text-white" />
                                )}
                              </div>
                              <img
                                src={`https://ecommerce100-001-site1.ntempurl.com/${product.primaryImageUrl}`}
                                alt={product.name}
                                className="w-10 h-10 rounded-lg object-cover bg-gray-600"
                                onError={(e) => {
                                  e.target.src = '/api/placeholder/40/40';
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{product.name}</p>
                                <p className="text-sm text-gray-400">{product.sku || 'N/A'}</p>
                              </div>
                              <span className="text-xs px-2 py-1 bg-gray-600 rounded text-gray-300">
                                {product.categoryName || 'N/A'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Filter Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Filtr və seçim seç
                      </h3>
                    </div>

                    {/* Filter Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Filtr
                      </label>
                      <select
                        value={selectedFilter}
                        onChange={(e) => {
                          setSelectedFilter(e.target.value);
                          setSelectedFilterOption('');
                        }}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Filtr seçin</option>
                        {filters?.filter(f => f.isActive).map((filter) => (
                          <option key={filter.id} value={filter.id}>
                            {filter.name} ({filter.typeName || filter.type})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Filter Options */}
                    {selectedFilter && availableOptions.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Filtr seçimi
                        </label>
                        <select
                          value={selectedFilterOption}
                          onChange={(e) => setSelectedFilterOption(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Seçim seçin</option>
                          {availableOptions.filter(opt => opt.isActive).map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.displayName || option.label} ({option.value})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Custom Value */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Xüsusi dəyər (ixtiyari)
                      </label>
                      <input
                        type="text"
                        value={customValue}
                        onChange={(e) => setCustomValue(e.target.value)}
                        placeholder="Xüsusi dəyər daxil edin..."
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Seçilmiş filtr seçimini istifadə etmək üçün boş buraxın
                      </p>
                    </div>

                    {/* Assignment Summary */}
                    <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Təyinat xülasəsi</h4>
                      <div className="space-y-1 text-sm">
                        <p className="text-white">
                          <span className="text-gray-400">Məhsullar:</span> {getSelectedProductsText()}
                        </p>
                        <p className="text-white">
                          <span className="text-gray-400">Filtr:</span> {
                            selectedFilter ?
                              filters?.find(f => f.id === selectedFilter)?.name || 'Naməlum' :
                              'Seçilməyib'
                          }
                        </p>
                        <p className="text-white">
                          <span className="text-gray-400">Dəyər:</span> {
                            customValue ||
                            (selectedFilterOption ?
                              availableOptions.find(opt => opt.id === selectedFilterOption)?.displayName || 'Naməlum' :
                              'Təyin edilməyib'
                            )
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-600">
                  <button
                    onClick={closeModal}
                    className="px-6 py-3 bg-gray-600 text-white cursor-pointer rounded-lg hover:bg-gray-700 font-semibold transition-colors"
                  >
                    Ləğv et
                  </button>
                  <button
                    onClick={handleAssignment}
                    disabled={loading || !selectedFilter || selectedProducts.length === 0}
                    className="px-6 py-3 bg-blue-600 text-white cursor-pointer rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2 font-semibold transition-colors"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    <Save className="w-4 h-4" />
                    {assignmentMode === 'single' ? 'Filtrləri təyin et' : `${selectedProducts.length} məhsula təyin et`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductFilterAssignment;

