import React, { useState, useEffect } from "react";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload";
import Search_bar from '../../assets/Search_bar.png'


const API_BASE_URL = import.meta.env.VITE_API_URL;

function CategoryList() {
  const [categories, setCategories] = useState([]);


  
    const [categorySearch, setCategorySearch] = useState("");
  

  const [editingCategoryId, setEditingCategoryId] = useState(null);


  const [categoryForm, setCategoryForm] = useState({ name: "", image_url: "" });
  
  const [categoryImageFile, setCategoryImageFile] = useState(null);








  useEffect(() => {
    fetch(`${API_BASE_URL}/api/get-categories`)
      .then((res) => res.json())
      .then(setCategories);
  }, []);

  





  // DELETE
  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    await fetch(`${API_BASE_URL}/api/categories/${id}`, { method: "DELETE" });
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };


  // EDIT
  const startEditCategory = (cat) => {
    setEditingCategoryId(cat.id);
    setCategoryForm({ name: cat.name, image_url: cat.image_url });
    setCategoryImageFile(null);
  };



  // UPDATE
  const handleUpdateCategory = async (id) => {
    let imageUrl = categoryForm.image_url;

    if (categoryImageFile) {
      imageUrl = await uploadToCloudinary(categoryImageFile, "categories");
      if (!imageUrl) return alert("Image upload failed");
    }

    const res = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: categoryForm.name, image_url: imageUrl }),
    });

    const updated = await res.json();

    setCategories((prev) =>
      prev.map((c) => (c.id === id ? updated.category : c))
    );

    setEditingCategoryId(null);
    setCategoryImageFile(null);
  };





  return (
    <div>
{/* category table */}
   
        <section>

          {categories.length === 0 && (
              <div className="mt-[5cm]">
                              <img src={Search_bar} alt="" className=" ml-[12cm]" />
                             <p className="text-center  text-gray-500 text-5xl -mt-30">
             
                             No categories yet — add categories to organize products
                             </p> 
                           </div>
                            
            )}
          
          
            {categories.length > 0 && (
              <>
            
          <h2 className="text-2xl font-bold mb-4 text-green-700">
            Categories List
          </h2>

          <input
            type="text"
            placeholder="Search..."
            className="mb-4 px-4 py-2 border rounded-lg"
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
          />

          <div className="overflow-x-auto mt-8">
  <table className="min-w-full">
    <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-3  text-left">ID</th>
                  <th className="px-4 py-3  text-left">Name</th>
                  <th className="px-4 py-3  text-center">Image</th>
                  <th className="px-4 py-3  text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                
                {categories
                  .filter(
                    (c) =>
                      c.name
                        .toLowerCase()
                        .includes(categorySearch.toLowerCase()) ||
                      c.id.toString().includes(categorySearch)
                  )
                  .map((cat, index) => (
                    <tr
                      key={cat.id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-4 py-3">{index + 1}</td>

                      <td className="px-4 py-3">
                        {editingCategoryId === cat.id ? (
                          <input
                            className=" px-2 py-1 rounded w-full"
                            value={categoryForm.name}
                            onChange={(e) =>
                              setCategoryForm({
                                ...categoryForm,
                                name: e.target.value,
                              })
                            }
                          />
                        ) : (
                          cat.name
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {editingCategoryId === cat.id ? (
                          <>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                setCategoryImageFile(e.target.files[0])
                              }
                            />
                            {(categoryImageFile || categoryForm.image_url) && (
                              <img
                                src={
                                  categoryImageFile
                                    ? URL.createObjectURL(categoryImageFile)
                                    : categoryForm.image_url
                                }
                                className="w-12 h-12 mx-auto mt-2 rounded object-cover"
                              />
                            )}
                          </>
                        ) : (
                          cat.image_url && (
                            <img
                              src={cat.image_url}
                              className="w-12 h-12 mx-auto rounded object-cover"
                            />
                          )
                        )}
                      </td>

                      <td className="px-4 py-3  text-center">
                        <div className="flex justify-center gap-2">
                          {editingCategoryId === cat.id ? (
                            <button
                              onClick={() => handleUpdateCategory(cat.id)}
                              className="bg-green-600 text-white px-3 py-1 rounded"
                            >
                              Save
                            </button>
                          ) : (
                            <button
                              onClick={() => startEditCategory(cat)}
                              className="bg-blue-600 text-white px-3 py-1 rounded"
                            >
                              Edit
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          </>
            )}
        </section>
    


    </div>
  );
}

export default CategoryList;
