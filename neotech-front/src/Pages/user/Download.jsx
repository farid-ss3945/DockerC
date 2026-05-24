import { DownloadIcon, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { useGetFilesUserQuery, useDownloadFileMutation } from '../../store/API';
import { useTranslation } from 'react-i18next';

const Download = () => {
  const { t } = useTranslation();
  const { data: files, isLoading, error } = useGetFilesUserQuery();
  const [downloadFile, { isLoading: isDownloading }] = useDownloadFileMutation();
  const [downloadingId, setDownloadingId] = useState(null);

 const handleDownload = async (fileId, fileName) => {
  try {
    setDownloadingId(fileId);

    // Call the download mutation
    const result = await downloadFile(fileId).unwrap();

    // Use backend-provided filename, fallback to original name or default
    const finalFilename = result.originalFileName || fileName || "download.pdf";

    // Create link and trigger download
    const link = document.createElement("a");
    link.href = result.url;
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    setDownloadingId(null);
  } catch (err) {
    console.error("Download failed:", err);
    alert(t('download.downloadFailed'));
    setDownloadingId(null);
  }
};

  return (
    <section className='bg-[#f7fafc] inter pb-18 min-h-[80vh]'>
      <div className='md:max-w-[90vw] mx-auto'>
        <h1 className='text-2xl font-semibold text-center p-5 py-7 md:px-0 bg-white border-1 border-[#dee2e6] md:text-start md:bg-transparent md:border-0'>
          {t('downloadPage')}
        </h1>
      </div>

      <div className='max-w-[90vw] flex flex-col gap-3 lg:gap-x-16 lg:gap-y-10 mx-auto mt-8 sm:grid sm:grid-cols-2 lg:grid-cols-3'>
        {isLoading ? (
          <div className='col-span-full flex justify-center items-center py-12'>
            <Loader2 className='w-12 h-12 animate-spin text-gray-600' />
          </div>
        ) : error ? (
          <div className='col-span-full text-center py-12'>
            <p className='text-indigo-600 text-lg'>{t('download.failedToLoad')}</p>
          </div>
        ) : files?.length === 0 ? (
          <div className='col-span-full text-center py-12'>
            <p className='text-gray-600 text-lg'>{t('download.noFilesAvailable')}</p>
          </div>
        ) : (
          files?.map((file, index) => (
            <button
              key={file.id}
              onClick={() => handleDownload(file.id, file.originalFileName)}
              disabled={downloadingId === file.id}
              className={`bg-white rounded-lg border-1 border-[#dee2e6] p-6 md:p-8 py-8 flex justify-between items-center hover:shadow-lg transition-shadow duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                ${index >= 2 ? 'hidden sm:flex' : ''}
                ${index >= 4 ? 'hidden lg:flex' : ''}
              `}
            >
              <div className='flex flex-col gap-2 text-left'>
                <h1 className='font-semibold text-xl lg:text-2xl'>
                  {file.originalFileName || file.fileName || file.category || t('download.download')}
                </h1>
                <p className='text-[#4E4E4E] lg:text-lg'>
                  {file.description || t('download.clickToDownload')}
                </p>
              </div>
              <div className='border-1 border-[#BEBEBE] p-3 rounded-full hover:bg-gray-50 transition-colors'>
                {downloadingId === file.id ? (
                  <Loader2 className='w-6 h-6 animate-spin' />
                ) : (
                  <DownloadIcon />
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </section>
  );
};

export default Download;
