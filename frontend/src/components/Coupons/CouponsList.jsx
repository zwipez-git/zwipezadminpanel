import React, { useEffect, useState } from "react";
import Search_bar from "../../assets/Search_bar.png";


const API_BASE_URL = import.meta.env.VITE_API_URL;

function CouponsList({activeForm}) {

const [coupons,setCoupons] = useState([]);

useEffect(()=>{

fetch(`${API_BASE_URL}/api/getCoupons`)
.then(res=>res.json())
.then(data=>setCoupons(data))
.catch(err=>console.error(err));

},[]);

return (

<div className="p-10">

<h2 className="text-2xl font-bold text-green-700 mb-6">Coupons List</h2>

{activeForm === "coupons_list" && (

      <table className="min-w-full">

              <thead className="bg-gray-200">

<tr>

<th className="p-3">Code</th>
<th className="p-3">Type</th>
<th className="p-3">Value</th>
<th className="p-3">Min Order</th>
<th className="p-3">Max Discount</th>
<th className="p-3">New User</th>
<th className="p-3">Start</th>
<th className="p-3">Expiry</th>
{/* <th className="p-3">Active</th> */}

</tr>

</thead>

<tbody>

{coupons.map((coupon)=> (

<tr key={coupon.id} className="text-center ">

<td className="p-3">{coupon.code}</td>

<td className="p-3">{coupon.type}</td>

<td className="p-3">{coupon.value}</td>

<td className="p-3">₹{coupon.min_order}</td>

<td className="p-3">₹{coupon.max_discount}</td>

<td className="p-3">
{coupon.is_new_user ? "Yes" : "No"}
</td>

<td className="p-3">
{coupon.starts_at ? new Date(coupon.starts_at).toLocaleString() : "-"}
</td>

<td className="p-3">
{coupon.expires_at ? new Date(coupon.expires_at).toLocaleString() : "-"}
</td>

{/* <td className="p-3">
{coupon.is_active ? "Active" : "Inactive"}
</td> */}

</tr>

))}

</tbody>

</table>
)};

</div>

);

}

export default CouponsList;