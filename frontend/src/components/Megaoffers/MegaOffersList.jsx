import React, { useEffect, useState } from "react";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload";
import { RiDeleteBin6Line } from "react-icons/ri";
import Search_bar from "../../assets/Search_bar.png";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function MegaOfferList({ activeForm }) {

  const [megaOffers, setMegaOffers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editImageFile, setEditImageFile] = useState(null);
  const[updatingMegaOffers,setUpdatingMegaOffers]=useState(false)

  useEffect(() => {
    if (activeForm === "megaoffer_list") {
      fetch(`${API_BASE_URL}/api/megaoffers`)
        .then(res => res.json())
        .then(data => setMegaOffers(data))
        .catch(console.error);
    }
  }, [activeForm]);

  const startEditOffer = (offer) => {
    setEditingId(offer.id);
    setEditForm({ ...offer });
    setEditImageFile(null);
  };

  const handleUpdateOffer = async (id) => {
    setUpdatingMegaOffers(true);

    let imageUrl = editForm.image_url;

    try {

      if (editImageFile) {
        imageUrl = await uploadToCloudinary(editImageFile, "megaoffers");
      }

      const res = await fetch(`${API_BASE_URL}/api/megaoffers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          image_url: imageUrl,
        }),
      });

      if (!res.ok) throw new Error("Update failed");

      const updated = await res.json();

      setMegaOffers(prev =>
        prev.map(o =>
          o.id === id
            ? { ...o, ...editForm, image_url: imageUrl }
            : o
        )
      );

      setEditingId(null);

    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  const handleDeleteOffer = async (id) => {

    if (!window.confirm("Delete this offer?")) return;

    try {

      const res = await fetch(`${API_BASE_URL}/api/megaoffers/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      setMegaOffers(prev => prev.filter(o => o.id !== id));

    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  return (
    <section>

      {megaOffers.length === 0 && (

        <div className="mt-[5cm]">
          <img src={Search_bar} alt="" className="ml-[12cm]" />
          <p className="text-center text-gray-500 text-5xl -mt-30">
            No mega offers yet — create offers to boost sales
          </p>
        </div>

      )}

      {megaOffers.length > 0 && (

        <>
          <h2 className="text-2xl font-bold text-green-700 mb-6">
            Mega Offers List
          </h2>

          <div className="overflow-x-auto mt-8">

            <table className="min-w-full">

              <thead className="bg-gray-200">
                <tr>
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Image</th>
                  <th className="px-3 py-2 w-100">Name</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">Price</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>

              <tbody>

                {megaOffers.map((offer, index) => (

                  <tr key={offer.id}>

                    <td className="px-3 py-2">{index + 1}</td>

               
                    <td className="px-3 py-2 text-center">

                      {editingId === offer.id ? (

                        <div className="flex flex-col items-center gap-2">

                          <img
                            src={editForm.image_url}
                            className="w-12 h-12 rounded"
                          />

                          <input
                            type="file"
                            onChange={(e) =>
                              setEditImageFile(e.target.files[0])
                            }
                          />

                        </div>

                      ) : (

                        <img
                          src={offer.image_url}
                          className="w-12 h-12 mx-auto rounded"
                        />

                      )}

                    </td>

                  
                    <td className="px-3 py-2">

                      {editingId === offer.id ? (

                        <input
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              name: e.target.value,
                            })
                          }
                          className="border px-2 py-1 rounded w-auto"
                        />

                      ) : (
                        offer.name
                      )}

                    </td>

                  
                    <td className="px-3 py-2">
                      {offer.category_name}
                    </td>

                  
                    <td className="px-3 py-2">

                      {editingId === offer.id ? (

                        <input
                          type="number"
                          value={editForm.offer_price}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              offer_price: e.target.value,
                            })
                          }
                          className="border px-2 py-1 rounded w-auto"
                        />

                      ) : (

                        <>
                          ₹{offer.offer_price}
                          <br />

                          <span className="line-through text-gray-400">
                            ₹{offer.price}
                          </span>
                        </>

                      )}

                    </td>

                 
                    <td className="px-3 py-2 text-center">

                      <div className="flex gap-4 justify-center">

                        {editingId === offer.id ? (

                          <button
                            onClick={() => handleUpdateOffer(offer.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded"
                          >
                            {updatingMegaOffers ?"Saving...":"Save"}
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
                          className="text-black text-2xl"
                        >
                          <RiDeleteBin6Line />
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
  );
}

export default MegaOfferList;