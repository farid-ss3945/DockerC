import React, { useEffect } from 'react';
import { Outlet } from "react-router";
import { FaRegUser } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import SideBar from '../../components/admin/Sidebar';

const AdminLayout = () => {
  const { t } = useTranslation();
  useEffect(() => {
    // Add custom scrollbar only for admin pages
    document.body.classList.add('dark-scrollbar');

    // Cleanup when leaving admin pages
    return () => {
      document.body.classList.remove('dark-scrollbar');
    };
  }, []); 

  return (
    <div className="flex min-h-screen bg-black">
      <SideBar />

      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        <header className="bg-black shadow-sm border-b border-gray-200 lg:pl-0 pl-16">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-xl font-semibold text-gray-100">
                {t('admin.adminPanel')}
              </h1>
              <div className="flex items-center space-x-4">
                <span className="hidden sm:block text-sm text-gray-100">
                  Xoş gəlmisən, Elnur
                </span>

                <div className="w-8 h-8 flex justify-center items-center bg-gray-300 rounded-full">
                  <FaRegUser />
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="bg-[#181818] flex-1 overflow-auto">
          <div className="sm:px-6 lg:px-8 py-6">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
