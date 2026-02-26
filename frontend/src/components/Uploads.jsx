import React, { useEffect, useState } from "react";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function Uploads({ activeForm }) {

  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState(null);
  const [categoryPreview, setCategoryPreview] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);



  const [productName, setProductName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
   const [original_price, setOriginalPrice] = useState("");


  const [country, setCountry] = useState("");
  const [unit, setUnit] = useState("");
  const [description, setDescription] = useState("");
  const [productImage, setProductImage] = useState(null);
  const [productPreview, setProductPreview] = useState("");
  const [products, setProducts] = useState("");


  const [productLoading, setProductLoading] = useState(false);


  const [bannerName, setBannerName] = useState("");
  const [bannerImage, setBannerImage] = useState(null);
  const [bannerPreview, setBannerPreview] = useState("");
  const [bannerLoading, setBannerLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/get-categories`)
      .then((res) => res.json())
      .then(setCategories);
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/get-products`)
      .then((res) => res.json())
      .then(setProducts);
  }, []);

 
 const submitCategory = async () => {
  if (!categoryName.trim()) return alert("Enter category name");

  const exists = categories.some(
    (cat) =>
      cat.name.trim().toLowerCase() === categoryName.trim().toLowerCase()
  );
  if (exists) return alert("Category already exists");

  try {
    setCategoryLoading(true);

    let imageUrl = "";
    if (categoryImage) {
      imageUrl = await uploadToCloudinary(categoryImage, "categories");
      if (!imageUrl) return alert("Image upload failed");
    }

   await fetch(`${API_BASE_URL}/api/categories`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: categoryName.trim(),
    image_url: imageUrl,
  }),
});


    alert("Category added successfully");

    setCategoryName("");
    setCategoryImage(null);
    setCategoryPreview("");

    const res = await fetch(`${API_BASE_URL}/api/get-categories`);
    setCategories(await res.json());
  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  } finally {
    setCategoryLoading(false);
  }
};


const submitProduct = async () => {
  if (!productName || !categoryId)
    return alert("Fill required fields");

  try {
    setProductLoading(true);

    let imageUrl = "";
    if (productImage) {
      imageUrl = await uploadToCloudinary(productImage, "products");
      if (!imageUrl) return alert("Image upload failed");
    }

  
      await fetch(`${API_BASE_URL}/api/products`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: productName.trim(),
    category_id: Number(categoryId),
    original_price: Number(original_price),
    price: Number(price),
    country,
    unit,
    description,
    image_url: imageUrl,
  }),
});

    

    alert("Product added successfully");

    setProductName("");
    setCategoryId("");
      setOriginalPrice("");
    setPrice("");
    setCountry("");
    setUnit("");
    setDescription("");
    setProductImage(null);
    setProductPreview("");

    const res = await fetch(`${API_BASE_URL}/api/get-products`);
    setProducts(await res.json());
  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  } finally {
    setProductLoading(false);
  }
};


const submitBanner = async () => {
  if (!bannerName.trim()) return alert("Enter banner name");
  if (!bannerImage) return alert("Select banner image");

  try {
    setBannerLoading(true);

   
    const imageUrl = await uploadToCloudinary(bannerImage, "banners");
    if (!imageUrl) return alert("Image upload failed");

    
    const res = await fetch(`${API_BASE_URL}/api/banners`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: bannerName.trim(),
        image_url: imageUrl,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Server error:", errText);
      throw new Error("Failed to save banner");
    }

    alert("Banner uploaded successfully");

    setBannerName("");
    setBannerImage(null);
    setBannerPreview("");
  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  } finally {
    setBannerLoading(false);
  }
};


  const uniqueCategories = Object.values(
    categories.reduce((acc, cat) => {
      acc[cat.id] = cat;
      return acc;
    }, {})
  );

  return (
    <div className="flex-1 p-10 flex justify-center items-center">

{/* category form */}
      {activeForm === "category" && (
        <div className="w-md bg-white border-2 border-green-700 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-green-800 mb-6">
            Add Category
          </h2>

          <input
            type="text"
            placeholder="Category name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="w-full p-3 border rounded-lg mb-4"
          />

          <input

            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              setCategoryImage(file);
              setCategoryPreview(file ? URL.createObjectURL(file) : "");
            }}
              className="w-full border p-3 rounded-xl mb-4"
          />

          {categoryPreview && (
            <img src={categoryPreview} className="mt-4 h-32 rounded" />
          )}

         <button
  onClick={submitCategory}
  disabled={categoryLoading}
  className="w-full bg-green-700 text-white py-3 rounded-lg mt-4 disabled:opacity-50"
>
  {categoryLoading ? "Uploading..." : "Submit Category"}
</button>

        </div>
      )}

      {/* product form */}
      {activeForm === "product" && (
        <div className="w-150 bg-white border-2 border-green-700 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-green-800 mb-6">
            Add Product
          </h2>

          <input
            type="text"
            placeholder="Product Name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full border p-3 rounded-xl mb-4"
          />

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full border p-3 rounded-xl mb-4"
          >
            <option value="">Select Category</option>
            {uniqueCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Original Price"
            value={original_price}
            onChange={(e) => setOriginalPrice(e.target.value)}
            className="w-full border p-3 rounded-xl mb-4"
          />
 <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full border p-3 rounded-xl mb-4"
          />
          <input
            type="text"
            placeholder="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full border p-3 rounded-xl mb-4"
          />

          <input
            type="text"
            placeholder="Unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full border p-3 rounded-xl mb-4"
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border p-3 rounded-xl mb-4"
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              setProductImage(file);
              setProductPreview(file ? URL.createObjectURL(file) : "");
            }}
            className="w-full border p-3 rounded-xl mb-4"
          />

          {productPreview && (
            <img
              src={productPreview}
              className="w-full h-40 object-cover rounded-xl mb-4"
            />
          )}

         <button
  onClick={submitProduct}
  disabled={productLoading}
  className="w-full bg-green-700 text-white p-3 rounded-xl disabled:opacity-50"
>
  {productLoading ? "Uploading..." : "Upload Product"}
</button>

        </div>
      )}

      {/* banner image form*/}
      {activeForm === "bannerimages" && (
        <div className="w-md bg-white border-2 border-green-700 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-green-800 mb-6">
            Upload Banner Image
          </h2>

          <input
            type="text"
            placeholder="Banner Title"
            value={bannerName}
            onChange={(e) => setBannerName(e.target.value)}
            className="w-full p-3 border rounded-lg mb-4"
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              setBannerImage(file);
              setBannerPreview(file ? URL.createObjectURL(file) : "");
            }}
              className="w-full border p-3 rounded-xl mb-4"
          />

          {bannerPreview && (
            <img
              src={bannerPreview}
              className="mt-4 h-32 rounded object-cover"
            />
          )}
     


          <button
            onClick={submitBanner}
            disabled={bannerLoading}
            className="w-full bg-green-700 text-white py-3 rounded-lg mt-4 disabled:opacity-50"
          >
            {bannerLoading ? "Uploading..." : "Upload Banner"}
          </button>
        </div>
      )}
    </div>
  );
}

export default Uploads;
