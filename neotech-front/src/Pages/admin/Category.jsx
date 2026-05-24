import { useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import Modal from '../../components/UI/Modal';
import AddCategoryUIStatic from '../../components/admin/CategoryAct/AddCategory';
import { Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import { useAddCategoryMutation, useDeleteCategoryMutation, useGetCategoriesQuery, useGetParentCategoriesQuery } from '../../store/API';
import EditCategoryUI from '../../components/admin/CategoryAct/EditCategory';

const Category = () => {
  const [modalType, setModalType] = useState(null); 
  const [edit, setEdit] = useState(null);
  const { data: categories, isLoading, error, refetch } = useGetCategoriesQuery();
  console.log(categories);
  const { data: ParCat, isParCatLoading} = useGetParentCategoriesQuery();
  console.log(ParCat);
  const [expanded, setExpanded] = useState({}); 

  const [deleteCategory] = useDeleteCategoryMutation();


  // ✅ Group categories by parentId
  const groupedCategories = useMemo(() => {
    if (!categories) return {};
    const map = {};
    categories.forEach(cat => {
      const parentId = cat.parentCategoryId || "root";
      if (!map[parentId]) map[parentId] = [];
      map[parentId].push(cat);
    });
    return map;
  }, [categories]);


  const handleDeleteCategory = async (id) => {
    try {
      await deleteCategory({ id }).unwrap();
      toast.success("Kateqoriya uğurla silindi");
      handleCloseModal();
    } catch (error) {
      toast.error(error?.data || "Kateqoriyanı silmək alınmadı");
    }
  };

  const handleCloseModal = () => {
    setModalType(null);
    setEdit(null);
    refetch();
  };

  const renderCategory = (cat) => {
    const hasChildren = groupedCategories[cat.id]?.length > 0;
    const isExpanded = expanded[cat.id];

    return (
      <li
        key={cat.id}
        className="flex flex-col bg-[#1f1f1f] text-white rounded-xl shadow hover:shadow-lg transition-all"
      >
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center gap-4">
            {hasChildren && (
              <button
                onClick={() =>
                  setExpanded((prev) => ({
                    ...prev,
                    [cat.id]: !prev[cat.id],
                  }))
                }
                className="text-gray-300 hover:text-white transition"
              >
                {isExpanded ? <ChevronDown /> : <ChevronRight />}
              </button>
            )}
            {!hasChildren && <div className="w-4" />} {/* Spacer for alignment */}

            <img
              className="w-10 h-10 rounded-full"
              src={
                `https://ecommerce100-001-site1.ntempurl.com${cat.imageUrl}` ||
                "https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/u_126ab356-44d8-4a06-89b4-fcdcc8df0245,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/85d1d12f-b0a5-49c0-bc81-6238cfc5d9ac/JORDAN+1+RETRO+HIGH+OG+%28PS%29.png"
              }
              alt=""
            />
            <div>
              <h2 className="text-lg font-medium">{cat.name}</h2>
              <p className="text-sm text-gray-400">{cat.slug || "slug"}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setModalType("edit");
                setEdit(cat);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Redaktə et
            </button>
            <button
              onClick={() => handleDeleteCategory(cat.id)}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
            >
              Sil
            </button>
          </div>
        </div>

        {/* Render children if expanded */}
        {hasChildren && isExpanded && (
          <ul className="ml-8 border-l border-gray-700 pl-4 space-y-2">
            {groupedCategories[cat.id].map((child) => renderCategory(child))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div className="p-6"> 
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Kateqoriyalar</h1>
        <button
          onClick={() => setModalType("add")}
          className="px-6 py-3 font-semibold rounded-lg bg-white text-black hover:bg-gray-200 transition-all"
        >
          Yeni kateqoriya əlavə et
        </button>
      </div>

      {/* Modals */}
      <Modal open={modalType === "add"} setOpen={handleCloseModal}>
        <AddCategoryUIStatic setOpen={handleCloseModal} categories={ParCat} />
      </Modal>

      <Modal open={modalType === "edit"} setOpen={handleCloseModal}>
        {!isLoading && (
          <EditCategoryUI setOpen={handleCloseModal} item={edit} categories={categories} />
        )}
      </Modal>

      {/* Category List */}
      <ul className="space-y-4">
        {isLoading ? (
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        ) : (
          groupedCategories["root"]?.map((cat) => renderCategory(cat))
        )}
      </ul>
    </div>
  );
};

export default Category;



