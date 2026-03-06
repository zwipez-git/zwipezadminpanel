
import React, { useState, useEffect } from "react";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload";

import { RiDeleteBin6Line, RiArrowDropDownLine } from "react-icons/ri";
import { FiPlus } from "react-icons/fi";
import ReactCountryFlag from "react-country-flag";
import Search_bar from "../../assets/Search_bar.png";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const countryMap = {
  india: { code: "IN", name: "India" },
  in: { code: "IN", name: "India" },

  usa: { code: "US", name: "United States" },
  us: { code: "US", name: "United States" },
  america: { code: "US", name: "United States" },

  uk: { code: "GB", name: "United Kingdom" },
  england: { code: "GB", name: "United Kingdom" },

  canada: { code: "CA", name: "Canada" },
  ca: { code: "CA", name: "Canada" },

  dubai: { code: "AE", name: "United Arab Emirates" },
  dxb: { code: "AE", name: "United Arab Emirates" },
  uae: { code: "AE", name: "United Arab Emirates" },
  "united arab emirates": { code: "AE", name: "United Arab Emirates" },
};

const normalizeCountry = (value) => {
  if (!value) return null;
  return countryMap[value.trim().toLowerCase()] || null;
};

function ProductList({ setActiveForm, setActiveView }) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [productSearch, setProductSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");

  const [editingProductId, setEditingProductId] = useState(null);
  const [updatingProduct, setUpdatingProduct] = useState(false);

  const [productForm, setProductForm] = useState({
    name: "",
    category_id: "",
    original_price: "",
    price: "",
    country: "",
    unit: "",
    description: "",
    image_url: "",
    is_active: true,
  });

  const [productImageFile, setProductImageFile] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/get-categories`)
      .then((res) => res.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/get-products`)
      .then((res) => res.json())
      .then(setProducts)
      .catch(console.error);
  }, []);

  const filterByPrice = (product) => {
    if (priceFilter === "all") return true;
    if (priceFilter === "100-1500") {
      return product.price >= 100 && product.price <= 1500;
    }
    if (priceFilter === "1500+") {
      return product.price > 1500;
    }
    return true;
  };

  const filteredProducts = products.filter((prod) => {
    const searchMatch =
      prod.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      prod.category_name.toLowerCase().includes(productSearch.toLowerCase());

    const categoryMatch =
      selectedCategory === "all" || prod.category_id === selectedCategory;

    const priceMatch = filterByPrice(prod);

    return searchMatch && categoryMatch && priceMatch;
  });

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: "DELETE",
    });

    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const startEditProduct = (prod) => {
    setEditingProductId(prod.id);
    setProductForm({ ...prod });
    setProductImageFile(null);
  };

  const handleUpdateProduct = async (id) => {
    setUpdatingProduct(true);

    let imageUrl = productForm.image_url;

    try {
      if (productImageFile) {
        imageUrl = await uploadToCloudinary(productImageFile, "products");
        if (!imageUrl) return alert("Image upload failed");
      }

      const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...productForm,
          original_price: Number(productForm.original_price),
          price: Number(productForm.price),
          image_url: imageUrl,
        }),
      });

      await res.json();

      const categoryName =
        categories.find((c) => c.id === productForm.category_id)?.name || "";

      setProducts((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                ...productForm,
                image_url: imageUrl,
                category_name: categoryName,
              }
            : p
        )
      );

      setEditingProductId(null);
      setProductImageFile(null);
    } catch (err) {
      console.error(err);
      alert("Update failed");
    } finally {
      setUpdatingProduct(false);
    }
  };

  const toggleProductActive = async (prod) => {
    const res = await fetch(`${API_BASE_URL}/api/products/${prod.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...prod,
        is_active: !prod.is_active,
      }),
    });

    const updated = await res.json();

    setProducts((prev) =>
      prev.map((p) => (p.id === prod.id ? updated.product : p))
    );
  };

  return (
    <section>
      {filteredProducts.length === 0 && (
        <div className="mt-[5cm]">
          <img src={Search_bar} alt="" className="ml-[12cm]" />
          <p className="text-center text-gray-500 text-5xl -mt-30">
            No products yet — add products to your store
          </p>
        </div>
      )}

      {filteredProducts.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-green-700">Product List</h2>

            <button
              onClick={() => {
                setActiveView("upload");
                setActiveForm("product");
              }}
              className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-2xl"
            >
              <FiPlus /> Add Product
            </button>
          </div>

          <div className="flex gap-4 mb-8">
            <input
              type="text"
              placeholder="Search product or category"
              className="border px-4 py-2 rounded-lg w-1/3"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
            />

            <select
              className="border px-4 py-2 rounded-lg"
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(
                  e.target.value === "all" ? "all" : Number(e.target.value)
                )
              }
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <select
              className="border px-4 py-2 rounded-lg"
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
            >
              <option value="all">Any Amount</option>
              <option value="100-1500">100 - 1500</option>
              <option value="1500+">1500+</option>
            </select>
          </div>

          <div className="overflow-x-auto mt-8">
            <table className="min-w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-3 py-2">Image</th>
                  <th className="px-3 py-2 w-150">Name</th>
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">Original Price</th>
                  <th className="px-3 py-2">Price</th>
                  <th className="px-3 py-2">Unit</th>
                  <th className="px-3 py-2">Country</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((prod, index) => {
                  const country = normalizeCountry(prod.country);

                  return (
                    <tr key={prod.id}>
                      <td className="px-3 py-2 text-center">
                        {editingProductId === prod.id ? (
                          <div className="flex flex-col items-center gap-2">
                            <img
                              src={productForm.image_url}
                              className="w-12 h-12 rounded"
                            />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                setProductImageFile(e.target.files[0])
                              }
                            />
                          </div>
                        ) : (
                          <img
                            src={prod.image_url}
                            className="w-12 h-12 mx-auto rounded"
                          />
                        )}
                      </td>

                      <td className="px-3 py-2">
                        {editingProductId === prod.id ? (
                          <input
                            value={productForm.name}
                            onChange={(e) =>
                              setProductForm({
                                ...productForm,
                                name: e.target.value,
                              })
                            }
                            className="px-2 py-1 rounded w-full"
                          />
                        ) : (
                          prod.name
                        )}
                      </td>

                      <td className="px-3 py-2">{index + 1}</td>

                      <td className="px-3 py-2">{prod.category_name}</td>

                      <td className="px-3 py-2">
                        {editingProductId === prod.id ? (
                          <input
                            type="number"
                            value={productForm.original_price}
                            onChange={(e) =>
                              setProductForm({
                                ...productForm,
                                original_price: e.target.value,
                              })
                            }
                            className="px-2 py-1 rounded w-full"
                          />
                        ) : (
                          prod.original_price
                        )}
                      </td>

                      <td className="px-3 py-2">
                        {editingProductId === prod.id ? (
                          <input
                            type="number"
                            value={productForm.price}
                            onChange={(e) =>
                              setProductForm({
                                ...productForm,
                                price: e.target.value,
                              })
                            }
                            className="px-2 py-1 rounded w-full"
                          />
                        ) : (
                          prod.price
                        )}
                      </td>

                      <td className="px-3 py-2">
                        {editingProductId === prod.id ? (
                          <input
                            value={productForm.unit}
                            onChange={(e) =>
                              setProductForm({
                                ...productForm,
                                unit: e.target.value,
                              })
                            }
                            className="px-2 py-1 rounded w-full"
                          />
                        ) : (
                          prod.unit
                        )}
                      </td>

                      <td className="px-3 py-2">
                        {country ? (
                          <div className="flex items-center gap-2">
                            <ReactCountryFlag
                              svg
                              countryCode={country.code}
                              style={{ width: "1.5em", height: "1.5em" }}
                            />
                            <span>{country.name}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">{prod.country}</span>
                        )}
                      </td>

                      <td className="px-3 py-2 text-center">
                        <div className="relative inline-block">
                          <select
                            value={prod.is_active ? "active" : "inactive"}
                            onChange={() => toggleProductActive(prod)}
                            className="appearance-none cursor-pointer pl-6 pr-6 py-1 border rounded-full text-sm bg-white"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>

                          <span
                            className={`absolute left-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full ${
                              prod.is_active
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          ></span>

                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-lg">
                            <RiArrowDropDownLine />
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-2 text-center">
                        <div className="flex gap-4 justify-center">
                          {editingProductId === prod.id ? (
                            <button
                              onClick={() => handleUpdateProduct(prod.id)}
                              disabled={updatingProduct}
                              className="bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50"
                            >
                              {updatingProduct ? "Saving..." : "Save"}
                            </button>
                          ) : (
                            <button
                              onClick={() => startEditProduct(prod)}
                              className="bg-blue-600 text-white px-3 py-1 rounded"
                            >
                              Edit
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="text-black text-2xl"
                          >
                            <RiDeleteBin6Line />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

export default ProductList;
