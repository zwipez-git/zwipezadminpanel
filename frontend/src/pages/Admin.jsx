
import React, { useState } from "react";

import {
  FaTachometerAlt,
  FaBoxOpen,
  FaUsers,
  FaChartBar,
  FaSignOutAlt,
  FaCloudUploadAlt,
  FaBullhorn,
  FaBars,
  FaTimes
} from "react-icons/fa";

import { PiUserListFill } from "react-icons/pi";
import { RiArrowDropDownLine, RiArrowDropUpLine } from "react-icons/ri";

import {BiSolidDashboard, BiSolidCoupon } from "react-icons/bi";

import OtpAuth from "../components/OtpAuth";
import Upload from "../components/Uploads";
import Catalog from "../components/Catalog/Catalogs";
import Signup from "./Signup";
import AdminsList from "../components/AdminsList";
import CustomerList from "../components/CustomerList";
import Offers from "../components/Megaoffers/Offers";
import Dashboard from "../components/Dashboard";
import Orders from "../components/Orders";
import Coupons from '../components/Coupons/Coupons';

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

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [couponsOpen, setCouponsOpen] = useState(false);


  const handleNavigation = (view, form = null) => {
    setLoading(true);
    setTimeout(() => {
      setActiveView(view);
      setActiveForm(form);
      setSidebarOpen(false);
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

     {/* mobile view */}
      <div className="lg:hidden fixed top-0 left-0  right-0 bg-green-700 text-white flex items-center justify-between p-4 z-50">
        <button onClick={() => setSidebarOpen(true)}>
          <FaBars size={22} />
        </button>

        <h1 className="font-semibold">Admin Dashboard</h1>
      </div>

      {/* SIDEBAR */}
      <aside
        className={`fixed lg:static top-0 min-h-screen left-0 h-auto w-72 bg-green-700 text-white p-5 flex flex-col justify-between transform transition-transform duration-300 z-50
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
  
        <div className="flex justify-end lg:hidden mb-2">
          <FaTimes
            className="cursor-pointer"
            size={22}
            onClick={() => setSidebarOpen(false)}
          />
        </div>

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
              icon={BiSolidDashboard}
              label="Orders"
              active={activeView === "orders"}
              onClick={() => handleNavigation("orders")}
            />

            {/* Mega Offers */}

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
                    onClick={() => handleNavigation("megaoffers", "uploadmegaoffer")}
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

            {/* PRODUCTS */}

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
                    onClick={() => handleNavigation("catalog", "category_list")}
                    className="cursor-pointer hover:text-green-300"
                  >
                    Category List
                  </li>

                  <li
                    onClick={() => handleNavigation("catalog", "product_list")}
                    className="cursor-pointer hover:text-green-300"
                  >
                    Product List
                  </li>

                  <li
                    onClick={() => handleNavigation("catalog", "banner_list")}
                    className="cursor-pointer hover:text-green-300"
                  >
                    Banner List
                  </li>

                </ul>
              )}
            </li>

            {/* UPLOAD */}

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
                    onClick={() => handleNavigation("upload", "bannerimages")}
                    className="cursor-pointer hover:text-green-300"
                  >
                    Banner Images
                  </li>

                </ul>
              )}
            </li>


             <li>
              <div
                onClick={() => setCouponsOpen(!couponsOpen)}
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white hover:text-green-700 rounded-lg"
              >
                <BiSolidCoupon /> Coupons
                <span className="ml-auto">
                  {couponsOpen ? <RiArrowDropUpLine /> : <RiArrowDropDownLine />}
                </span>
              </div>

              {couponsOpen && (
                <ul className="ml-8 mt-2 space-y-2 text-sm">
                  <li
                    onClick={() => handleNavigation("coupons", "uploadcoupons")}
                    className="cursor-pointer hover:text-green-300"
                  >
                    Upload Coupons
                  </li>

                  <li
                    onClick={() =>
                      handleNavigation("coupons", "coupons_list")
                    }
                    className="cursor-pointer hover:text-green-300"
                  >
                   Coupons List
                  </li>
                </ul>
              )}
            </li>

          </ul>
        </div>

        {/* USER FOOTER */}

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

      {/* MAIN CONTENT */}

      <main className="flex-1 p-8 lg:ml-0 mt-16 lg:mt-0">

        {activeView === "dashboard" && (
          <Dashboard setActiveView={setActiveView} setActiveForm={setActiveForm} />
        )}

        {activeView === "otp" && <OtpAuth />}

        {activeView === "upload" && <Upload activeForm={activeForm} />}

        {activeView === "catalog" && (
          <Catalog
            activeForm={activeForm}
            setActiveForm={setActiveForm}
            setActiveView={setActiveView}
          />
        )}

        {activeView === "megaoffers" && <Offers activeForm={activeForm} />}
         {activeView === "coupons" && <Coupons activeForm={activeForm} />}

        {activeView === "orders" && <Orders />}

        {activeView === "customers" && <CustomerList />}

        {activeView === "signup" && isSuperAdmin && <Signup />}

        {activeView === "users" && isSuperAdmin && <AdminsList />}

      </main>

    </div>
  );
}

