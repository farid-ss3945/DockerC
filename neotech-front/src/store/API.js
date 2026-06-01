import {
  createApi,
  fetchBaseQuery
} from '@reduxjs/toolkit/query/react';

export const API = createApi({
  reducerPath: 'API',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://16.171.149.77:5056',
    prepareHeaders: (headers, {
      endpoint,
      body
    }) => {
      const isFormDataRequest =
        endpoint === 'addProduct' ||
        endpoint === 'addCategoryImage' ||
        endpoint === 'addDetailImages' ||
        endpoint === 'addBanner' ||
        endpoint === 'uploadFile' ||
        endpoint === 'addProductPdf' ||
        endpoint === 'editProductWithImage' ||
        endpoint === 'addBrandImage' ||
        endpoint === 'editCategoryWithImage' ||
        endpoint === 'editBrandWithImage' ||
        endpoint === 'uploadMobileImage' ||
        endpoint === 'uploadDesktopImage' ||
        body instanceof FormData;

      if (!isFormDataRequest) {
        headers.set('Content-Type', 'application/json');
      }

      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      return headers;
    },
  }),

  tagTypes: ['Categories', 'Users', 'Products', 'Banners', 'Filters', 'Cart', 'Auth', 'Brands', 'ProductPdfs', 'Files', 'FilesUser'],

  endpoints: builder => ({
    // *AUTHENTICATION*
    login: builder.mutation({
      query: ({
        email,
        password
      }) => ({
        url: '/api/v1/Auth/login',
        method: 'POST',
        body: {
          email,
          password
        },
      }),
      invalidatesTags: ['Auth', 'Products'],
    }),

    signup: builder.mutation({
      query: ({
        firstName,
        lastName,
        email,
        phoneNumber,
        password,
        confirmPassword
      }) => ({
        url: '/api/v1/Auth/register',
        method: 'POST',
        body: {
          firstName,
          lastName,
          email,
          phoneNumber,
          password,
          confirmPassword,
        },
      }),
      invalidatesTags: ['Auth'],
    }),

    forgotPassword: builder.mutation({
      query: ({
        email
      }) => ({
        url: '/api/v1/Auth/forgot-password',
        method: 'POST',
        body: {
          email,
        },
      }),
      invalidatesTags: ['Auth'],
    }),

    resetPassword: builder.mutation({
      query: ({
        token,
        newPassword,
        confirmNewPassword
      }) => ({
        url: '/api/v1/Auth/reset-password',
        method: 'POST',
        body: {
          token,
          newPassword,
          confirmNewPassword,
        },
      }),
      invalidatesTags: ['Auth'],
    }),

    // *CATEGORIES*
    getParentCategories: builder.query({
      query: () => ({
        url: 'http://16.171.149.77/api/v1/Categories/root',
        method: 'GET',
      }), 
      providesTags: ['Categories'],
    }),

    getSubCategories: builder.query({
      query: (id) => ({
        url: `http://16.171.149.77/api/v1/Categories/${id}/subcategories`,
        method: 'GET',
      }),
      providesTags: ['Categories'],
    }),

    getCategory: builder.query({
      query: (slug) => ({
        url: `http://16.171.149.77/api/v1/Categories/slug/${slug}`,
        method: 'GET',
      }),
      providesTags: ['Categories'],
    }),

    addCategory: builder.mutation({
      query: ({
        name,
        imageUrl,
        description,
        sortOrder,
        parentCategoryId
      }) => ({
        url: 'http://16.171.149.77/api/v1/Categories',
        method: 'POST',
        body: {
          name,
          description,
          imageUrl,
          sortOrder,
          parentCategoryId,
        },
      }),
      invalidatesTags: ['Categories'],
    }),

    editCategory: builder.mutation({
      query: ({
        name,
        imageUrl,
        description,
        sortOrder,
        id,
        isActive
      }) => ({
        url: `http://16.171.149.77/api/v1/Categories/${id}`,
        method: 'PUT',
        body: {
          name,
          description,
          imageUrl,
          isActive,
          sortOrder,
        },
      }),
      invalidatesTags: ['Categories'],
    }),

    editCategoryWithImage: builder.mutation({
      query: ({
        id,
        formData
      }) => ({
        url: `http://16.171.149.77/api/v1/Categories/${id}/with-image`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['Categories'], 
    }),

    deleteCategory: builder.mutation({
      query: ({
        id
      }) => ({
        url: `http://16.171.149.77/api/v1/Categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Categories'],
    }),

    addCategoryImage: builder.mutation({
      query: formData => ({
        url: 'http://16.171.149.77/api/v1/Categories/with-image',
        method: 'POST',
        body: formData,
        prepareHeaders: headers => {
          headers.delete('Content-Type');
          return headers;
        },
      }),
      invalidatesTags: ['Categories'],
    }),

    // *USERS*
    getMe: builder.query({
      query: () => ({
        url: '/api/v1/Auth/me',
        method: 'GET',
      }),
      providesTags: ['Auth'],
    }),

    getUsers: builder.query({
      query: () => ({
        url: '/api/v1/Admin/Users',
        method: 'GET',
      }),
      providesTags: ['Users'],
    }),

    getUserStatics: builder.query({
      query: () => ({
        url: '/api/v1/Admin/users/statistics',
        method: 'GET',
      }),
      providesTags: ['Users'],
    }),

    getUserRoles: builder.query({
      query: () => ({
        url: '/api/v1/Admin/users/roles',
        method: 'GET',
      }),
      providesTags: ['Users'],
    }),

    changePassword: builder.mutation({
      query: ({
        newPass,
        currentPass,
        confirmNewPassword
      }) => ({
        url: '/api/v1/Auth/change-password',
        method: 'POST',
        body: {
          currentPassword: currentPass,
          newPassword: newPass,
          confirmNewPassword,
        },
      }),
      invalidatesTags: ['Auth'],
    }),

    getCategories: builder.query({
      query: () => ({
        url: '/api/v1/Categories',
        method: 'GET',
      }),
      providesTags: ['Categories'],
    }),

    editUser: builder.mutation({
      query: ({
        firstName,
        lastName,
        phoneNumber,
        role,
        isActive,
        id
      }) => ({
        url: `/api/v1/Admin/users/${id}`,
        method: 'PUT',
        body: {
          firstName,
          lastName,
          phoneNumber,
          role,
          isActive
        },
      }),
      invalidatesTags: ['Users'],
    }),

    deleteUser: builder.mutation({
      query: ({
        id
      }) => ({
        url: `/api/v1/Admin/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),

    editUserRole: builder.mutation({
      query: ({
        role,
        id
      }) => ({
        url: `/api/v1/Admin/users/${id}/role`,
        method: 'PUT',
        body: {
          role
        },
      }),
      invalidatesTags: ['Users'],
    }),

    activateUser: builder.mutation({
      query: ({
        id
      }) => ({
        url: `/api/v1/Admin/users/${id}/activate`,
        method: 'POST',
      }),
      invalidatesTags: ['Users'],
    }),

    deActivateUser: builder.mutation({
      query: ({
        id
      }) => ({
        url: `/api/v1/Admin/users/${id}/deactivate`,
        method: 'POST',
      }),
      invalidatesTags: ['Users'],
    }),

    logout: builder.mutation({
      query: () => ({
        url: '/api/v1/Auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth', 'Cart'],
    }),

    // *PRODUCTS*
    getProducts: builder.query({
      query: () => ({
        url: '/api/v1/Products',
        method: 'GET',
      }),
      providesTags: ['Products'],
    }),

    getProductsPaginated: builder.query({
      query: ({ page = 1, pageSize = 12 } = {}) => ({
        url: '/api/v1/Products/paginated',
        method: 'GET',
        params: {
          Page: page,
          PageSize: pageSize,
        },
      }),
      providesTags: ['Products'],
    }),

    getProductsCategoryIdPage: builder.query({
      query: ({ categoryId, page = 1, pageSize = 12 } = {}) => ({
        url: `/api/v1/Products/category/${categoryId}/paginated`,
        method: 'GET',
        params: {
          Page: page,
          PageSize: pageSize,
        },
      }),
      providesTags: ['Products'],
    }),

    getProductsCategorySlugPage: builder.query({
      query: ({ categorySlug, page = 1, pageSize = 12 } = {}) => ({
        url: `/api/v1/Products/category/slug/${categorySlug}/paginated`,
        method: 'GET',
        params: {
          Page: page,
          PageSize: pageSize,
        },
      }),
      providesTags: ['Products'],
    }),

    getProductsBrandPage: builder.query({
      query: ({ brandSlug, page = 1, pageSize = 12 } = {}) => ({
        url: `/api/v1/Products/brand/${brandSlug}/paginated`,
        method: 'GET',
        params: {
          Page: page,
          PageSize: pageSize,
        },
      }),
      providesTags: ['Products'],
    }),

    getHotDealsPage: builder.query({
      query: ({ page = 1, pageSize = 12 } = {}) => ({
        url: '/api/v1/Products/hot-deals/paginated',
        method: 'GET',
        params: {
          Page: page,
          PageSize: pageSize,
        },
      }),
      providesTags: ['Products'],
    }),

    searchProductsPage: builder.query({
      query: ({ searchTerm = '', page = 1, pageSize = 12 } = {}) => ({
        url: '/api/v1/Products/search/paginated',
        method: 'GET',
        params: {
          SearchTerm: searchTerm,
          Page: page,
          PageSize: pageSize,
        },
      }),
      providesTags: ['Products'],
    }),

    getRecommendedPage: builder.query({
      query: ({ productId, categoryId, limit = 4, page = 1, pageSize = 4 } = {}) => ({
        url: '/api/v1/Products/recommendations/paginated',
        method: 'GET',
        params: {
          ProductId: productId,
          CategoryId: categoryId,
          Limit: limit,
          Page: page,
          PageSize: pageSize,
        },
      }),
      providesTags: ['Products'],
    }),

    getProduct: builder.query({
      query: (id) => ({
        url: `/api/v1/Products/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{
        type: 'Products',
        id
      }],
    }),

    getProductsBrand: builder.query({
      query: ({ brandSlug }) => ({
        url: `/api/v1/Products/brand/${brandSlug}`,
        method: 'GET',
      }),
    }),

    getBrands: builder.query({
      query: () => ({
        url: '/api/v1/Admin/brands',
        method: 'GET',
      }),
    }),

    getBrand: builder.query({
      query: ({ id }) => ({
        url: `/api/v1/Admin/brands/${id}`,
        method: 'GET',
      }),
    }),

    getHotDeals: builder.query({
      query: ({ limit }) => ({
        url: '/api/v1/Products/hot-deals',
        method: 'GET',
        params: { limit }
      }),
      providesTags: ['Products'],
    }),

    getRecommended: builder.query({
      query: ({ categoryId, productId, limit }) => ({
        url: '/api/v1/Products/recommendations',
        method: 'GET',
        params: {
          categoryId,
          productId,
          limit,
        },
      }),
      providesTags: ['Products'],
    }),

    getProductsSummary: builder.query({
      query: () => ({
        url: '/api/v1/Admin/products/stock/summary',
        method: 'GET',
      }),
      providesTags: ['Products'],
    }),

    addProduct: builder.mutation({
      query: formData => ({
        url: '/api/v1/Products/with-image',
        method: 'POST',
        body: formData,
        prepareHeaders: headers => {
          headers.delete('Content-Type');
          return headers;
        },
      }),
      invalidatesTags: ['Products'],
    }),

    addDetailImages: builder.mutation({
      query: ({ id, images }) => ({
        url: `/api/v1/Products/${id}/upload-images`,
        method: 'POST',
        body: images,
        prepareHeaders: headers => {
          headers.delete('Content-Type');
          return headers;
          },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Products', id }, 'Products'],
    }),

    deleteProduct: builder.mutation({
      query: ({ id }) => ({
        url: `/api/v1/Products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Products'],
    }),

    editProduct: builder.mutation({
      query: ({
        name,
        description,
        shortDescription,
        isActive,
        isHotDeal,
        stockQuantity,
        categoryId,
        id,
      }) => ({
        url: `/api/v1/Products/${id}`,
        method: 'PUT',
        body: {
          name,
          description,
          shortDescription,
          isActive,
          isHotDeal,
          stockQuantity,
          categoryId,
        },
      }),
      invalidatesTags: ['Products'],
    }),

    filterProducts: builder.mutation({
      query: formData => ({
        url: '/api/v1/Products/filter',
        method: 'POST',
        body: formData,
        prepareHeaders: headers => {
          headers.delete('Content-Type');
          return headers;
        },
      }),
    }),

    editProductWithImage: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/api/v1/Products/${id}/with-files`,
        method: 'PUT',
        body: formData,
        prepareHeaders: (headers) => {
          headers.delete('Content-Type');
          return headers;
        },
      }),
      invalidatesTags: ['Products'],
    }),

    deleteDetailImage: builder.mutation({
      query: ({ id, imageUrl }) => ({
        url: `/api/v1/Products/${id}/delete-detail-image?imageUrl=${encodeURIComponent(imageUrl)}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Products', id }],
    }),

    deleteProductImage: builder.mutation({
      query: ({ id }) => ({
        url: `/api/v1/Products/images/${id}`,
        method: 'DELETE',
      })
    }),

    searchProducts: builder.query({
      query: ({ q }) => ({
        url: '/api/v1/Products/global-search',
        method: 'GET',
        params: { q },
      }),
      providesTags: ['Products'],
    }),

    // *PRODUCT SPECIFICATIONS*
    getProductSpecifications: builder.query({
      query: (id) => ({
        url: `/api/v1/Products/${id}/specifications`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Products', id }],
    }),

    getProductsCategorySlug: builder.query({
      query: (categorySlug) => ({
        url: `/api/v1/Products/category/slug/${categorySlug}`,
        method: 'GET',
      }),
      providesTags: (result, error, slug) => [{ type: 'Products', id: slug }],
    }),

    addProductSpecifications: builder.mutation({
      query: ({ id, productId, specificationGroups }) => ({
        url: `/api/v1/Products/${id}/specifications`,
        method: 'POST',
        body: {
          productId,
          specificationGroups,
        },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Products', id }],
    }),

    updateProductSpecifications: builder.mutation({
      query: ({ id, specificationGroups }) => ({
        url: `/api/v1/Products/${id}/specifications`,
        method: 'PUT',
        body: {
          specificationGroups,
        },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Products', id }],
    }),

    deleteProductSpecifications: builder.mutation({
      query: ({ id }) => ({
        url: `/api/v1/Products/${id}/specifications`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Products', id }],
    }),

    // *BANNERS*
    getBanners: builder.query({
      query: () => ({
        url: '/api/v1/Admin/banners',
        method: 'GET',
      }),
      providesTags: ['Banners'],
    }),

    deleteBanner: builder.mutation({
      query: ({ id }) => ({
        url: `/api/v1/Admin/banners/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Banners'],
    }),

    addBanner: builder.mutation({
      query: formData => ({
        url: '/api/v1/Admin/banners/with-image',
        method: 'POST',
        body: formData,
        prepareHeaders: headers => {
          headers.delete('Content-Type');
          return headers;
        },
      }),
      invalidatesTags: ['Banners'],
    }),

    updateBanner: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/v1/Admin/banners/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Banners'],
    }),

    uploadMobileImage: builder.mutation({
      query: ({ id, imageFile }) => {
        const formData = new FormData();
        formData.append('imageFile', imageFile);
        return {
          url: `/api/v1/Admin/banners/${id}/upload-mobile-image`,
          method: 'POST',
          body: formData,
          prepareHeaders: headers => {
            headers.delete('Content-Type');
            return headers;
          },
        };
      },
      invalidatesTags: ['Banners'],
    }),

    uploadDesktopImage: builder.mutation({
      query: ({ id, imageFile }) => {
        const formData = new FormData();
        formData.append('imageFile', imageFile);
        return {
          url: `/api/v1/Admin/banners/${id}/upload-image`,
          method: 'POST',
          body: formData,
          prepareHeaders: headers => {
            headers.delete('Content-Type');
            return headers;
          },
        };
      },
      invalidatesTags: ['Banners'],
    }),

    // *FILTERS*
    getFilters: builder.query({
      query: () => ({
        url: '/api/v1/Products/filters',
        method: 'GET',
      }),
      providesTags: ['Filters'],
    }),

    addFilter: builder.mutation({
      query: ({ name, isActive, sortOrder, options }) => ({
        url: '/api/v1/Admin/filters',
        method: 'POST',
        body: {
          name,
          type: 0,
          isActive,
          sortOrder: sortOrder ?? 0,
          options,
        },
      }),
      invalidatesTags: ['Filters'],
    }),

    removeFilter: builder.mutation({
      query: ({ id }) => ({
        url: `/api/v1/Admin/filters/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Filters'],
    }),

    removeFilterOption: builder.mutation({
      query: ({ filterId, optionId }) => ({
        url: `/api/v1/Admin/filters/${filterId}/options/${optionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Filters'],
    }),

    removeAllFiltersFromProduct: builder.mutation({
      query: ({ productId }) => ({
        url: `/api/v1/Admin/products/${productId}/filters`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Filters'],
    }),

    removeCustomFilterFromProduct: builder.mutation({
      query: ({ productId, filterId }) => ({
        url: `/api/v1/Admin/products/${productId}/filters/${filterId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Filters'],
    }),

    updateFilter: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/v1/Admin/filters/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Filters'],
    }),

    updateFilterOption: builder.mutation({
      query: ({ filterId, optionId, ...data }) => ({
        url: `/api/v1/Admin/filters/${filterId}/options/${optionId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Filters'],
    }),

    assignFilter: builder.mutation({
      query: (filterData) => ({
        url: '/api/v1/Admin/products/filters/assign',
        method: 'POST',
        body: filterData,
      }),
      invalidatesTags: ['Filters', 'Products'],
    }),

    getCategoryFilters: builder.query({
      query: (categoryId) => ({
        url: `/api/v1/Products/category/${categoryId}/filters`,
        method: 'GET',
      }),
      providesTags: (result, error, categoryId) => [{ type: 'CategoryFilters', id: categoryId }],
    }),

    assignFiltersBulk: builder.mutation({
      query: (bulkFilterData) => ({
        url: '/api/v1/Admin/products/filters/bulk-assign',
        method: 'POST',
        body: bulkFilterData,
      }),
      invalidatesTags: ['Filters', 'Products'],
    }),

    // *CART*
    addCartItem: builder.mutation({
      query: ({ productId, quantity }) => ({
        url: '/api/v1/cart/items',
        method: 'POST',
        body: { productId, quantity },
      }),
      invalidatesTags: ['Cart'],
    }),

    getCartItems: builder.query({
      query: () => ({
        url: '/api/v1/Cart',
        method: 'GET',
      }),
      providesTags: ['Cart'],
    }),

    getCartCount: builder.query({
      query: () => ({
        url: '/api/v1/Cart/count',
        method: 'GET',
      }),
      providesTags: ['Cart'],
    }),

    updateCartItemQuantity: builder.mutation({
      query: ({ cartItemId, quantity }) => ({
        url: `/api/v1/Cart/items/${cartItemId}`,
        method: 'PUT',
        body: { quantity },
      }),
      invalidatesTags: ['Cart'],
    }),

    removeCartItem: builder.mutation({
      query: ({ id }) => ({
        url: `/api/v1/Cart/items/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),

    removeCart: builder.mutation({
      query: () => ({
        url: `/api/v1/Cart`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),

    createWhatsappOrder: builder.mutation({
      query: (orderData) => ({
        url: '/api/v1/Cart/whatsapp-order',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Cart'],
    }),

    quickOrder: builder.mutation({
      query: (orderData) => ({
        url: '/api/v1/Cart/quick-order',
        method: 'POST',
        body: orderData,
      })
    }),

    // *FAVORITES*
    addFavorite: builder.mutation({
      query: ({ productId }) => ({
        url: '/api/v1/Favorites',
        method: 'POST',
        body: { productId },
      }),
      invalidatesTags: ['Favorites', 'Products'],
    }),

    removeFavorite: builder.mutation({
      query: ({ productId }) => ({
        url: `/api/v1/Favorites/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Favorites', 'Products'],
    }),

    getFavorites: builder.query({
      query: ({ page = 1, pageSize = 20 } = {}) => ({
        url: '/api/v1/Favorites',
        method: 'GET',
        params: { page, pageSize },
      }),
      providesTags: ['Favorites'],
    }),

    getFavoritesCount: builder.query({
      query: () => ({
        url: '/api/v1/Favorites/count',
        method: 'GET',
      }),
      providesTags: ['Favorites'],
    }),

    getFavoriteStatus: builder.query({
      query: ({ productId }) => ({
        url: `/api/v1/Favorites/status/${productId}`,
        method: 'GET',
      }),
      providesTags: (result, error, { productId }) => [{ type: 'Favorites', id: productId }],
    }),

    toggleFavorite: builder.mutation({
      query: ({ productId }) => ({
        url: `/api/v1/Favorites/toggle/${productId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Favorites', 'Products'],
    }),

    bulkCheckFavoriteStatus: builder.mutation({
      query: (productIds) => ({
        url: '/api/v1/Favorites/bulk-status',
        method: 'POST',
        body: productIds,
      }),
    }),

    clearFavorites: builder.mutation({
      query: () => ({
        url: '/api/v1/Favorites/clear',
        method: 'DELETE',
      }),
      invalidatesTags: ['Favorites'],
    }),

    // *FILES & PDFS*
    getFilesUser: builder.query({
      query: () => '/api/v1/files',
      providesTags: ['FilesUser'],
    }),

    getFiles: builder.query({
      query: () => '/api/v1/Admin/files',
      providesTags: ['Files'],
    }),

    getFileById: builder.query({
      query: (id) => `/api/v1/Admin/files/${id}`,
      providesTags: (result, error, id) => [{ type: 'Files', id }],
    }),

    removeFile: builder.mutation({
      query: (id) => ({
        url: `/api/v1/Admin/files/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Files'],
    }),

    uploadFile: builder.mutation({
      query: (formData) => ({
        url: '/api/v1/Admin/files/upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Files'],
    }),

    getProductPdfs: builder.query({
      query: () => ({
        url: '/api/v1/Admin/product-pdfs',
        method: 'GET',
      }),
      providesTags: ['ProductPdfs'],
    }),

    getProductPdfById: builder.query({
      query: ({ id }) => ({
        url: `/api/v1/Admin/product-pdfs/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, { id }) => [{ type: 'ProductPdfs', id }],
    }),

    addProductPdf: builder.mutation({
      query: ({ productId, formData }) => ({
        url: `/api/v1/Admin/products/${productId}/pdf`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['ProductPdfs', 'Products'],
    }),

    deleteProductPdf: builder.mutation({
      query: ({ id }) => ({
        url: `/api/v1/Admin/product-pdfs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ProductPdfs', 'Products'],
    }),

    getProductPdfByIdUser: builder.query({
      query: ({ productId }) => ({
        url: `/api/v1/product-pdfs/download/product/${productId}`,
        method: 'GET',
        responseHandler: async (response) => {
          if (!response.ok) throw new Error('Failed to download PDF');
          return await response.blob();
        },
      }),
      keepUnusedDataFor: 60,
    }),

    downloadFile: builder.mutation({
      queryFn: async (id) => {
        try {
          const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
          const response = await fetch(`http://16.171.149.77:5056/Files/download/${id}`, {
            method: 'GET',
            headers: { 'Authorization': token ? `Bearer ${token}` : '' },
          });

          if (!response.ok) {
            const errorText = await response.text();
            return { error: { status: response.status, data: { message: errorText || 'Download failed' } } };
          }

          const blob = await response.blob();
          const contentDisposition = response.headers.get('content-disposition');
          let filename = 'download.pdf';

          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename\*?=['"]?(?:UTF-8'')?([^;\r\n"']*)['"]?/);
            if (filenameMatch && filenameMatch[1]) filename = decodeURIComponent(filenameMatch[1]);
          }

          const url = window.URL.createObjectURL(blob);
          return { data: { url, filename } };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', data: { message: error.message } } };
        }
      },
    }),

    // *BRANDS*
    getBrandsAdmin: builder.query({
      query: () => ({
        url: '/api/v1/Brands',
        method: 'GET',
      }),
      providesTags: ['Brands'],
    }),

    getBrandById: builder.query({
      query: (id) => `/api/v1/Brands/${id}`,
      providesTags: (result, error, id) => [{ type: 'Brands', id }],
    }),

    getBrandBySlug: builder.query({
      query: (slug) => `/api/v1/Brands/slug/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Brands', id: slug }],
    }),

    addBrandImage: builder.mutation({
      query: ({ name, sortOrder, file }) => {
        const formData = new FormData();
        formData.append("imageFile", file, file.name);
        return {
          url: `/api/v1/Brands/with-image?name=${encodeURIComponent(name)}&sortOrder=${sortOrder}`,
          method: 'POST',
          body: formData,
          prepareHeaders: (headers) => {
            headers.delete('Content-Type');
            return headers;
          },
        };
      },
      invalidatesTags: ['Brands'],
    }),

    editBrand: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/v1/Brands/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Brands'],
    }),

    // ADDED: Missing endpoint for your file-upload brand edits
    editBrandWithImage: builder.mutation({
      query: ({ id, name, sortOrder, file }) => {
        const formData = new FormData();
        if (file) formData.append("imageFile", file, file.name);
        return {
          url: `/api/v1/Brands/${id}/with-image?name=${encodeURIComponent(name)}&sortOrder=${sortOrder}`,
          method: 'PUT',
          body: formData,
          prepareHeaders: (headers) => {
            headers.delete('Content-Type');
            return headers;
          },
        };
      },
      invalidatesTags: ['Brands'],
    }),

    deleteBrand: builder.mutation({
      query: ({ id }) => ({
        url: `/api/v1/Brands/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Brands'],
    }),
  }),
});

// Export all auto-generated hooks based on endpoints configuration
export const {
  useLoginMutation,
  useSignupMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetParentCategoriesQuery,
  useGetSubCategoriesQuery,
  useGetCategoryQuery,
  useAddCategoryMutation,
  useEditCategoryMutation,
  useEditCategoryWithImageMutation,
  useDeleteCategoryMutation,
  useAddCategoryImageMutation,
  useGetMeQuery,
  useGetUsersQuery,
  useGetUserStaticsQuery,
  useGetUserRolesQuery,
  useChangePasswordMutation,
  useGetCategoriesQuery,
  useEditUserMutation,
  useDeleteUserMutation,
  useEditUserRoleMutation,
  useActivateUserMutation,
  useDeActivateUserMutation,
  useLogoutMutation,
  useGetProductsQuery,
  useGetProductsPaginatedQuery,
  useGetProductsCategoryIdPageQuery,
  useGetProductsCategorySlugPageQuery,
  useGetProductsBrandPageQuery,
  useGetHotDealsPageQuery,
  useSearchProductsPageQuery,
  useGetRecommendedPageQuery,
  useGetProductQuery,
  useGetProductsBrandQuery,
  useGetBrandsQuery,
  useGetBrandQuery,
  useGetHotDealsQuery,
  useGetRecommendedQuery,
  useGetProductsSummaryQuery,
  useAddProductMutation,
  useAddDetailImagesMutation,
  useDeleteProductMutation,
  useEditProductMutation,
  useFilterProductsMutation,
  useEditProductWithImageMutation,
  useDeleteDetailImageMutation,
  useDeleteProductImageMutation,
  useSearchProductsQuery,
  useGetProductSpecificationsQuery,
  useGetProductsCategorySlugQuery,
  useAddProductSpecificationsMutation,
  useUpdateProductSpecificationsMutation,
  useDeleteProductSpecificationsMutation,
  useGetBannersQuery,
  useDeleteBannerMutation,
  useAddBannerMutation,
  useUpdateBannerMutation,
  useUploadMobileImageMutation,
  useUploadDesktopImageMutation,
  useGetFiltersQuery,
  useAddFilterMutation,
  useRemoveFilterMutation,
  useRemoveFilterOptionMutation,
  useRemoveAllFiltersFromProductMutation,
  useRemoveCustomFilterFromProductMutation,
  useUpdateFilterMutation,
  useUpdateFilterOptionMutation,
  useAssignFilterMutation,
  useGetCategoryFiltersQuery,
  useAssignFiltersBulkMutation,
  useAddCartItemMutation,
  useGetCartItemsQuery,
  useGetCartCountQuery,
  useUpdateCartItemQuantityMutation,
  useRemoveCartItemMutation,
  useRemoveCartMutation,
  useCreateWhatsappOrderMutation,
  useQuickOrderMutation,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
  useGetFavoritesQuery,
  useGetFavoritesCountQuery,
  useGetFavoriteStatusQuery,
  useToggleFavoriteMutation,
  useBulkCheckFavoriteStatusMutation,
  useClearFavoritesMutation,
  useGetFilesUserQuery,
  useGetFilesQuery,
  useGetFileByIdQuery,
  useRemoveFileMutation,
  useUploadFileMutation,
  useGetProductPdfsQuery,
  useGetProductPdfByIdQuery,
  useAddProductPdfMutation,
  useDeleteProductPdfMutation,
  useGetProductPdfByIdUserQuery,
  useDownloadFileMutation,
  useGetBrandsAdminQuery,
  useGetBrandByIdQuery,
  useGetBrandBySlugQuery,
  useAddBrandImageMutation,
  useEditBrandMutation,
  useEditBrandWithImageMutation,
  useDeleteBrandMutation
  // 👈 Exported cleanly here
} = API;