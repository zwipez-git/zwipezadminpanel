import React, { useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function UploadCoupon({ activeForm }) {

const [code,setCode] = useState("");
const [type,setType] = useState("percent");
const [value,setValue] = useState("");
const [minOrder,setMinOrder] = useState("");
const [maxDiscount,setMaxDiscount] = useState("");
const [startsAt,setStartsAt] = useState("");
const [expiresAt,setExpiresAt] = useState("");
const [isNewUser,setIsNewUser] = useState(false);

const [loading,setLoading] = useState(false);

const handleSubmit = async () => {

if(!code || !type || !value){
alert("Please fill required fields");
return;
}

try{

setLoading(true);

const bodyData = {
code,
type,
value:Number(value),
min_order:Number(minOrder),
max_discount:Number(maxDiscount),
is_new_user:isNewUser
};

if(!isNewUser){
bodyData.starts_at = startsAt;
bodyData.expires_at = expiresAt;
}

const res = await fetch(`${API_BASE_URL}/api/addCoupon`,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(bodyData)
});

const data = await res.json();

if(!res.ok) throw new Error(data.message);

alert("Coupon Added Successfully");

setCode("");
setType("percent");
setValue("");
setMinOrder("");
setMaxDiscount("");
setStartsAt("");
setExpiresAt("");
setIsNewUser(false);

}catch(err){
console.error(err);
alert("Failed to add coupon");
}
finally{
setLoading(false);
}

};

return (

<div className="flex justify-center items-center p-10">

{activeForm === "uploadcoupons" && (

<div className="w-120 bg-white border-2 border-green-700 rounded-xl p-8">

<h2 className="text-2xl font-bold text-green-800 mb-6">
Add Coupon
</h2>

<input
type="text"
placeholder="Coupon Code"
value={code}
onChange={(e)=>setCode(e.target.value)}
className="w-full border p-3 rounded-xl mb-4"
/>

<select
value={type}
onChange={(e)=>setType(e.target.value)}
className="w-full border p-3 rounded-xl mb-4"
>
<option value="percent">Percent Discount</option>
<option value="flat">Flat Discount</option>
</select>

<input
type="number"
placeholder="Discount Value"
value={value}
onChange={(e)=>setValue(e.target.value)}
className="w-full border p-3 rounded-xl mb-4"
/>

<input
type="number"
placeholder="Minimum Order"
value={minOrder}
onChange={(e)=>setMinOrder(e.target.value)}
className="w-full border p-3 rounded-xl mb-4"
/>

<input
type="number"
placeholder="Max Discount"
value={maxDiscount}
onChange={(e)=>setMaxDiscount(e.target.value)}
className="w-full border p-3 rounded-xl mb-4"
/>

<label className="flex items-center mb-4">
<input
type="checkbox"
checked={isNewUser}
onChange={(e)=>setIsNewUser(e.target.checked)}
className="mr-2"
/>
New User Coupon
</label>

{!isNewUser && (

<>

<label className="text-sm">Start Time</label>

<input
type="datetime-local"
value={startsAt}
onChange={(e)=>setStartsAt(e.target.value)}
className="w-full border p-3 rounded-xl mb-4"
/>

<label className="text-sm">End Time</label>

<input
type="datetime-local"
value={expiresAt}
onChange={(e)=>setExpiresAt(e.target.value)}
className="w-full border p-3 rounded-xl mb-4"
/>

</>

)}

<button
onClick={handleSubmit}
disabled={loading}
className="w-full bg-green-700 text-white p-3 rounded-xl"
>

{loading ? "Adding..." : "Add Coupon"}

</button>

</div>

)}

</div>

);

}

export default UploadCoupon;