import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, Save, X, Eye, EyeOff, Loader2 } from 'lucide-react';
import { 
  useAddFilterMutation, 
  useGetFiltersQuery, 
  useRemoveFilterMutation, 
  useRemoveFilterOptionMutation,
  useUpdateFilterMutation,
  useUpdateFilterOptionMutation 
} from '../../store/API';
import { toast } from 'react-toastify';

const FilterUi = () => {
  const { t } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); 
  const [loading, setLoading] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState({});

  const { data: filters, isLoading: isFilterDataLoading, refetch } = useGetFiltersQuery();
  const [addFilter] = useAddFilterMutation();
  const [updateFilter] = useUpdateFilterMutation();
  const [updateFilterOption] = useUpdateFilterOptionMutation();
  const [removeFilter, { isLoading: isRemoving }] = useRemoveFilterMutation();
  const [removeFilterOption] = useRemoveFilterOptionMutation();

  const [options, setOptions] = useState([]);
  const [originalOptions, setOriginalOptions] = useState([]); // Track original options for comparison

  const [formData, setFormData] = useState({
    name: '',
    type: 0,
    isActive: true,
    sortOrder: 0,
    options: []
  });

  const [newOption, setNewOption] = useState({
    value: '',
    displayName: '',
    color: '',
    iconUrl: '',
    isActive: true,
    sortOrder: 0
  });

  const toggleExpanded = (filterId) => {
    setExpandedFilters(prev => ({ ...prev, [filterId]: !prev[filterId] }));
  };

  const openModal = (mode, filter = null) => {
    setModalMode(mode);

    if (filter) {
      setFormData({
        name: filter.name ?? '',
        type: filter.type ?? 0,
        value: filter.slug ?? "",
        isActive: filter.isActive ?? true,
        sortOrder: filter.sortOrder ?? 0,
        options: Array.isArray(filter.options) ? [...filter.options] : []
      });
      const opts = Array.isArray(filter.options) ? [...filter.options] : [];
      setOptions(opts);
      setOriginalOptions(JSON.parse(JSON.stringify(opts))); // Deep clone for comparison
      setSelectedFilter(filter);
    } else {
      setFormData({ name: '', value:"", type: 0, isActive: true, sortOrder: 0, options: [] });
      setOptions([]);
      setOriginalOptions([]);
      setSelectedFilter(null);
    }

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFilter(null);
    setNewOption({ value: '', displayName: '', color: 'red', iconUrl: '', isActive: true, sortOrder: 0 });
    setOptions([]);
    setOriginalOptions([]);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const parsed = type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value);
    setFormData(prev => ({ ...prev, [name]: parsed })); 
  };

  const addOption = () => {
    if (!newOption.displayName || !newOption.value) return;
    const opt = { ...newOption, id: Date.now() };
    setOptions(prev => [...prev, opt]);
    setNewOption({ value: '', displayName: '', color: 'red', iconUrl: '', isActive: true, sortOrder: 0 });
  };

  const removeOption = (optionId) => {
    setOptions(prev => prev.filter(opt => opt.id !== optionId));
  };

  const toggleOptionStatus = (optionId) => {
    setOptions(prev => prev.map(opt => opt.id === optionId ? { ...opt, isActive: !opt.isActive } : opt));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (modalMode === 'add') {
        // Add new filter
        await addFilter({
          name: formData.name,
          type: formData.type,
          isActive: formData.isActive,
          sortOrder: formData.sortOrder ?? 0,
          options: options,
          slug: formData.value || "new-filter"
        }).unwrap();
        toast.success("Filtr uğurla əlavə olundu!");
      } else if (modalMode === 'edit') {
        // Update filter basic info
        await updateFilter({
          id: selectedFilter.id,
          name: formData.name,
          type: formData.type,
          isActive: formData.isActive,
          sortOrder: formData.sortOrder ?? 0,
        }).unwrap();

        // Handle options: update existing options that have been modified
        const originalIds = originalOptions.map(opt => opt.id);
        const currentIds = options.map(opt => opt.id);

        // Update existing options that have been modified
        for (const option of options) {
          if (originalIds.includes(option.id)) {
            // Check if option was modified
            const original = originalOptions.find(o => o.id === option.id);
            const isModified = JSON.stringify(original) !== JSON.stringify(option);
            
            if (isModified) {
              await updateFilterOption({
                filterId: selectedFilter.id,
                optionId: option.id,
                value: option.value,
                displayName: option.displayName,
                color: option.color || 'red',
                iconUrl: option.iconUrl || '',
                isActive: option.isActive,
                sortOrder: option.sortOrder ?? 0
              }).unwrap();
            }
          }
        }

        // Delete removed options
        for (const originalOption of originalOptions) {
          if (!currentIds.includes(originalOption.id)) {
            await deleteFilterOption(selectedFilter.id, originalOption.id);
          }
        }

        toast.success("Filtr uğurla yeniləndi!");
      }
      
      refetch();
      closeModal();
    } catch (err) {
      console.error('submit error', err);
      toast.error(err?.data?.message || err?.data || "Əməliyyat uğursuz oldu");
    }
    setLoading(false);
  };

  const deleteFilter = async (filterId) => {
    try {
      await removeFilter({id: filterId}).unwrap();
      toast.success("Filtr uğurla silindi");
      refetch();
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.message || "Filtri silmək alınmadı");
    }
  };

  const deleteFilterOption = async (filterId, optionId) => {
    try {
      await removeFilterOption({ filterId, optionId }).unwrap();
      toast.success("Seçim uğurla silindi");
      refetch();
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.message || "Seçimi silmək alınmadı");
    }
  };

  const toggleFilterStatus = (filterId) => {
    // implement toggle via API
  };

  return (
    <div className="min-h-screen bg-[#181818] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{t('adminFilters.title')}</h1>
            <p className="text-gray-400 mt-1">{t('adminFilters.subtitle')}</p>
          </div>
          <button onClick={() => openModal('add')} className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg shadow-lg flex items-center gap-2 hover:bg-gray-100 transition-all duration-200">
            <Plus className="w-5 h-5" /> {t('adminFilters.addFilter')}
          </button>
        </div>

        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700">
          <div className="divide-y divide-gray-700">
            {isFilterDataLoading ? (
              <div className="p-6 flex justify-center"><Loader2 className="w-12 h-12 animate-spin text-indigo-500" /></div>
            ) : (
              filters?.map((filter) => (
                <div key={filter.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button onClick={() => toggleExpanded(filter.id)} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                        {expandedFilters[filter.id] ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                      </button>

                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-semibold text-white">{filter.name}</h3>
                         </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">

                      <button onClick={() => openModal('edit', filter)} className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transform hover:scale-110 transition-all duration-200" title="Edit"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => deleteFilter(filter.id)} disabled={isRemoving} className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg transform hover:scale-110 transition-all duration-200" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>

                  {expandedFilters[filter.id] && Array.isArray(filter.options) && filter.options.length > 0 && (
                    <div className="mt-6 ml-12">
                      <h4 className="font-semibold text-white mb-4 text-lg">{t('adminFilters.options') || 'Seçimlər'} ({filter.options.length})</h4>
                      <div className="space-y-3">
                        {filter.options.map((option) => (
                          <div key={option.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                            <div>
                              <span className="font-medium text-white text-lg">{option.displayName ?? option.label}</span>
                              <span className="text-gray-400 ml-3">({option.value})</span>
                            </div>
                            <div className="flex items-center gap-2">
                           
                              <button 
                                onClick={() => deleteFilterOption(filter.id, option.id)} 
                                className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg transform hover:scale-110 transition-all duration-200" 
                                title="Delete Option"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0  bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">{modalMode === 'add' ? 'Yeni filtr əlavə et' : modalMode === 'edit' ? 'Filtri redaktə et' : 'Filter detalları'}</h2>
                  <button onClick={closeModal} className="p-2 hover:bg-gray-700 rounded-lg transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                </div>

                {/* Form content */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Filter adı</label>
                      <input type="text" name="name" value={formData.name} onChange={handleInputChange} disabled={modalMode === 'view'} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-600" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Slug</label>
                      <input type="text" name="value" value={formData.value} onChange={handleInputChange} disabled={modalMode === 'view' || modalMode === 'edit'} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-600" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Sıra nömrəsi</label>
                      <input type="number" name="sortOrder" value={formData.sortOrder === 0 ? "" : formData.sortOrder} onChange={handleInputChange} disabled={modalMode === 'view'} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:border-transparent disabled:bg-gray-600" min="0" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-4">Seçimlər</label>
                    {modalMode !== 'view' && (
                      <div className="flex gap-2 mb-4">
                        <input type="text" placeholder="Seçim etiketi" value={newOption.displayName} onChange={(e) => setNewOption(prev => ({ ...prev, displayName: e.target.value }))} className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        <input type="text" placeholder="Seçim dəyəri" value={newOption.value} onChange={(e) => setNewOption(prev => ({ ...prev, value: e.target.value }))} className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        <button type="button" onClick={addOption} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors">Əlavə et</button>
                      </div>
                    )}

                    <div className="space-y-3">
                      {options.map((option) => (
                        <div key={option.id} className="flex items-center justify-between p-4 border border-gray-600 bg-gray-700 rounded-lg">
                          <div>
                            <span className="font-medium text-white">{option.displayName}</span>
                            <span className="text-gray-400 ml-2">({option.value})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {modalMode !== 'view' && (
                              <>
                                <button type="button" onClick={() => removeOption(option.id)} className="text-indigo-400 hover:bg-indigo-600 hover:text-white p-2 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {modalMode !== 'view' && (
                    <div className="flex justify-end gap-4 pt-6 border-t border-gray-600">
                        <button type="button" onClick={closeModal} className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition-colors">{t('adminProduct.cancel')}</button>
                      <button type="button" onClick={handleSubmit} disabled={loading} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 font-semibold transition-colors">
                        {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                        <Save className="w-4 h-4" />
                        {modalMode === 'add' ? t('adminFilters.addFilter') : t('adminProduct.updateProduct')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterUi;
