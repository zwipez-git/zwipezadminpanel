import React, { useEffect, useState } from "react";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";
import Search_bar from '../assets/Search_bar.png'

const API_BASE_URL = import.meta.env.VITE_API_URL;

function MegaOffers({ activeForm }) {
  const [categories, setCategories] = useState([]);

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


  const submitMegaOffer = async () => {
  if (!productName || !categoryId || !price || !offerPrice) {
    return alert("Please fill all required fields");
  }

  try {
    setMegaOfferLoading(true);

    let imageUrl = "";
    if (productImage) {
      imageUrl = await uploadToCloudinary(productImage, "megaoffers");
      if (!imageUrl) return alert("Image upload failed");
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

    if (!res.ok) {
      const errText = await res.text();
      console.error("Server error:", errText);
      throw new Error("Failed to add mega offer");
    }

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
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full border p-3 rounded-xl mb-4"
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
              setProductImage(e.target.files[0]);
              setProductPreview(
                e.target.files[0]
                  ? URL.createObjectURL(e.target.files[0])
                  : ""
              );
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
  onClick={submitMegaOffer}
  disabled={megaOfferLoading}
  className="w-full bg-green-700 text-white p-3 rounded-xl disabled:opacity-50"
>
  {megaOfferLoading ? "Uploading..." : "Upload Mega Offer"}
</button>

        </div>
      )}


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
