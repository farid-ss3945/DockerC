import { BrowserRouter, Routes, Route, Outlet, useLocation } from "react-router";
import Header from "../components/user/Header";
import Footer from "../components/user/Footer";
import Home from "../components/user/Home";
import Products from "../Pages/user/Products";
import Details from "../Pages/user/Details";
import Cart from "../Pages/user/Cart";
import WishList from "../Pages/user/WishList";
import About from "../Pages/user/About";
import Contact from "../Pages/user/Contact";
import Download from "../Pages/user/Download";
import Secure from "../Pages/user/Secure";
import Software from "../Pages/user/Software";
import Login from "../Pages/user/Login";
import ForgotPassword from "../Pages/user/forgotPassword";
import ResetPassword from "../Pages/user/resetPassword";
import Auth from "./Auth";
import Profile from "../Pages/user/Profile";
import AdminLayout from "../Pages/admin/AdminLayout";
import Users from "../Pages/admin/User";
import Category from "../Pages/admin/Category";
import ProductsUI from "../Pages/admin/ProductsAdmin";
import SubCategories from "../Pages/user/SubCategories";
import ScrollToTop from "../components/user/ScrollToTop";
import BannersUI from "../components/admin/Banner/BannerUi";
import FilterUi from "../Pages/admin/FilterUi";
import ProductSpec from "../Pages/admin/ProductSpec"
import AssignFilter from "../Pages/admin/AssignFilter"
import FileManagementPanel from "../components/admin/FileUpload/FIleUI";
import { SearchProvider } from "./Context";
import WP from '../components/UI/WP'
import Register from "../Pages/user/Register";
import Brands from "../Pages/user/Brands";
import Brand from "../Pages/admin/Brand";
import ErrorPage from "../products/ErrorPage";
const Router = () => {
  
  return (
    <BrowserRouter>
      <ScrollToTop />
      <SearchProvider>
       
        <Routes>
        {/* Login page */}
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* User layout */}
        <Route
          path="/"
          element={
            <>
              <Header />
              <Outlet />
              <Footer />
              <WP />
            </>
          }
          
        >
          <Route index element={<Home />} />
          <Route path="products/:slug?" element={<Products />} /> 
          <Route path="products/brand/:slug?" element={<Products />} />

          
          <Route path="/details/:id" element={<Details />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/favorites" element={<WishList />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="download" element={<Download />} />
          <Route path="secure" element={<Software />} />
          <Route path="software" element={<Secure />} />
          <Route path="profile" element={<Profile />} />
          <Route path="/categories/:slug" element={<SubCategories />} />
          <Route path="/brands" element={<Brands />} />

          {/* 404 Error Page - MUST BE LAST */}
           
        </Route>
        <Route path="*" element={<ErrorPage />} />

        {/* Admin layout with Auth wrapper */}
        <Route
          path="/admin"
          element={
            <Auth>
              <AdminLayout />
            </Auth> 
          }
        >
            <Route index element={<Users />} />
            <Route path="category" element={<Category />} />
            <Route path="products" element={<ProductsUI />} />
            <Route path="products/:id" element={<ProductSpec />} />
            <Route path="banners" element={<BannersUI />} />
            <Route path="filters" element={<FilterUi />} />
            <Route path="product-filters" element={<AssignFilter />} />
            <Route path="file-management" element={<FileManagementPanel />} />
            <Route path="brands" element={<Brand />} />
        </Route>
        </Routes>
      </SearchProvider>
    </BrowserRouter>
  );
};

export default Router;
