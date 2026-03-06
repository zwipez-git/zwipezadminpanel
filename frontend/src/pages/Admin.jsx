import React, { useState } from "react";

import {
  FaTachometerAlt,
  FaBoxOpen,
  FaUsers,
  FaChartBar,
  FaSignOutAlt,
  FaCloudUploadAlt,
  FaBullhorn,
} from "react-icons/fa";
import { PiUserListFill } from "react-icons/pi";
import { RiArrowDropDownLine, RiArrowDropUpLine } from "react-icons/ri";
import { RxDashboard } from "react-icons/rx";
import OtpAuth from "../components/OtpAuth";
import Upload from "../components/Uploads";
import Catalog from "../components/Catalog/Catalogs";
import Signup from "./Signup";
import AdminsList from "../components/AdminsList";
import CustomerList from "../components/CustomerList";
import Offers from "../components/Megaoffers/Offers";
import Dashboard from "../components/Dashboard";
import Orders from '../components/Orders'

function SidebarItem({ icon: Icon, label, active, onClick }) {
  return (
    <li
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition
        ${
          active
            ? "bg-white text-green-700 font-semibold"
            : "text-white hover:bg-white hover:text-green-700"
        }`}
    >
      <Icon />
      <span>{label}</span>
    </li>
  );
}

export default function Admin() {
  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "Guest",
    role: "Admin",
  };

  const isSuperAdmin =
    typeof user.role === "string" &&
    ["superadmin", "super_admin"].includes(user.role.toLowerCase());

  const [activeView, setActiveView] = useState("dashboard");
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [megaOfferOpen, setMegaOfferOpen] = useState(false);
  const [activeForm, setActiveForm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNavigation = (view, form = "") => {
    setLoading(true);
    setTimeout(() => {
      setActiveView(view);
      setActiveForm(form);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="flex min-h-screen bg-[#F8FFFA] relative">
      {loading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-700 rounded-full animate-spin"></div>
        </div>
      )}

      <aside className="w-72 bg-green-700 text-white p-5 flex flex-col justify-between">
        <div>
          <h1 className="text-xl bg-white text-green-700 py-3 rounded-xl flex justify-center gap-2 mb-6">
            <FaTachometerAlt /> Admin Dashboard
          </h1>

          <ul className="space-y-2">
            <SidebarItem
              icon={FaTachometerAlt}
              label="Dashboard"
              active={activeView === "dashboard"}
              onClick={() => handleNavigation("dashboard")}
            />

            {isSuperAdmin && (
              <>
                <SidebarItem
                  icon={FaUsers}
                  label="Add User Admin"
                  active={activeView === "signup"}
                  onClick={() => handleNavigation("signup")}
                />
                <SidebarItem
                  icon={PiUserListFill}
                  label="List of Admins"
                  active={activeView === "users"}
                  onClick={() => handleNavigation("users")}
                />
              </>
            )}

            <SidebarItem
              icon={RxDashboard}
              label="Orders"
              active={activeView === "orders"}
              onClick={() => handleNavigation("orders")}
            />

            <li>
              <div
                onClick={() => setMegaOfferOpen(!megaOfferOpen)}
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white hover:text-green-700 rounded-lg"
              >
                <FaBullhorn /> Mega Offers
                <span className="ml-auto">
                  {megaOfferOpen ? <RiArrowDropUpLine /> : <RiArrowDropDownLine />}
                </span>
              </div>

              {megaOfferOpen && (
                <ul className="ml-8 mt-2 space-y-2 text-sm">
                  <li
                    onClick={() => handleNavigation("megaoffers", "megaoffer")}
                    className="cursor-pointer hover:text-green-300"
                  >
                    Upload Mega Offer
                  </li>
                  <li
                    onClick={() =>
                      handleNavigation("megaoffers", "megaoffer_list")
                    }
                    className="cursor-pointer hover:text-green-300"
                  >
                    Mega Offers List
                  </li>
                </ul>
              )}
            </li>

            <SidebarItem
              icon={FaUsers}
              label="List of Customers"
              active={activeView === "customers"}
              onClick={() => handleNavigation("customers")}
            />

            <SidebarItem
              icon={FaChartBar}
              label="OTP List"
              active={activeView === "otp"}
              onClick={() => handleNavigation("otp")}
            />

            <li>
              <div
                onClick={() => setCatalogOpen(!catalogOpen)}
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white hover:text-green-700 rounded-lg"
              >
                <FaBoxOpen /> Products
                <span className="ml-auto">
                  {catalogOpen ? <RiArrowDropUpLine /> : <RiArrowDropDownLine />}
                </span>
              </div>

              {catalogOpen && (
                <ul className="ml-8 mt-2 space-y-2 text-sm">
                  <li
                    onClick={() =>
                      handleNavigation("catalog", "category_list")
                    }
                    className="cursor-pointer hover:text-green-300"
                  >
                    Category List
                  </li>
                  <li
                    onClick={() =>
                      handleNavigation("catalog", "product_list")
                    }
                    className="cursor-pointer hover:text-green-300"
                  >
                    Product List
                  </li>
                  <li
                    onClick={() =>
                      handleNavigation("catalog", "banner_list")
                    }
                    className="cursor-pointer hover:text-green-300"
                  >
                    Banner List
                  </li>
                </ul>
              )}
            </li>

            <li>
              <div
                onClick={() => setUploadOpen(!uploadOpen)}
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white hover:text-green-700 rounded-lg"
              >
                <FaCloudUploadAlt /> Upload
                <span className="ml-auto">
                  {uploadOpen ? <RiArrowDropUpLine /> : <RiArrowDropDownLine />}
                </span>
              </div>

              {uploadOpen && (
                <ul className="ml-8 mt-2 space-y-2 text-sm">
                  <li
                    onClick={() => handleNavigation("upload", "category")}
                    className="cursor-pointer hover:text-green-300"
                  >
                    Upload Category
                  </li>
                  <li
                    onClick={() => handleNavigation("upload", "product")}
                    className="cursor-pointer hover:text-green-300"
                  >
                    Upload Product
                  </li>
                  <li
                    onClick={() =>
                      handleNavigation("upload", "bannerimages")
                    }
                    className="cursor-pointer hover:text-green-300"
                  >
                    Banner Images
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </div>

        <div>
          <div className="bg-white text-green-700 p-3 rounded-md">
            <div className="font-semibold">{user.name}</div>
            <div className="text-sm">{user.role}</div>
          </div>

          <button
            className="mt-4 w-full flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-white hover:bg-white hover:text-green-700"
            onClick={() => {
              localStorage.removeItem("user");
              window.location.reload();
            }}
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8">
        {activeView === "dashboard" && <Dashboard />}
        {activeView === "otp" && <OtpAuth />}
        {activeView === "upload" && <Upload activeForm={activeForm} />}
       {activeView === "catalog" && (
  <Catalog
    activeForm={activeForm}
    setActiveForm={setActiveForm} 
    setActiveView={setActiveView}
  />
  
)}
   {activeView === "megaoffers" && (
  <Offers
    activeForm={activeForm}
  
  />
  
)}

 


        {activeView === "orders" && <Orders />}
        {/* {activeView === "megaoffers" && <MegaOffers activeForm={activeForm} />} */}
        {activeView === "customers" && <CustomerList />}
        {activeView === "signup" && isSuperAdmin && <Signup />}
        {activeView === "users" && isSuperAdmin && <AdminsList />}
      </main>
    </div>
  );
}
