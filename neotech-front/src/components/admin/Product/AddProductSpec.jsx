import React, { useState } from 'react';
import { X, Plus, Trash2, Settings } from 'lucide-react';
import { useAddProductSpecificationsMutation } from '../../../store/API';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const AddProductSpecifications = ({ setOpen, productId, productName }) => {
  const { t } = useTranslation();
  const [addSpecs, { isLoading }] = useAddProductSpecificationsMutation();
  
  const [specificationGroups, setSpecificationGroups] = useState([
    {
      groupName: '',
      items: [
        {
          name: '',
          value: '',
          unit: '',
          type: 0
        }
      ]
    }
  ]);

  // Add new specification group
  const addSpecGroup = () => {
    setSpecificationGroups([
      ...specificationGroups,
      {
        groupName: '',
        items: [
          {
            name: '',
            value: '',
            unit: '',
            type: 0
          }
        ]
      }
    ]);
  };

  // Remove specification group
  const removeSpecGroup = (groupIndex) => {
    if (specificationGroups.length > 1) {
      setSpecificationGroups(specificationGroups.filter((_, index) => index !== groupIndex));
    }
  };

  // Update group name
  const updateGroupName = (groupIndex, groupName) => {
    const updated = [...specificationGroups];
    updated[groupIndex].groupName = groupName;
    setSpecificationGroups(updated);
  };

  // Add item to group
  const addItemToGroup = (groupIndex) => {
    const updated = [...specificationGroups];
    updated[groupIndex].items.push({
      name: '',
      value: '',
      unit: '',
      type: 0
    });
    setSpecificationGroups(updated);
  };

  // Remove item from group
  const removeItemFromGroup = (groupIndex, itemIndex) => {
    const updated = [...specificationGroups];
    if (updated[groupIndex].items.length > 1) {
      updated[groupIndex].items.splice(itemIndex, 1);
      setSpecificationGroups(updated);
    }
  };

  // Update item in group
  const updateItem = (groupIndex, itemIndex, field, value) => {
    const updated = [...specificationGroups];
    updated[groupIndex].items[itemIndex][field] = value;
    setSpecificationGroups(updated);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const isValid = specificationGroups.every(group => 
      group.groupName.trim() !== '' && 
      group.items.every(item => item.name.trim() !== '' && item.value.trim() !== '')
    );

    if (!isValid) {
      toast.error(t("adminProduct.fillAllFields"));
      return;
    }

    try {
      await addSpecs({
        id: productId,
        productId: productId,
        specificationGroups: specificationGroups
      }).unwrap();
      
      toast.success(t("adminProduct.specsAddedSuccess"));
      setOpen();
    } catch (error) {
      console.error('Error adding specifications:', error);
      toast.error(error?.data?.message || t("adminProduct.failedAddSpecs"));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-blue-400" />
            <div>
              <h2 className="text-xl font-bold text-white">{t("adminProduct.addProductSpecs")}</h2>
              <p className="text-gray-400 text-sm">{productName}</p>
            </div>
          </div>
          <button
            onClick={setOpen}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {specificationGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="bg-gray-700 rounded-lg p-4">
                {/* Group Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t("adminProduct.groupName")} *
                    </label>
                    <input
                      type="text"
                      value={group.groupName}
                      onChange={(e) => updateGroupName(groupIndex, e.target.value)}
                      placeholder={t("adminProduct.groupNamePlaceholder")}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  {specificationGroups.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSpecGroup(groupIndex)}
                      className="mt-6 p-2 text-indigo-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Group Items */}
                <div className="space-y-3">
                  {group.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="bg-gray-600 rounded-lg p-3">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">
                            {t("adminProduct.specName")} *
                          </label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateItem(groupIndex, itemIndex, 'name', e.target.value)}
                            placeholder={t("adminProduct.specNamePlaceholder")}
                            className="w-full px-2 py-1.5 bg-gray-500 border border-gray-400 rounded text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">
                            {t("adminProduct.value")} *
                          </label>
                          <input
                            type="text"
                            value={item.value}
                            onChange={(e) => updateItem(groupIndex, itemIndex, 'value', e.target.value)}
                            placeholder={t("adminProduct.valuePlaceholder")}
                            className="w-full px-2 py-1.5 bg-gray-500 border border-gray-400 rounded text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">
                            {t("adminProduct.unit")}
                          </label>
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => updateItem(groupIndex, itemIndex, 'unit', e.target.value)}
                            placeholder={t("adminProduct.unitPlaceholder")}
                            className="w-full px-2 py-1.5 bg-gray-500 border border-gray-400 rounded text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div className="flex items-end">
                          {group.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItemFromGroup(groupIndex, itemIndex)}
                              className="p-1.5 text-indigo-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Item Button */}
                <button
                  type="button"
                  onClick={() => addItemToGroup(groupIndex)}
                  className="mt-3 flex items-center gap-2 px-3 py-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  {t("adminProduct.addSpecItem")}
                </button>
              </div>
            ))}

            {/* Add Group Button */}
            <button
              type="button"
              onClick={addSpecGroup}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-600 hover:border-gray-500 rounded-lg text-gray-400 hover:text-gray-300 transition-colors"
            >
              <Plus className="w-5 h-5" />
              {t("adminProduct.addSpecGroup")}
            </button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
            <button
              type="button"
              onClick={setOpen}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              {t("adminProduct.cancel")}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {isLoading ? t("adminProduct.adding") : t("adminProduct.addProductSpecs")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductSpecifications;
