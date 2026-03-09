import React, { useEffect, useState } from "react";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload";
import Search_bar from '../../assets/Search_bar.png'

const API_BASE_URL = import.meta.env.VITE_API_URL;

function BannerList() {
   const [banners, setBanners] = useState([]);
  const [editingBannerId, setEditingBannerId] = useState(null);
  const [bannerForm, setBannerForm] = useState({ title: "", image_url: "" });
   const [bannerImageFile, setBannerImageFile] = useState(null);
   const [updatingBanner,setUpdatingBanner]=useState(false)

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/get-banners`)
      .then(res => res.json())
      .then(setBanners);
  }, []);

  
  
    const startEditBanner = (banner) => {
    setEditingBannerId(banner.id);
    setBannerForm({ title: banner.title, image_url: banner.image_url });
    setBannerImageFile(null);
  };
  
  const handleUpdateBanner = async (id) => {
    setUpdatingBanner(true);
    let imageUrl = bannerForm.image_url;
  
    if (bannerImageFile) {
      imageUrl = await uploadToCloudinary(bannerImageFile, "banners");
      if (!imageUrl) return alert("Image upload failed");
    }
  
    const res = await fetch(`${API_BASE_URL}/api/banners/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: bannerForm.title,
        image_url: imageUrl,
      }),
    });
  
    const updated = await res.json();
  
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? updated.banner : b))
    );
  
    setEditingBannerId(null);
  };
  
  const handleDeleteBanner = async (id) => {
    if (!window.confirm("Delete this banner?")) return;
  
    await fetch(`${API_BASE_URL}/api/banners/${id}`, {
      method: "DELETE",
    });
  
    setBanners((prev) => prev.filter((b) => b.id !== id));
  };
  return (
   <>
   
  <section>
    
     {banners.length === 0 && (
              <div className="mt-[5cm]">
                 <img src={Search_bar} alt="" className=" ml-[12cm]" />
                <p className="text-center  text-gray-500 text-5xl -mt-30">

                   No Banners Found
                </p> 
              </div>
               
                 
                
            
            )}
{banners.length > 0 && (
 
      <div className="overflow-x-auto mt-8">
       <h2 className="text-2xl font-bold mb-4 text-green-700">
      Banner List
    </h2>
      
  <table className="min-w-full">
    <thead className="bg-gray-200">
<tr>            <th className=" px-4 py-2">ID</th>
            <th className="px-4 py-2">Title</th>
            <th className="px-4 py-2">Image</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>

        <tbody>
         
          {banners.map((banner, index) => (
            <tr key={banner.id}>
              <td className=" px-4 py-2">{index + 1}</td>

              <td className="px-4 py-2">
                {editingBannerId === banner.id ? (
                  <input
                    className=" px-2 py-1 border rounded w-auto"
                    value={bannerForm.title}
                    onChange={(e) =>
                      setBannerForm({ ...bannerForm, title: e.target.value })
                    }
                  />
                ) : (
                  banner.title
                )}
              </td>

              <td className=" px-4 py-2 text-center">
                {editingBannerId === banner.id ? (
                  <>
                    <input
                      type="file"
                      onChange={(e) =>
                        setBannerImageFile(e.target.files[0])
                      }
                    />
                    {(bannerImageFile || bannerForm.image_url) && (
                      <img
                        src={
                          bannerImageFile
                            ? URL.createObjectURL(bannerImageFile)
                            : bannerForm.image_url
                        }
                        className="w-20 h-12 mx-auto mt-2 rounded object-cover"
                      />
                    )}
                  </>
                ) : (
                  <img
                    src={banner.image_url}
                    className="w-20 h-12 mx-auto rounded object-cover"
                  />
                )}
              </td>

              <td className=" px-4 py-2 text-center">
                <div className="flex justify-center gap-2">
                  {editingBannerId === banner.id ? (
                    <button
                      onClick={() => handleUpdateBanner(banner.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      {updatingBanner ? "Saving..." : "Save"}
                    </button>
                  ) : (
                    <button
                      onClick={() => startEditBanner(banner)}
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteBanner(banner.id)}
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
)}
  </section>


   </>
  )
}

export default BannerList

