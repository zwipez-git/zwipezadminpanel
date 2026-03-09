import React, { useEffect, useState } from "react";
import Search_bar from '../assets/Search_bar.png'

const API_BASE_URL = import.meta.env.VITE_API_URL;

function CustomerList() {
  const [customerList, setCustomerList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPhone, setEditingPhone] = useState(null);
  const[updatingCustomer,setUpdatingCustomer]=useState(false)

  const [form, setForm] = useState({
    name: "",
    email: "",
    gender: "",
    dob: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
  });

  const accessToken = localStorage.getItem("accessToken");
  const id = localStorage.getItem("id");

useEffect(() => {
  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/user/profile`);
      const result = await res.json();

      setCustomerList(result.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  fetchCustomers();
}, []);


  const filteredCustomers = Array.isArray(customerList)
    ? customerList.filter((c) =>
        c.phone?.includes(searchTerm)
      )
    : [];

  const startEdit = (customer) => {
    setEditingPhone(customer.phone);
    setForm({
      name: customer.name || "",
      email: customer.email || "",
      gender: customer.gender || "",
      dob: customer.dob || "",
      city: customer.address?.city || "",
      state: customer.address?.state || "",
      country: customer.address?.country || "",
      pincode: customer.address?.pincode || "",
    });
  };
//update


  const handleUpdate = async (phone) => {
    setUpdatingCustomer(true)
    try {
      const res = await fetch(`${API_BASE_URL}/user/profile/${phone}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          accesstoken: accessToken,
          id: id,
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          gender: form.gender,
          dob: form.dob,
          address: {
            city: form.city,
            state: form.state,
            country: form.country,
            pincode: form.pincode,
          },
        }),
      });

      const updated = await res.json();

      if (!res.ok) {
        alert(updated.message || "Update failed");
        return;
      }

      setCustomerList((prev) =>
        prev.map((c) => (c.phone === phone ? updated : c))
      );

      setEditingPhone(null);
    } catch (err) {
      console.error("Update error:", err);
    }
  };

//delete
  const handleDelete = async (phone) => {
    if (!window.confirm("Delete this customer?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/user/profile/${phone}`, {
        method: "DELETE",
        headers: {
          accesstoken: accessToken,
          id: id,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.message || "Delete failed");
        return;
      }

      setCustomerList((prev) =>
        prev.filter((c) => c.phone !== phone)
      );
    } catch (err) {
      console.error("Delete error:", err);
    }
  };


  return (
    <section>
        {filteredCustomers.length === 0 && (
                    
                      <div className="mt-[5cm]">
                                                    <img src={Search_bar} alt="" className=" ml-[12cm]" />
                                                   <p className="text-center  text-gray-500 text-5xl -mt-30">
                                   
                                                No customers yet — customer list will appear here
                                                   </p> 
                                                 </div>
                      
                  )}
           {filteredCustomers.length > 0 && (
<>
<h2 className="text-2xl font-bold mb-4 text-green-700">
        Customers List
      </h2>
        <input
        type="text"
        placeholder="Search by phone number..."
        className="mb-4 px-4 py-2 border-2 rounded-lg outline-none w-full max-w-sm"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}


      />

  <div className="overflow-x-auto mt-8">
  <table className="min-w-full">
    <thead className="bg-gray-200">
            <tr>
              <th className=" px-3 py-2">ID</th>
              <th className=" px-3 py-2">Name</th>
              <th className=" px-3 py-2">Email</th>
              <th className=" px-3 py-2">Phone</th>
              <th className=" px-3 py-2">Gender</th>
              <th className=" px-3 py-2">DOB</th>
              <th className=" px-3 py-2">City</th>
              <th className=" px-3 py-2">State</th>
              <th className=" px-3 py-2">Country</th>
              <th className=" px-3 py-2">Pincode</th>
              <th className=" px-3 py-2">Created At</th>
              <th className=" px-3 py-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredCustomers.map((customer, index) => (
              <tr key={customer.phone}>
                <td className=" px-3 py-2">{index + 1}</td>

                {["name", "email"].map((field) => (
                  <td key={field} className=" px-3 py-2">
                    {editingPhone === customer.phone ? (
                      <input
                        className="px-2 py-1 border rounded w-full"
                        value={form[field]}
                        onChange={(e) =>
                          setForm({ ...form, [field]: e.target.value })
                        }
                      />
                    ) : (
                      customer[field]
                    )}
                  </td>
                ))}

                <td className=" px-3 py-2">{customer.phone}</td>

                <td className=" px-3 w-28 py-2">
                  {editingPhone === customer.phone ? (
                    <select
                      className=" px-2 py-1 border rounded w-full"
                      value={form.gender}
                      onChange={(e) =>
                        setForm({ ...form, gender: e.target.value })
                      }
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  ) : (
                    customer.gender
                  )}
                </td>

                <td className="px-3 py-2">
                  {editingPhone === customer.phone ? (
                    <input
                      type="date"
                      className=" px-2 py-1  border rounded w-full"
                      value={form.dob}
                      onChange={(e) =>
                        setForm({ ...form, dob: e.target.value })
                      }
                    />
                  ) : (
                    customer.dob
                  )}
                </td>

                {["city", "state", "country", "pincode"].map((f) => (
                  <td key={f} className=" px-3 py-2">
                    {editingPhone === customer.phone ? (
                      <input
                        className=" px-2 py-1 border rounded w-full"
                        value={form[f]}
                        onChange={(e) =>
                          setForm({ ...form, [f]: e.target.value })
                        }
                      />
                    ) : (
                      customer.address?.[f]
                    )}
                  </td>
                ))}

                <td className=" px-3 py-2">
                  {new Date(customer.created_at).toLocaleString()}
                </td>

                <td className=" px-3 py-2 text-center">
                  <div className="flex gap-2 justify-center">
                    {editingPhone === customer.phone ? (
                      <button
                        onClick={() => handleUpdate(customer.phone)}
                        className="bg-green-600 text-white px-3 py-1 rounded"
                      >
                     {updatingCustomer ? "Saving..." : "Save"}
                      </button>
                    ) : (
                      <button
                        onClick={() => startEdit(customer)}
                        className="bg-blue-600 text-white px-3 py-1 rounded"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(customer.phone)}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredCustomers.length === 0 && (
              <tr>
                <td colSpan="12" className="text-center py-4">
                  No customers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>


</>
           )}
      

    

      
    </section>
  );
}

export default CustomerList;
