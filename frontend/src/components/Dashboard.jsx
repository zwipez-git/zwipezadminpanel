import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaBoxOpen,
  FaUsers,
  FaBullhorn,
  FaExclamationTriangle,
  FaSignOutAlt,
  FaMoon,
  FaArrowUp,
  FaArrowDown
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

export default function Dashboard({ setActiveView, setActiveForm }) {

const [stats,setStats]=useState({
products:0,
categories:0,
customers:0,
mega_offers:0,
low_stock:0,
fruits:0,
vegetables:0,
dairy:0,
featured_products:[]
})

useEffect(()=>{
const fetchStats=async()=>{
try{
const res=await axios.get(`${API_BASE_URL}/api/dashboard`)
setStats({...res.data,featured_products:res.data.featured_products||[]})
}catch(err){
console.log(err)
}
}
fetchStats()
},[])

const cards=[
{label:"Products",value:stats.products,icon:FaBoxOpen,view:"catalog",form:"product_list"},
{label:"Categories",value:stats.categories,icon:BiSolidCategory,view:"catalog",form:"category_list"},
{label:"Customers",value:stats.customers,icon:FaUsers,view:"customers"},
{label:"Mega Offers",value:stats.mega_offers,icon:FaBullhorn,view:"megaoffers",form:"megaoffer_list"},
{label:"Low Stock",value:stats.low_stock,icon:FaExclamationTriangle}
]

const data=[
{month:"Jan",sales:68},
{month:"Feb",sales:10},
{month:"Mar",sales:54},
{month:"Apr",sales:19},
{month:"May",sales:7},
{month:"Jun",sales:25},
{month:"Jul",sales:60},
{month:"Aug",sales:24},
{month:"Sep",sales:33},
{month:"Oct",sales:28},
{month:"Nov",sales:32},
{month:"Dec",sales:78}
]

const expense=[
{month:"Jan",sales:1290},
{month:"Feb",sales:12290},
{month:"Mar",sales:6782},
{month:"Apr",sales:10992},
{month:"May",sales:28201},
{month:"Jun",sales:2292},
{month:"Jul",sales:129},
{month:"Aug",sales:8621},
{month:"Sep",sales:9123},
{month:"Oct",sales:789},
{month:"Nov",sales:4245},
{month:"Dec",sales:911}
]

const pieData=[
{name:"Fruits",value:stats.fruits},
{name:"Vegetables",value:stats.vegetables},
{name:"Dairy",value:stats.dairy}
]

const COLORS=["#ef4444","#22c55e","#3b82f6"]

return(
<>

{/* TOP BAR */}

<div className="flex flex-col lg:flex-row items-center justify-between gap-4 px-4 lg:px-6">

<div className="relative w-full md:w-96">
<input
type="text"
placeholder="Search..."
className="w-full px-4 py-2 pr-10 rounded-lg bg-green-100 hover:bg-green-200 focus:outline-none"
/>
<CiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl"/>
</div>

<div className="flex items-center gap-4 md:gap-8">
<FaMoon className="p-2 text-4xl rounded-full bg-green-100 hover:bg-green-200 cursor-pointer"/>
<IoIosNotifications className="p-2 text-4xl rounded-full bg-green-100 hover:bg-green-200 cursor-pointer"/>

<button
className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-white bg-green-100 hover:bg-green-200"
onClick={()=>{
localStorage.removeItem("user")
window.location.reload()
}}
>
<FaSignOutAlt/>
Logout
</button>
</div>
</div>

<div className="p-4 lg:p-6 space-y-6">

{/* cards */}

<div className="flex flex-col xl:flex-row gap-6">

<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-6 flex-1">

{cards.map((c,i)=>(
<div key={i}
onClick={()=>{
setActiveView(c.view)
if(c.form) setActiveForm(c.form)
}}
className="p-5 h-50 rounded-xl shadow-sm bg-green-100 hover:bg-green-200 cursor-pointer transition flex flex-col items-center justify-center"
>

<c.icon className="text-green-700 text-5xl p-2 rounded-3xl bg-green-50 mb-3"/>

<div className="text-gray-500 mb-2">{c.label}</div>

<div className="text-3xl font-bold text-green-700">{c.value}</div>

</div>
))}

</div>

{/* ACTIVE BALANCE */}

<div className="bg-green-100 rounded-2xl p-6 w-full xl:w-80">

<h1 className="text-4xl font-extrabold text-gray-500 mb-2">$9,210</h1>
<h3 className="text-xl font-extrabold text-gray-500 mb-5">Active Balance</h3>

<div className="space-y-4">

<div className="flex justify-between items-center">
<div className="flex items-center gap-3">
<FaArrowUp className="p-2 text-4xl rounded-xl bg-green-200 text-green-500"/>
<p className="text-gray-500">Income</p>
</div>
<span className="text-gray-500">$7900.00</span>
</div>

<div className="flex justify-between items-center">
<div className="flex items-center gap-3">
<FaArrowDown className="p-2 text-4xl rounded-xl bg-green-200 text-red-500"/>
<p className="text-gray-500">Expenses</p>
</div>
<span className="text-gray-500">-$900.00</span>
</div>

<div className="flex justify-between items-center">
<div className="flex items-center gap-3">
<FaArrowDown className="p-2 text-4xl rounded-xl bg-green-200 text-red-500"/>
<p className="text-gray-500">Tax</p>
</div>
<span className="text-gray-500">-$600.00</span>
</div>

</div>
</div>

</div>

{/* SALES + PAYMENTS */}

<div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

<div className="bg-white rounded-xl p-6 shadow-sm xl:col-span-2">

<div className="flex justify-between mb-4">
<h2 className="text-xl font-semibold">Summary Sales</h2>
<select className="px-4 py-2 border rounded-lg">
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

<div className="h-64">
<ResponsiveContainer width="100%" height="100%">
<AreaChart data={data}>
<XAxis dataKey="month"/>
<YAxis/>
<Tooltip/>
<Area type="monotone" dataKey="sales" stroke="#15803D" fill="#bbf7d0"/>
</AreaChart>
</ResponsiveContainer>
</div>

</div>

{/* UPCOMING PAYMENTS */}

<div className="bg-green-100 rounded-2xl p-6">

<h1 className="text-2xl font-bold text-gray-600 mb-4">Upcoming Payments</h1>

<div className="space-y-4">

<div className="flex justify-between">
<p className="text-gray-500">Easy Payments</p>
<span className="bg-green-200 px-2 py-1 rounded-xl">$79,000</span>
</div>

<div className="flex justify-between">
<p className="text-gray-500">Fast Spring</p>
<span className="bg-green-200 px-2 py-1 rounded-xl">$5,689</span>
</div>

<div className="flex justify-between">
<p className="text-gray-500">Payments</p>
<span className="bg-green-200 px-2 py-1 rounded-xl">$65,480</span>
</div>

</div>

</div>

</div>

{/* BOTTOM SECTION */}

<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

{/* EXPENSE GRAPH */}

<div className="bg-green-100 rounded-2xl p-6">

<h1 className="text-2xl font-bold text-gray-600 mb-4">Expenses Status</h1>

<div className="h-52">
<ResponsiveContainer width="100%" height="100%">
<AreaChart data={expense}>
<XAxis dataKey="month"/>
<YAxis/>
<Tooltip/>
<Area type="monotone" dataKey="sales" stroke="#15803D" fill="#bbf7d0"/>
</AreaChart>
</ResponsiveContainer>
</div>

</div>

{/* PIE CHART */}

<div className="bg-green-100 rounded-2xl p-6">

<h1 className="text-2xl font-bold text-gray-600 mb-4">Category Distribution</h1>

<div className="h-52">
<ResponsiveContainer width="100%" height="100%">
<PieChart>
<Pie data={pieData} dataKey="value" outerRadius={80} innerRadius={50}>
{pieData.map((e,i)=>(
<Cell key={i} fill={COLORS[i]}/>
))}
</Pie>
<Tooltip/>
<Legend/>
</PieChart>
</ResponsiveContainer>
</div>

</div>

</div>

</div>

</>
)
}