import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { translateDynamicField } from "../i18n";

export function  Breadcrumb({ productData = null, categoryData = null }) {
  const { i18n, t } = useTranslation();
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);


  
  // Dynamic translation states
  const [translatedProductData, setTranslatedProductData] = useState(null);
  const [translatedCategoryData, setTranslatedCategoryData] = useState(null);

  const formatName = (value) =>
    value.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const isId = (value) =>
    /^[0-9]+$/.test(value) ||
    /^[a-f0-9]{24}$/i.test(value) ||
    /^[0-9a-f-]{36}$/i.test(value);

  // Dynamic translation effect for product data
  useEffect(() => {
    async function translateProductData() {
      if (!productData) return;
      
      const targetLang = i18n.language;
      if (targetLang === 'en') {
        const translated = { ...productData };
        
        if (productData.name) {
          translated.name = await translateDynamicField(productData.name, targetLang);
        }
        if (productData.parentCategoryName) {
          translated.parentCategoryName = await translateDynamicField(productData.parentCategoryName, targetLang);
        }
        if (productData.subCategoryName) {
          translated.subCategoryName = await translateDynamicField(productData.subCategoryName, targetLang);
        }
        if (productData.categoryName) {
          translated.categoryName = await translateDynamicField(productData.categoryName, targetLang);
        }
        
        setTranslatedProductData(translated);
      } else {
        setTranslatedProductData(productData);
      }
    }
    translateProductData();
  }, [i18n.language, productData]);

  // Dynamic translation effect for category data
  useEffect(() => {
    async function translateCategoryData() {
      if (!categoryData) return;
      
      const targetLang = i18n.language;
      if (targetLang === 'en') {
        const translated = { ...categoryData };
        
        if (categoryData.parentCategoryName) {
          translated.parentCategoryName = await translateDynamicField(categoryData.parentCategoryName, targetLang);
        }
        if (categoryData.categoryName) {
          translated.categoryName = await translateDynamicField(categoryData.categoryName, targetLang);
        }
        
        setTranslatedCategoryData(translated);
      } else {
        setTranslatedCategoryData(categoryData);
      }
    }
    translateCategoryData();
  }, [i18n.language, categoryData]);

  // ✅ include "details" so breadcrumb works for your product detail page
  const isProductPage =
    pathnames.includes("product") ||
    pathnames.includes("products") ||
    pathnames.includes("details");

  // ✅ Category breadcrumb (Home > Parent Category > Sub Category)
  if (isProductPage && categoryData && !productData) {
    const currentCategoryData = translatedCategoryData || categoryData;
    return (
      <nav className="flex items-center space-x-2 text-sm text-[#8B96A5] inter overflow-x-auto scrollbar-hide whitespace-nowrap">
        <Link
          to="/"
          className="hover:text-gray-900 transition-colors text-sm lg:text-lg flex-shrink-0"
        >
          {t('productsPage.home')}
        </Link>

        {/* Parent Category */}
        {currentCategoryData.parentCategoryName && (
          <>
            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <Link
              to={`/categories/${currentCategoryData.parentCategorySlug
                ?.toLowerCase()
                .replace(/\s+/g, "-")}`}
              className="hover:text-gray-900 transition-colors text-sm lg:text-lg flex-shrink-0 whitespace-nowrap"
            >
              {currentCategoryData.parentCategoryName}
            </Link>
          </>
        )}

        {/* Sub Category */}
        {currentCategoryData.categoryName && (
          <>
            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="font-medium text-sm lg:text-lg text-black flex-shrink-0 whitespace-nowrap">
              {currentCategoryData.categoryName}
            </span>
          </>
        )}
      </nav>
    );
  }

  // ✅ Product breadcrumb (Home > Category > Subcategory > Product Name)
  if (isProductPage && productData) {
    const currentProductData = translatedProductData || productData;
    return (
      <nav className="flex items-center space-x-2 text-sm text-[#8B96A5] inter overflow-x-auto scrollbar-hide whitespace-nowrap">
        <Link
          to="/"
          className="hover:text-gray-900 transition-colors text-sm lg:text-lg flex-shrink-0"
        >
          {t('productsPage.home')}
        </Link>

        {/* Parent Category */}
        {currentProductData.parentCategoryName && (
          <>
            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <Link
              to={`/categories/${currentProductData.parentCategorySlug
                .toLowerCase()
                .replace(/\s+/g, "-")}`}
              className="hover:text-gray-900 transition-colors text-sm lg:text-lg flex-shrink-0 whitespace-nowrap"
            >
              {currentProductData.parentCategoryName}
            </Link>
          </>
        )}

        {/* Sub Category */}
        {(currentProductData.subCategoryName || 
          (currentProductData.categoryName && currentProductData.parentCategoryName && !currentProductData.subCategoryName)) && (
            <>
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <Link
                to={`/products/${currentProductData.categorySlug
                  ?.toLowerCase()
                  .replace(/\s+/g, "-")}`}
                className="hover:text-gray-900 transition-colors text-sm lg:text-lg flex-shrink-0 whitespace-nowrap"
              >
                {currentProductData.subCategoryName || currentProductData.categoryName}
              </Link>
            </>
          )}

        {/* Additional Category (only if different from subcategory and parent) */}
        {currentProductData.categoryName &&
          currentProductData.categoryName !== currentProductData.subCategoryName &&
          currentProductData.categoryName !== currentProductData.parentCategoryName &&
          (!currentProductData.parentCategoryName || currentProductData.subCategoryName) && (
            <>
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <Link
                to={`/category/${currentProductData.categoryName
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
                className="hover:text-gray-900 transition-colors text-sm lg:text-lg flex-shrink-0 whitespace-nowrap"
              >
                {currentProductData.categoryName}
              </Link>
            </>
          )}

        {/* Product Name */}
        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span className="font-medium text-sm lg:text-lg text-black flex-shrink-0 whitespace-nowrap">
          {currentProductData.name}
        </span>
      </nav>
    );
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-[#8B96A5] inter overflow-x-auto scrollbar-hide whitespace-nowrap">
      <Link
        to="/"
        className="hover:text-gray-900 transition-colors text-sm lg:text-lg flex-shrink-0"
      >
        {t('productsPage.home')}
      </Link>

      {pathnames.map((value, index) => {
        if (isId(value) || value == "categories")  return null;
        

        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;

        return (
          <React.Fragment key={to}>
            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            {isLast ? (
              <span className="font-medium text-sm lg:text-lg text-black flex-shrink-0 whitespace-nowrap">
                {formatName(value)}
              </span>
            ) : (
              <Link
                to={to}
                className="hover:text-gray-900 transition-colors text-sm lg:text-lg flex-shrink-0 whitespace-nowrap"
              >
                {formatName(value)}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
