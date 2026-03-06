import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaBoxOpen,
  FaUsers,
  FaBullhorn,
  FaExclamationTriangle,
  FaSignOutAlt ,FaMoon,FaArrowUp ,FaArrowDown,
  FaApple,FaCarrot,
  FaIceCream
} from "react-icons/fa";
import { BiSolidCategory } from "react-icons/bi";
import { CiSearch } from "react-icons/ci";
import { IoIosNotifications } from "react-icons/io";
import {
    PieChart,
  Pie,
  
   Cell,
  Legend,
 
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function Dashboard() {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    customers: 0,
    mega_offers: 0,
    low_stock: 0,
    today_sales: 0,
    fruits: 0,
    vegetables: 0,
    dairy: 0,
    featured_products: [], 
  });
  const [monthFilter, setMonthFilter] = useState("All");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/dashboard`);
        setStats({
          ...res.data,
          featured_products: res.data.featured_products || [], 
        });
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "Products", value: stats.products, icon: FaBoxOpen },
    { label: "Categories", value: stats.categories, icon: BiSolidCategory },
    { label: "Customers", value: stats.customers, icon: FaUsers },
    { label: "Mega Offers", value: stats.mega_offers, icon: FaBullhorn },
    { label: "Low Stock", value: stats.low_stock, icon: FaExclamationTriangle },

    { label: "Fruits", value: stats.fruits, icon: FaApple },
    { label: "Vegetables", value: stats.vegetables, icon: FaCarrot },
    { label: "Dairy", value: stats.dairy, icon: FaIceCream },
  ];

  
const data = [
  { month: "Jan", sales: 68 },
  { month: "Feb", sales: 10 },
  { month: "Mar", sales: 54 },
  { month: "Apr", sales: 19 },
  { month: "May", sales: 7 },
  { month: "Jun", sales: 25 },
  { month: "Jul", sales: 60 },
  { month: "Aug", sales: 24 },
  { month: "Sep", sales: 33 },
  { month: "Oct", sales: 28 },
  { month: "Nov", sales: 32 },
  { month: "Dec", sales: 78 },
];

const expense = [
  { month: "Jan", sales: 1290 },
  { month: "Feb", sales: 12290 },
  { month: "Mar", sales: 6782 },
  { month: "Apr", sales: 10992 },
  { month: "May", sales: 28201},
  { month: "Jun", sales: 2292},
  { month: "Jul", sales: 129 },
  { month: "Aug", sales:  8621 },
  { month: "Sep", sales:  9123},
  { month: "Oct", sales:  789 },
  { month: "Nov", sales:  4245},
  { month: "Dec", sales:  911 },
];

const pieData = [
  { name: "Fruits", value: stats.fruits },
  { name: "Vegetables", value: stats.vegetables },
  { name: "Dairy", value: stats.dairy },
];

const COLORS = ["#ef4444", "#22c55e", "#3b82f6"];   

  return (
    <>
  <div className="flex items-center justify-between gap-6 px-6">
  
  {/* Search bar */}
  <div className="relative w-250">
    <input
      type="text"
      placeholder="Search..."
      className="w-full px-4 py-2 pr-10 rounded-lg  focus:outline-none bg-green-100 hover:bg-green-200"
    />
    <CiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
  </div>

  <div className="flex items-center gap-20">
    <FaMoon className="p-2 text-4xl rounded-full bg-green-100 cursor-pointer  hover:bg-green-200"/>
    <IoIosNotifications className="p-2 text-4xl rounded-full bg-green-100 cursor-pointer  hover:bg-green-200" />

    <button
      className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-white bg-green-100 hover:bg-green-200"
      onClick={() => {
        localStorage.removeItem("user");
        window.location.reload();
      }}
    >
      <FaSignOutAlt />
      Logout
    </button>

  </div>
</div>

 
    <div className="p-6 space-y-1 mt-4 ">
     
      <div className=" rounded-xl p-6 flex items-center justify-between">
      
        {/*cards */}
      <div className=" ml-30 grid  grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-15 ">
        {cards.map((c, i) => (
  <div key={i}>
          <div key={i} className=" p-5 h-50  w-40 rounded-xl shadow-sm  gap-4 bg-green-100 ">
            <c.icon className="text-green-700 text-5xl p-2 ml-8 rounded-3xl flex justify-center bg-green-50 mb-3" />
             <div className=" text-l text-gray-500 flex justify-center mb-3">{c.label}</div>
              <div className="text-4xl font-bold text-green-700 flex justify-center">{c.value}</div>
        
          
          </div>
               
          </div>
         
        ))}
      </div>
      <div className="bg-green-100 h-80  w-100 float-right rounded-2xl">
        <div className="p-4">
          <h1 className="text-4xl font-extrabold   text-gray-500 mb-2 ">$9,210</h1>
<h3 className="text-xl font-extrabold   text-gray-500 mb-5">Active Balance</h3>
<div className="space-y-4">


  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <FaArrowUp className="p-2 text-4xl rounded-xl bg-green-200 text-green-500" />
      <p className="text-gray-500">Income</p>
    </div>
    <span className="text-gray-500">$7900.00</span>
  </div>

 
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <FaArrowDown className="p-2 text-4xl rounded-xl bg-green-200 text-red-500" />
      <p className="text-gray-500">Expenses</p>
    </div>
    <span className="text-gray-500">-$900.00</span>
  </div>


  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <FaArrowDown className="p-2 text-4xl rounded-xl bg-green-200 text-red-500" />
      <p className="text-gray-500">Tax</p>
    </div>
    <span className="text-gray-500">-$600.00</span>
  </div>

</div>



      </div>
        </div>

      </div>

    

      {/* summary */}
      <div className="flex gap-27">


  <div className="w-[65%] bg-white rounded-xl p-6 shadow-sm">
    
 
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold">Summary Sales</h2>

      <select className="px-4 py-2 border rounded-lg focus:outline-none">
        <option>Month</option>
        <option>January</option>
        <option>February</option>
        <option>March</option>
        <option>April</option>
        <option>August</option>
        <option>September</option>
        <option>October</option>
        <option>November</option>
        <option>December</option>
      </select>
    </div>

    {/* Graph */}
    <div className="h-65">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <XAxis dataKey="month" axisLine={false} tickLine={false} />
          <YAxis axisLine={false} tickLine={false} />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="sales"
            stroke="#15803D"
            fill="url(#colorSales)"
            strokeWidth={2}
          />
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#15803D" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#15803D" stopOpacity={0.05} />
            </linearGradient>
          </defs>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>


  <div className="w-100 h-60 bg-green-100 rounded-2xl p-6">
    <h1 className="text-2xl font-bold text-gray-600 mb-4">
      Upcoming Payments
    </h1>

    <div className="space-y-4">

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded bg-green-700"></div>
          <p className="text-gray-500">Easy Payments</p>
        </div>
        <span className="bg-green-200 text-[#15803D] rounded-xl px-2 py-1">
          $79,000.00
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded bg-red-700"></div>
          <p className="text-gray-500">Fast Spring</p>
        </div>
        <span className="bg-green-200 text-[#15803D] rounded-xl px-2 py-1">
          $5,689.00
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded bg-orange-500"></div>
          <p className="text-gray-500">Payments</p>
        </div>
        <span className="bg-green-200 text-[#15803D] rounded-xl px-2 py-1">
          $65,480.00
        </span>
      </div>

    </div>
  </div> 

</div>  
<div>
  <div className="w-100 h-60 bg-green-100 rounded-2xl p-4 float-right mr-5 -translate-y-1/3">
    <h1 className="text-2xl font-bold text-gray-600 mb-4">
     Expenses Status
    </h1>

   {/* Graph */}
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={expense}>
          <XAxis dataKey="month" axisLine={false} tickLine={false} />
          <YAxis axisLine={false} tickLine={false} />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="sales"
            stroke="#15803D"
            fill="url(#colorSales)"
            strokeWidth={2}
          />
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#15803D" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#15803D" stopOpacity={0.05} />
            </linearGradient>
          </defs>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
<div>
  
</div>
   <div className="w-100 h-72 bg-green-100 rounded-2xl p-4 mt-10 ">
  <h1 className="text-2xl font-bold text-gray-600 mb-4">
    Category Distribution
  </h1>

  <div className="h-52">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          innerRadius={50}  
          paddingAngle={5}
        >
          {pieData.map((entry, index) => (
            <Cell key={index} fill={COLORS[index]} />
          ))}
        </Pie>

        <Tooltip />
        <Legend verticalAlign="bottom" />
      </PieChart>
    </ResponsiveContainer>
  </div>
</div>

  





</div>

  </div></>
  );
}


