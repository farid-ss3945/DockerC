import { Loader2, Pen, Trash, Package, DollarSign, Palette, Ruler, Eye, Search, X, ChevronDown, Filter } from "lucide-react";
import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { useActivateUserMutation, useDeActivateUserMutation, useDeleteProductMutation, useGetProductsQuery, useGetProductsSummaryQuery, useGetParentCategoriesQuery } from "../../store/API";
import Modal from "../../components/UI/Modal";
import AddProductStatic from "../../components/admin/Product/AddProduct";
import EditProduct from "../../components/admin/Product/EditProduct";
import { toast } from "react-toastify";
import { useTranslation } from 'react-i18next';

const ProductsUI = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { data: products, isLoading, error, refetch } = useGetProductsQuery();
    console.log(products);
    const { data: productsSummary, isSummaryLoading } = useGetProductsSummaryQuery();
    const { data: parentCategories, isLoading: isParentCategoriesLoading } = useGetParentCategoriesQuery();
    
    const [open, setOpen] = useState(false);
    const [modalType, setModalType] = useState(null); 
    const [cat, setCat] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [openDropdowns, setOpenDropdowns] = useState({});
    const [isCategoryFilterOpen, setIsCategoryFilterOpen] = useState(false);
    const categoryFilterRef = useRef(null);

    const [deleteCategory] = useDeleteProductMutation();

    const handleDeleteProduct = async (id) => {
      try {
        await deleteCategory({ id }).unwrap();
        toast.success(t('admin.productDeletedSuccess'));
        handleCloseModal();
      } catch (error) {
        toast.error(error?.data || t('admin.deletingProductFailed'));
      }
    };

    const handleViewProduct = (product) => {
      navigate(`/admin/products/${product.id}`);
    };

    const handleCloseModal = () => {
      setModalType(false);
      setOpen(false);
      refetch();
    };

    // Close category filter when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (categoryFilterRef.current && !categoryFilterRef.current.contains(event.target)) {
          setIsCategoryFilterOpen(false);
        }
      };

      if (isCategoryFilterOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isCategoryFilterOpen]);

    // Toggle dropdown
    const toggleDropdown = (parentId) => {
      setOpenDropdowns(prev => ({
        ...prev,
        [parentId]: !prev[parentId]
      }));
    };

    // Handle category selection (same logic as FilterSidebar)
    const handleCategoryChange = (categoryId) => {
      setSelectedCategories(prev => {
        if (prev.includes(categoryId)) {
          return prev.filter(id => id !== categoryId);
        }
        return [...prev, categoryId];
      });
    };

    // Filter products based on search query and selected categories
    const filteredProducts = useMemo(() => {
      if (!products) return [];
      
      return products.filter(product => {
        // Search filter
        const query = searchQuery.toLowerCase();
        const matchesSearch = !searchQuery || (
          product.name?.toLowerCase().includes(query) ||
          product.slug?.toLowerCase().includes(query) ||
          product.colors?.some(color => color.toLowerCase().includes(query)) ||
          product.sizes?.some(size => size.toLowerCase().includes(query))
        );

        // Category filter
        const matchesCategory = selectedCategories.length === 0 || 
          selectedCategories.includes(product.categoryId);

        return matchesSearch && matchesCategory;
      });
    }, [products, searchQuery, selectedCategories]);

    return (
      <div className="text-white p-4 min-h-screen">
        <Modal open={modalType === "add"} setOpen={handleCloseModal}>
          <AddProductStatic setOpen={handleCloseModal}/>
        </Modal>
        
        <Modal open={modalType === "edit"} setOpen={handleCloseModal}>
          <EditProduct setOpen={handleCloseModal} idPr={cat}/>
        </Modal>

        <div className="container mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-4xl font-bold text-white mb-2">{t('admin.products')}</h2>
              <p className="text-gray-400">{t('admin.manageProducts')}</p>
            </div>
            <button
              onClick={() => setModalType("add")}
              className="md:px-6 md:py-3 px-4 py-2 bg-white text-sm md:text-base transition-all duration-300 rounded-lg font-semibold text-gray-900 shadow-lg transform hover:bg-gray-100 hover:scale-105"
            >
              {t('admin.addNewProduct')}
            </button>
          </div>

          {/* Search Bar */}
          

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-xl shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">{t('adminDashboard.totalProducts')}</p> 
                      {isSummaryLoading ? (
                        <div className="flex justify-center items-center py-2">
                          <Loader2 className="w-6 h-6 animate-spin text-blue-200" />
                        </div>
                      ) : (
                        <p className="text-white text-2xl font-bold">{productsSummary?.totalProducts || 0}</p>
                      )}
                    </div>
                    <Package className="w-8 h-8 text-blue-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-xl shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">{t('adminDashboard.inStock')}</p>
                      {isSummaryLoading ? (
                        <div className="flex justify-center items-center py-2">
                          <Loader2 className="w-6 h-6 animate-spin text-green-200" />
                        </div>
                      ) : (
                        <p className="text-white text-2xl font-bold">{productsSummary?.inStockProducts || 0}</p>
                      )}
                    </div>
                    <DollarSign className="w-8 h-8 text-green-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-6 rounded-xl shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">{t('adminDashboard.lowStock')}</p>
                      {isSummaryLoading ? (
                        <div className="flex justify-center items-center py-2">
                          <Loader2 className="w-6 h-6 animate-spin text-orange-200" />
                        </div>
                      ) : (
                        <p className="text-white text-2xl font-bold">{productsSummary?.lowStockProducts || 0}</p>
                      )}
                    </div>
                    <Package className="w-8 h-8 text-orange-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 rounded-xl shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 text-sm">{t('adminDashboard.outOfStock')}</p>
                      {isSummaryLoading ? (
                        <div className="flex justify-center items-center py-2">
                          <Loader2 className="w-6 h-6 animate-spin text-red-200" />
                        </div>
                      ) : (
                        <p className="text-white text-2xl font-bold">{productsSummary?.outOfStockProducts || 0}</p>
                      )}
                    </div>
                    <Package className="w-8 h-8 text-red-200" />
                  </div>
                </div>
              </div>

              {/* Category Filter and Search Bar */}
              <div className="flex flex-col  mb-9">
                <div className="mb-3 flex flex-col md:flex-row gap-4 items-start md:items-center">
                  {/* Category Filter */}
                  <div className="w-full md:w-auto" ref={categoryFilterRef}>
                  <div className="relative">
                    <button
                      onClick={() => setIsCategoryFilterOpen(!isCategoryFilterOpen)}
                      className="flex items-center gap-2 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition-all"
                    >
                      <Filter className="w-5 h-5" />
                      <span className="text-sm font-medium">{t('admin.category')}</span>
                      <ChevronDown 
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isCategoryFilterOpen ? 'transform rotate-180' : ''
                        }`}
                      />
                    </button>
                    
                    {/* Category Dropdowns */}
                    {isCategoryFilterOpen && !isParentCategoriesLoading && parentCategories && parentCategories.length > 0 && (
                      <div className="absolute top-full left-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 min-w-[280px] max-h-[500px] overflow-y-auto">
                        <div className="p-4 space-y-2">
                          {parentCategories.map((parentCat) => (
                            <div key={parentCat.id} className="border-b border-gray-700 last:border-b-0 pb-2 last:pb-0">
                              {/* Parent Category Dropdown */}
                              <button
                                onClick={() => toggleDropdown(parentCat.id)}
                                className="w-full flex items-center justify-between px-3 py-2 text-white hover:bg-gray-700 rounded-lg transition-colors"
                              >
                                <span className="font-medium text-sm">{parentCat.name}</span>
                                <ChevronDown 
                                  className={`w-4 h-4 transition-transform duration-200 ${
                                    openDropdowns[parentCat.id] ? 'transform rotate-180' : ''
                                  }`}
                                />
                              </button>
                              
                              {/* Subcategories */}
                              {openDropdowns[parentCat.id] && parentCat.subCategories && parentCat.subCategories.length > 0 && (
                                <div className="mt-2 ml-4 space-y-1">
                                  {parentCat.subCategories.map((subCat) => (
                                    <label
                                      key={subCat.id}
                                      className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
                                    >
                                      <input
                                        type="checkbox"
                                        className="w-4 h-4 text-blue-500 cursor-pointer border-gray-600 rounded focus:ring-blue-500 bg-gray-700"
                                        checked={selectedCategories.includes(subCat.id)}
                                        onChange={() => handleCategoryChange(subCat.id)}
                                      />
                                      <span>{subCat.name}</span>
                                    </label>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                          
                          {/* Clear Filters Button */}
                          {selectedCategories.length > 0 && (
                            <button
                              onClick={() => setSelectedCategories([])}
                              className="w-full mt-3 px-4 py-2 text-sm text-indigo-400 hover:text-red-300 hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              {t('filters.clearFilters')}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Selected Categories Badges */}
                  
                  </div>

                  {/* Search Bar */}
                  <div className="flex-1 md:ml-auto md:max-w-md">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder={t('searchProducts')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  </div>
                 

                </div>

                {selectedCategories.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedCategories.map(catId => {
                        let categoryName = '';
                        parentCategories?.forEach(parent => {
                          if (parent.id === catId) {
                            categoryName = parent.name;
                          } else if (parent.subCategories) {
                            const subCat = parent.subCategories.find(sub => sub.id === catId);
                            if (subCat) categoryName = subCat.name;
                          }
                        });
                        return (
                          <span
                            key={catId}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs rounded-full"
                          >
                            {categoryName}
                            <button
                              onClick={() => handleCategoryChange(catId)}
                              className="hover:text-red-300 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                    )}
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts?.map((product) => (
                  <div 
                    key={product.id} 
                    className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >
                    {/* Product Image */}
                    <div className="relative h-48 bg-gray-700">
                      <img
                        className="w-full h-full object-cover cursor-pointer"
                        src={`https://ecommerce100-001-site1.ntempurl.com${product.primaryImageUrl}`}
                        alt={product.name}
                        onClick={() => handleViewProduct(product)}
                        onError={(e) => {
                          e.target.src = "";
                        }}
                      />
                      <div className="absolute top-3 right-3 flex gap-2">
                        {/* View Product Button */}
                        <button
                          onClick={() => handleViewProduct(product)}
                          className="bg-green-600 hover:bg-green-700 p-2 rounded-lg shadow-lg transform hover:scale-110 transition-all duration-200"
                          title={t('productCard.view') || 'Məhsula bax'}
                        >
                          <Eye className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalType("edit");
                            setCat(product.id);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg shadow-lg transform hover:scale-110 transition-all duration-200"
                          title={t('adminProduct.editProduct')}
                        >
                          <Pen className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProduct(product.id);
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 p-2 rounded-lg shadow-lg transform hover:scale-110 transition-all duration-200"
                          title={t('adminProduct.remove')}
                        >
                          <Trash className="w-4 h-4 text-white" />
                        </button>
                      </div>
                      {/* Stock Status Badge */}
                      <div className="absolute top-3 left-3">
                        {product.stockQuantity === 0 ? (
                          <span className="bg-indigo-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            {t('adminDashboard.outOfStock')}
                          </span>
                        ) : product.stockQuantity <= 10 ? (
                          <span className="bg-orange-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            {t('adminDashboard.lowStock')}
                          </span>
                        ) : (
                          <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            {t('adminDashboard.inStock')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Product Info - Clickable */}
                    <div 
                      className="p-5 cursor-pointer"
                      onClick={() => handleViewProduct(product)}
                    >
                      <div className="mb-3">
                        <h3 className="text-lg font-semibold text-white mb-1 truncate hover:text-blue-400 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-gray-400 text-sm truncate">
                          {product.slug}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="mb-4">
                        <span className="text-2xl font-bold text-green-400">
                          {product.currentPrice} AZN
                        </span>
                      </div>

                      {/* Product Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400 flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            {t('adminProduct.stockQuantity')}
                          </span>
                          <span className="text-white font-medium">{product.stockQuantity}</span>
                        </div>

                        {product.colors && product.colors.length > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400 flex items-center gap-1">
                              <Palette className="w-4 h-4" />
                              {t('productCard.colors') || 'Rənglər'}
                            </span>
                            <span className="text-white font-medium">
                              {product.colors.length}
                            </span>
                          </div>
                        )}

                        {product.sizes && product.sizes.length > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400 flex items-center gap-1">
                              <Ruler className="w-4 h-4" />
                              {t('productCard.sizes') || 'Ölçülər'}
                            </span>
                            <span className="text-white font-medium">
                              {product.sizes.length}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Colors Preview */}
                      {product.colors && product.colors.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-400 mb-2">{t('productCard.availableColors') || 'Mövcud rənglər:'}</p>
                          <div className="flex flex-wrap gap-1">
                            {product.colors.slice(0, 4).map((color, index) => (
                              <span
                                key={index}
                                className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs"
                              >
                                {color}
                              </span>
                            ))}
                            {product.colors.length > 4 && (
                              <span className="text-gray-400 text-xs self-center">
                                +{product.colors.length - 4} {t('productCard.more') || 'daha çox'}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Sizes Preview */}
                      {product.sizes && product.sizes.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-400 mb-2">{t('productCard.availableSizes') || 'Mövcud ölçülər:'}</p>
                          <div className="flex flex-wrap gap-1">
                            {product.sizes.slice(0, 4).map((size, index) => (
                              <span
                                key={index}
                                className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs"
                              >
                                {size}
                              </span>
                            ))}
                            {product.sizes.length > 4 && (
                              <span className="text-gray-400 text-xs self-center">
                                +{product.sizes.length - 4} {t('productCard.more') || 'daha çox'}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {filteredProducts && filteredProducts.length === 0 && (
                <div className="text-center py-20">
                  <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  {searchQuery ? (
                    <>
                      <h3 className="text-xl font-semibold text-gray-400 mb-2">{t('noProductsFound')}</h3>
                      <p className="text-gray-500 mb-6">{t('productsPage.searchResultsFor', { query: searchQuery })}</p>
                      <button
                        onClick={() => setSearchQuery("")}
                        className="px-6 py-3 bg-gray-700 transition rounded-lg font-semibold text-white hover:bg-gray-600"
                      >
                        {t('productsPage.clear')}
                      </button>
                    </>
                  ) : (
                    <>
                      <h3 className="text-xl font-semibold text-gray-400 mb-2">{t('noProductsFound')}</h3>
                      <p className="text-gray-500 mb-6">{t('admin.manageProducts')}</p>
                      <button
                        onClick={() => setModalType("add")}
                        className="px-6 py-3 bg-white transition rounded-lg font-semibold text-gray-900 hover:bg-gray-100"
                      >
                        {t('admin.addNewProduct')}
                      </button>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
};

export default ProductsUI;

