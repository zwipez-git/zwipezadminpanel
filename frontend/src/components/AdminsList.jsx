import React, { useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Search_bar from '../assets/Search_bar.png'

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function AdminsList() {
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const loggedRole = currentUser?.role?.toLowerCase();
  const isSuperAdmin = loggedRole === "superadmin";
  const isAdmin = loggedRole === "admin";

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    role: "",
    password: "",
  });

  useEffect(() => {
    fetch(`${API_BASE_URL}/signup/getAdminsList`)
      .then((res) => res.json())
      .then(setUsers)
      .catch(console.error);
  }, []);

  const startEdit = (user) => {
    setEditingUserId(user.id);
    setForm({
      name: user.name,
      role: user.role,
      password: "",
    });
  };

  const handleUpdate = async (id) => {
    const res = await fetch(`${API_BASE_URL}/signup/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setUsers((prev) => prev.map((u) => (u.id === id ? data.user : u)));
    setEditingUserId(null);
    setShowPassword(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    await fetch(`${API_BASE_URL}/signup/${id}`, { method: "DELETE" });
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <>
     {users.length === 0 && (
                        
                          <div className="mt-[5cm]">
                                                        <img src={Search_bar} alt="" className=" ml-[12cm]" />
                                                       <p className="text-center  text-gray-500 text-5xl -mt-30">
                                       
                                                    No admins yet — admins list will appear here
                                                       </p> 
                                                     </div>
                          
                      )}
                       {users.length > 0 && (

<>

<h2 className="text-2xl font-bold text-green-700 mb-4">Admins List</h2>

      

     
      <input
        type="text"
        placeholder="Search by Name or Email..."
        className="mb-4 px-4 py-2 border rounded-lg"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

    <div className="overflow-x-auto mt-8">
  <table className="min-w-full">
    <thead className="bg-gray-200">
            <tr>
              <th className="px-3 py-2">ID</th>
              <th className="r px-3 py-2">Name</th>
              <th className=" px-3 py-2">Email</th>
              <th className=" px-3 py-2">Role</th>
              <th className=" px-3 py-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users
           
              .filter((user) => {
                const userRole = user.role?.toLowerCase();

                if (isSuperAdmin) return true;
                if (isAdmin) return userRole === "admin";

                return false;
              })
             
              .filter((user) => {
                const searchText = search.toLowerCase();

                return (
                
                  user.name.toLowerCase().includes(searchText) ||
                  user.email.toLowerCase().includes(searchText)
                );
              })
              .map((user, index) => (
                <tr key={user.id}>
                  <td className=" px-3 py-2">{index + 1}</td>

                  <td className=" px-3 py-2">
                    {editingUserId === user.id ? (
                      <input
                        className=" px-2 py-1 rounded w-full"
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                      />
                    ) : (
                      user.name
                    )}
                  </td>

                  <td className=" px-3 py-2">{user.email}</td>

                  <td className=" px-3 py-2">
                    {editingUserId === user.id && isSuperAdmin ? (
                      <select
                        className=" px-2 py-1 rounded w-full"
                        value={form.role}
                        onChange={(e) =>
                          setForm({ ...form, role: e.target.value })
                        }
                      >
                        <option value="admin">Admin</option>
                        <option value="superadmin">SuperAdmin</option>
                      </select>
                    ) : (
                      user.role
                    )}
                  </td>

                  <td className=" px-3 py-2 text-center">
                    <div className="flex flex-col gap-2 items-center">
                      {/* Password for superadmin */}
                      {editingUserId === user.id && isSuperAdmin && (
                        <div className="relative w-full">
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="New Password"
                            className="border px-2 py-1 rounded w-full pr-8"
                            value={form.password}
                            onChange={(e) =>
                              setForm({ ...form, password: e.target.value })
                            }
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                          >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {editingUserId === user.id ? (
                          <button
                            onClick={() => handleUpdate(user.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded"
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            onClick={() => startEdit(user)}
                            className="bg-blue-600 text-white px-3 py-1 rounded"
                          >
                            Edit
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(user.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}

           
          </tbody>
        </table>
      </div>

</>


                       )}
    
    </>
  );
}
