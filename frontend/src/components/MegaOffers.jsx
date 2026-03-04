import React, { useEffect, useState } from "react";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";
import Search_bar from '../assets/Search_bar.png'

const API_BASE_URL = import.meta.env.VITE_API_URL;

function MegaOffers({ activeForm }) {

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [productName, setProductName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [country, setCountry] = useState("");
  const [unit, setUnit] = useState("");
  const [description, setDescription] = useState("");
  const [productImage, setProductImage] = useState(null);
  const [productPreview, setProductPreview] = useState("");

  const [megaOfferLoading, setMegaOfferLoading] = useState(false);
  const [megaOffers, setMegaOffers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editImageFile, setEditImageFile] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/get-categories`)
      .then((res) => res.json())
      .then(setCategories);
  }, []);

  useEffect(() => {
    if (activeForm === "megaoffer_list") {
      fetch(`${API_BASE_URL}/api/megaoffers`)
        .then(res => res.json())
        .then(setMegaOffers);
    }
  }, [activeForm]);

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
    setCountry(product.country);
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
          country,
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
      setCountry("");
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

  const startEditOffer = (offer) => {
    setEditingId(offer.id);
    setEditForm(offer);
    setEditImageFile(null);
  };

  const handleUpdateOffer = async (id) => {

    let imageUrl = editForm.image_url;

    if (editImageFile) {
      imageUrl = await uploadToCloudinary(editImageFile, "megaoffers");
    }

    const res = await fetch(`${API_BASE_URL}/api/megaoffers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editForm, image_url: imageUrl }),
    });

    const data = await res.json();

    setMegaOffers(prev =>
      prev.map(o => (o.id === id ? data.product : o))
    );

    setEditingId(null);
  };

  const handleDeleteOffer = async (id) => {
    if (!window.confirm("Delete this offer?")) return;

    await fetch(`${API_BASE_URL}/api/megaoffers/${id}`, {
      method: "DELETE",
    });

    setMegaOffers(prev => prev.filter(o => o.id !== id));
  };
  return (
<>



            
       <div className="flex-1 p-10 flex justify-center items-center">
      {activeForm === "megaoffer" && (
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
  <input
              type="text"
              placeholder="country"
              value={country}
              disabled
              className="w-full border p-3 rounded-xl mb-4 bg-gray-100"
            />

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

 <div
  className="
    fixed top-0 right-0 
    h-screen w-90 
     shadow-3xl z-50
   m-4 rounded-[5px]
   overflow-y-auto  custom-scroll  
  "
>
  {products.length > 0 && (
    <div className="p-6 space-y-4">
      {products.map((prod) => (
        <div
          key={prod.id}
          onClick={() => handleProductSelect(prod)}
          className="border  border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-lg transition"
        >
          <img
            src={prod.image_url}
            alt={prod.name}
            className="w-full h-full object-cover rounded mb-2"
          />

          <h3 className="font-semibold text-[20px]">Product Name:{prod.name}</h3>

          <p className="text-md text-gray-600">
            Country:
            {prod.country}
          </p>
          <p className="text-md text-gray-600">
            Unit:
           {prod.unit} 
          </p>
<p className="text-md  text-gray-600">
  Description:
  
           {prod.description}
          </p>
          <p className="text-green-600 font-bold">
            Price:
            ₹{prod.price}
          </p>
        </div>
      ))}
    </div>
  )}
</div>
</div>

    <div className="flex-1  flex justify-center items-center">
      {activeForm === "megaoffer_list" && (
  <section>
     {megaOffers.length === 0 && (
              
                <div className="mt-[5cm]">
                                              <img src={Search_bar} alt="" className=" ml-[7cm]" />
                                             <p className="text-center  text-gray-500 text-5xl -mt-30">
                             
                                            No mega offers yet — create offers to boost sales
                                             </p> 
                                           </div>
                
            )}
     {megaOffers.length > 0 && (
<>
                    
     <h2 className="text-2xl font-bold mb-4 text-green-700">
      Mega Offers List
    </h2>

     <div className="overflow-x-auto mt-8">
  <table className="min-w-full">
    <thead className="bg-gray-200">
          <tr>
            <th className=" px-10 py-4">ID</th>
            <th className=" px-10  py-2">Name</th>
            <th className=" px-10 py-2">Category</th>
            <th className=" px-10  py-2">Prices</th>
            <th className=" px-10  py-2">Image</th>
            <th className="px-10 py-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          
          {megaOffers.map((offer, index) => (
            <tr key={offer.id}>
              <td className=" px-4 py-2">{index + 1}</td>

              <td className=" px-4 py-2">
                {editingId === offer.id ? (
                  <input
                    value={editForm.name}
                    onChange={e =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className=" p-1 w-full"
                  />
                ) : (
                  offer.name
                )}
              </td>

              <td className=" px-4 py-2">{offer.category_name}</td>

              <td className=" px-4 py-2">
                ₹{offer.offer_price} <br />
                <span className="line-through text-gray-400">
                  ₹{offer.price}
                </span>
              </td>

              <td className="px-4 py-2 text-center">
                {editingId === offer.id ? (
                  <>
                    <input
                      type="file"
                      onChange={e => setEditImageFile(e.target.files[0])}
                    />
                    {(editImageFile || editForm.image_url) && (
                      <img
                        src={
                          editImageFile
                            ? URL.createObjectURL(editImageFile)
                            : editForm.image_url
                        }
                        className="w-20 h-12 mx-auto mt-2"
                      />
                    )}
                  </>
                ) : (
                  <img
                    src={offer.image_url}
                    className="w-20 h-12 mx-auto"
                  />
                )}
              </td>

              <td className=" px-4 py-2 text-center">
                {editingId === offer.id ? (
                  <button
                    onClick={() => handleUpdateOffer(offer.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => startEditOffer(offer)}
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                )}

                <button
                  onClick={() => handleDeleteOffer(offer.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded ml-2"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
      </>)}

       
  </section>
)}

    </div>
                           
                           
                          
    

 </> ); 
}

export default MegaOffers;
