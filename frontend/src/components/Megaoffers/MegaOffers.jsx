import React, { useEffect, useState } from "react";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload";


const API_BASE_URL = import.meta.env.VITE_API_URL;

function MegaOffers({ activeForm }) {

const [categories, setCategories] = useState([]);
const [products, setProducts] = useState([]);

const [productName, setProductName] = useState("");
const [categoryId, setCategoryId] = useState("");
const [price, setPrice] = useState("");
const [offerPrice, setOfferPrice] = useState("");
// const [country, setCountry] = useState("");
const [unit, setUnit] = useState("");
const [description, setDescription] = useState("");
const [productImage, setProductImage] = useState(null);
const [productPreview, setProductPreview] = useState("");

const [megaOfferLoading, setMegaOfferLoading] = useState(false);

useEffect(() => {

fetch(`${API_BASE_URL}/api/get-categories`)
.then((res) => res.json())
.then(setCategories);

}, []);

const handleCategoryChange = async (e) => {

const selectedId = e.target.value;

setCategoryId(selectedId);

if (!selectedId) return;

try {

const res = await fetch(`${API_BASE_URL}/api/products/category/${selectedId}`);
const data = await res.json();
setProducts(data);

} catch (err) {

console.error(err);

}

};

const handleProductSelect = (product) => {

setProductName(product.name);
setPrice(product.price);
// setCountry(product.country);
setUnit(product.unit);
setDescription(product.description);
setProductPreview(product.image_url);

};

const submitMegaOffer = async () => {

if (!productName || !categoryId || !price || !offerPrice) {
return alert("Please fill all required fields");
}

if (Number(offerPrice) >= Number(price)) {
return alert("Offer price must be less than original price");
}

try {

setMegaOfferLoading(true);

let imageUrl = productPreview;

if (productImage) {
imageUrl = await uploadToCloudinary(productImage, "megaoffers");
}

const res = await fetch(`${API_BASE_URL}/api/megaoffers`, {

method: "POST",

headers: { "Content-Type": "application/json" },

body: JSON.stringify({
name: productName.trim(),
category_id: categoryId,
price,
offer_price: offerPrice,
// country,
unit,
description,
image_url: imageUrl,
}),

});

if (!res.ok) throw new Error("Failed");

alert("Mega Offer Product Added Successfully");

setProductName("");
setCategoryId("");
setPrice("");
setOfferPrice("");
// setCountry("");
setUnit("");
setDescription("");
setProductImage(null);
setProductPreview("");
setProducts([]);

} catch (err) {

console.error(err);
alert("Something went wrong");

} finally {

setMegaOfferLoading(false);

}

};

const uniqueCategories = Object.values(
categories.reduce((acc, cat) => {
acc[cat.id] = cat;
return acc;
}, {})
);

return (

<>

<div className="flex-1 p-10 flex justify-center items-center">

{activeForm === "uploadmegaoffer" && (

<div className="w-150 bg-white border-2 border-green-700 rounded-xl p-8">

<h2 className="text-2xl font-bold text-green-800 mb-6">
Add Mega Offer Product
</h2>

<select
value={categoryId}
onChange={handleCategoryChange}
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
type="text"
placeholder="Product Name"
value={productName}
disabled
className="w-full border p-3 rounded-xl mb-4 bg-gray-100"
/>

<input
type="number"
placeholder="Original Price"
value={price}
disabled
className="w-full border p-3 rounded-xl mb-4 bg-gray-100"
/>

<input
type="number"
placeholder="Offer Price"
value={offerPrice}
onChange={(e) => setOfferPrice(e.target.value)}
className="w-full border p-3 rounded-xl mb-4"
/>

<input
type="text"
placeholder="unit"
value={unit}
disabled
className="w-full border p-3 rounded-xl mb-4 bg-gray-100"
/>

{/* <input
type="text"
placeholder="country"
value={country}
disabled
className="w-full border p-3 rounded-xl mb-4 bg-gray-100"
/> */}

<textarea
placeholder="Description"
value={description}
disabled
className="w-full border p-3 rounded-xl mb-4 bg-gray-100"
/>

{productPreview && (

<img
src={productPreview}
className="w-full h-40 object-cover rounded-xl mb-4"
/>

)}

<button
onClick={submitMegaOffer}
disabled={megaOfferLoading}
className="w-full bg-green-700 text-white p-3 rounded-xl disabled:opacity-50"
>

{megaOfferLoading ? "Uploading..." : "Upload Mega Offer"}

</button>

</div>

)}

</div>

<div className="fixed top-0 right-0 h-screen w-90 shadow-3xl z-50 m-4 rounded-[5px] overflow-y-auto custom-scroll">

{activeForm === "megaoffer" && products.length > 0 && (

<div className="p-6 space-y-4">

{products.map((prod) => (

<div
key={prod.id}
onClick={() => handleProductSelect(prod)}
className="border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-lg transition"
>

<img
src={prod.image_url}
className="w-full h-full object-cover rounded mb-2"
/>

<h3 className="font-semibold text-[20px]">
Product Name:{prod.name}
</h3>
{/* 
<p className="text-md text-gray-600">
Country:{prod.country}
</p> */}

<p className="text-md text-gray-600">
Unit:{prod.unit}
</p>

<p className="text-md text-gray-600">
Description:{prod.description}
</p>

<p className="text-green-600 font-bold">
Price:₹{prod.price}
</p>

</div>

))}

</div>

)}

</div>



</>

);

}

export default MegaOffers;

