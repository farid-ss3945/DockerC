import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, X, Upload, File, Loader2, Download, Eye } from 'lucide-react';
import { useGetFilesQuery, useRemoveFileMutation, useUploadFileMutation } from '../../../store/API'
import { toast } from 'react-toastify';

const FileManagementPanel = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  
  const { data: files, isLoading: isFilesLoading, refetch } = useGetFilesQuery();
  const [removeFile, { isLoading: isRemoving }] = useRemoveFileMutation();
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();

  const [formData, setFormData] = useState({
    file: null,
    customFileName: '',
    description: '',
    category: ''
  });

  const openModal = () => {
    setFormData({ file: null, customFileName: '', description: '', category: '' });
    setSelectedFile(null);
    setPreviewFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ file: null, customFileName: '', description: '', category: '' });
    setSelectedFile(null);
    setPreviewFile(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFormData(prev => ({ ...prev, file }));
      
      // Create preview URL for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setPreviewFile(reader.result);
        reader.readAsDataURL(file);
      } else {
        setPreviewFile(null);
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error('Zəhmət olmasa yüklənəcək faylı seçin');
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('File', selectedFile);
    formDataToSend.append('CustomFileName', formData.customFileName || selectedFile.name);
    formDataToSend.append('Description', formData.description || '');
    formDataToSend.append('Category', formData.category || '');

    try {
      await uploadFile(formDataToSend).unwrap();
      toast.success(t('adminFiles.uploadSuccess') || 'Fayl uğurla yükləndi!');
      refetch();
      closeModal();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error?.data?.message || 'Fayl yükləməsi uğursuz oldu');
    }
  };

  const handleDelete = async (fileId) => {

    try {
      await removeFile(fileId).unwrap();
      toast.success('Fayl uğurla silindi');
      refetch();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error?.data?.message || 'Faylı silmək uğursuz oldu');
    }
  };

  const getFileIcon = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    const iconClass = "w-12 h-12";
    
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) {
      return <File className={iconClass + " text-blue-400"} />;
    } else if (['pdf'].includes(ext)) {
      return <File className={iconClass + " text-indigo-400"} />;
    } else if (['doc', 'docx'].includes(ext)) {
      return <File className={iconClass + " text-blue-500"} />;
    } else if (['xls', 'xlsx'].includes(ext)) {
      return <File className={iconClass + " text-green-500"} />;
    } else if (['zip', 'rar', '7z'].includes(ext)) {
      return <File className={iconClass + " text-yellow-500"} />;
    }
    return <File className={iconClass + " text-gray-400"} />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-[#181818] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{t('adminFiles.title')}</h1>
            <p className="text-gray-400 mt-1">{t('adminFiles.subtitle')}</p>
          </div>
          <button 
            onClick={openModal}
            className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg shadow-lg flex items-center gap-2 hover:bg-gray-100 transition-all duration-200"
          >
            <Plus className="w-5 h-5" /> {t('adminFiles.uploadFile')}
          </button>
        </div>

        {/* Files Grid */}
        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700">
          {isFilesLoading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
            </div>
          ) : files?.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <File className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-xl">{t('adminFiles.noFiles') || 'Hələ fayl yüklənməyib'}</p>
              <p className="text-sm mt-2">{t('adminFiles.clickToUpload') || 'İlk faylınızı əlavə etmək üçün \"Fayl yüklə\" düyməsinə klik edin'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {files?.map((file) => (
                <div 
                  key={file.id} 
                  className="bg-gray-700 rounded-lg p-6 border border-gray-600 hover:border-gray-500 transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-shrink-0">
                      {getFileIcon(file.fileName || file.customFileName)}
                    </div>
                    <div className="flex gap-2">
                      {file.filePath && (
                        <a
                          href={file.filePath}
                          download
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => handleDelete(file.id)}
                        disabled={isRemoving}
                        className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white truncate" title={file.customFileName || file.fileName}>
                      {file.originalFileName || file.fileName}
                    </h3>
                    
                    {file.description && (
                      <p className="text-sm text-gray-400 line-clamp-2" title={file.description}>
                        {file.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-600">
                      {file.category && (
                        <span className="px-3 py-1 text-xs bg-indigo-600 text-white rounded-full font-medium">
                          {file.category}
                        </span>
                      )}
                      {file.fileSize && (
                        <span className="text-xs text-gray-400">
                          {formatFileSize(file.fileSize)}
                        </span>
                      )}
                    </div>

                    {file.uploadedAt && (
                      <p className="text-xs text-gray-500 pt-2">
                        Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 backdrop-blur-md bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl max-w-2xl w-full border border-gray-700">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Yeni fayl yüklə</h2>
                  <button 
                    onClick={closeModal}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* File Upload Area */}
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors">
                    <input
                      type="file"
                      id="file-upload"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label 
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="w-12 h-12 text-gray-400 mb-4" />
                      {selectedFile ? (
                        <div className="space-y-2">
                          <p className="text-white font-medium">{selectedFile.name}</p>
                          <p className="text-sm text-gray-400">{formatFileSize(selectedFile.size)}</p>
                          {previewFile && (
                            <img 
                              src={previewFile} 
                              alt="Preview" 
                              className="mt-4 max-h-48 rounded-lg mx-auto"
                            />
                          )}
                        </div>
                      ) : (
                        <div>
                          <p className="text-white font-medium mb-2">Fayl yükləmək üçün klik edin</p>
                          <p className="text-sm text-gray-400">və ya sürükləyin</p>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Form Fields */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Xüsusi fayl adı
                    </label>
                    <input
                      type="text"
                      name="customFileName"
                      value={formData.customFileName}
                      onChange={handleInputChange}
                      placeholder="Orijinal adı istifadə etmək üçün boş buraxın"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Açıqlama
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Fayl açıqlamasını daxil edin"
                      rows="3"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Kateqoriya
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      placeholder="məs: Windows, Mac, Linux"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-4 pt-6 border-t border-gray-600">
                    <button
                      onClick={closeModal}
                      className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition-colors"
                    >
                      Ləğv et
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isUploading || !selectedFile}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 font-semibold transition-colors"
                    >
                      {isUploading && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      <Upload className="w-4 h-4" />
                      Fayl yüklə
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileManagementPanel;
