import { useState, useEffect } from "react";
import { CiSearch, CiMail } from "react-icons/ci";
import { BsThreeDots } from "react-icons/bs";
import { MdEmail, MdLocalPhone } from "react-icons/md";
import { RiWhatsappFill, RiArrowGoBackLine } from "react-icons/ri";
import { CgProfile, CgTrack } from "react-icons/cg";
import { RxCross2 } from "react-icons/rx";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function Order() {

  const [statusFilter, setStatusFilter] = useState("All");
  const [monthFilter, setMonthFilter] = useState("All");
  const [amountFilter, setAmountFilter] = useState("All");

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);



  useEffect(() => {

    const fetchOrders = async () => {

      try {

        const res = await fetch(
          `${API_BASE_URL}/api/getOrders`
        );

        const data = await res.json();

        if (data.status === 1) {
const formatted = data.data.map(o => ({
  id: "#" + o.order_number,   
  orderId: o.id,              
  name: o.customer_id,
  status: o.status,
  total: Number(o.grand_total),
  date: new Date(o.created_at)
    .toLocaleString("en-US", { month: "short", day: "numeric" })
}));

          setOrders(formatted);

        } else {
          setOrders([]);
        }

      } catch (err) {
        console.log(err);
      }

    };

    fetchOrders();

  }, []);

const handleSelectChange = async (order) => {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/admin/getOrderDetails/${order.orderId}` 
    );

    const data = await res.json();

    if (!data.order) {
      console.log("No order found");
      return;
    }

    setSelectedOrder({
      id: order.id,
      name: data.order.customer_id,
      status: data.order.status,
      total: data.order.grand_total,
      date: new Date(data.order.created_at)
        .toLocaleString("en-US", { month: "short", day: "numeric" }),

      items: data.items,

      summary: data.summary
    });

  } catch (err) {
    console.log("Error fetching order:", err);
  }
};

  const getStatusStyle = (status) => {
    switch (status) {
      case "Paid":
      case "CREATED":
        return "bg-yellow-300 text-yellow-800";
      case "ASSIGNED":
        return "bg-green-300 text-green-800";
       case "PICKED_UP":
        return "bg-red-300 text-red-800";
      case "DELIVERED":
        return "bg-orange-300 text-orange-800";
      default:
        return "bg-gray-200";
    }
  };





  const filteredOrders = orders.filter((order) => {

    const statusMatch =
      statusFilter === "All" ||
      order.status === statusFilter;

    const monthMatch =
      monthFilter === "All" ||
      order.date.startsWith(monthFilter);

    const amountMatch =
      amountFilter === "All" ||
      (amountFilter === "100-1500" &&
        order.total >= 100 &&
        order.total <= 1500) ||
      (amountFilter === "1500-3000" &&
        order.total > 1500);

    return statusMatch && monthMatch && amountMatch;

  });



  return (

    <section className="flex gap-6">

      {/* LEFT */}

      <div className="flex-1">

        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-green-700">Orders</h2>

          <div className="flex gap-4">
            <CiMail className="h-10 w-10 p-2 border rounded-xl bg-gray-100" />
            <CiSearch className="h-10 w-10 p-2 border rounded-xl bg-gray-100" />
          </div>
        </div>



        {/* FILTER */}

        <div className="flex justify-between items-center mt-4">

          <div className="flex gap-4">

            <select
              className="px-4 py-2 border rounded-lg"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">Any Status</option>
              <option value="CREATED">Created</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="DELIVERED">Delivered</option>
              
            </select>


            <select
              className="px-4 py-2 border rounded-lg"
              onChange={(e) => setAmountFilter(e.target.value)}
            >
              <option value="All">Any Amount</option>
              <option value="100-1500">100-1500</option>
              <option value="1500-3000">1500+</option>
            </select>

          </div>


          <select
            className="px-4 py-2 border rounded-lg"
            onChange={(e) => setMonthFilter(e.target.value)}
          >
            <option value="All">Sort by Month</option>
            <option value="Jan">Jan</option>
            <option value="Feb">Feb</option>
            <option value="Mar">Mar</option>
            <option value="Apr">Apr</option>
            <option value="May">May</option>
            <option value="Jun">Jun</option>
            <option value="Jul">Jul</option>
            <option value="Aug">Aug</option>
            <option value="Sep">Sep</option>
            <option value="Oct">Oct</option>
            <option value="Nov">Nov</option>
            <option value="Dec">Dec</option>
          </select>

        </div>



        {/* TABLE */}

        <div className="overflow-x-auto mt-8">

          <table className="min-w-full">

            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 text-left">Order</th>
                <th className="px-4 py-2 text-left">Customer</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Total</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th></th>
              </tr>
            </thead>


            <tbody>

              {filteredOrders.map((order) => (

                <tr key={order.id}>

                  <td className="px-4 py-2">

                    <div className="flex gap-2">

                     <input
  type="checkbox"
  checked={selectedOrder?.id === order.id}
  onChange={() => handleSelectChange(order)}
/>

                      {order.id}

                    </div>

                  </td>

                  <td>{order.name}</td>

                  <td>
                    <span
                      className={`px-3 py-1 rounded-xl text-sm ${getStatusStyle(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </td>

                  <td>₹{order.total}</td>

                  <td>{order.date}</td>

                  <td>
                    <BsThreeDots />
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>



      {/* RIGHT PANEL */}

      {selectedOrder && (


<>
    <div
      className="fixed inset-0 bg-black/20  z-40"
      onClick={() => setSelectedOrder(null)}
    />

    <div
      className="
        fixed top-20  right-0 h-auto w-80 bg-white shadow-3xl  z-50
        transform transition-transform duration-300 ease-in-out
        translate-x-0 border m-4  rounded-2xl border-green-200
      "
    >
      <div className="p-5 ">
  
        <h3 className="text-xl font-bold mb-6 flex justify-between items-center">
          Order {selectedOrder.id}

          <RxCross2
            className="p-2 text-4xl rounded-full bg-green-100 cursor-pointer hover:bg-green-200"
            onClick={() => setSelectedOrder(null)}
          />
        </h3>

     
        <div className="flex gap-4 mb-5">
          <span
            className={`px-2 py-1 rounded-lg ${getStatusStyle(
              selectedOrder.status
            )}`}
          >
            {selectedOrder.status}
          </span>
          <p>{selectedOrder.date}</p>
        </div>

        <div className="flex justify-center">
          <CgProfile className="text-7xl mb-3" />
        </div>

        <p className="flex justify-center mb-5 font-semibold">
          {selectedOrder.name}
        </p>

       
        <div className="flex gap-4 justify-center mb-8">
          <MdEmail className="p-2 text-4xl rounded-full bg-green-100 cursor-pointer  hover:bg-green-200" />
          <MdLocalPhone className="p-2 text-4xl rounded-full bg-green-100 cursor-pointer  hover:bg-green-200" />
          <RiWhatsappFill className="p-2 text-4xl rounded-full bg-green-100 cursor-pointer  hover:bg-green-200" />
        </div>

        <div className="h-px bg-green-300 mb-4" />

      
       <p className="font-semibold mb-4">Order Items:</p>

<div className="space-y-3 max-h-60 overflow-y-auto">
  {selectedOrder.items.length > 0 ? (
    selectedOrder.items.map((item, index) => (
      <div
        key={index}
        className="mb-4"
      
      >
     <div className="space-y-2">

  <div className="flex justify-between">
    <span className="font-bold">Product Name:</span>
    <span>{item.name}</span>
  </div>

  <div className="flex justify-between">
    <span className="font-bold">Price:</span>
    <span>₹{item.price}</span>
  </div>

  <div className="flex justify-between">
    <span className="font-bold">Quantity:</span>
    <span>{item.quantity}</span>
  </div>

  <div className="flex justify-between">
    <span className="font-bold">Subtotal:</span>
    <span>₹{selectedOrder.summary?.subtotal}</span>
  </div>

  <div className="flex justify-between">
    <span className="font-bold">Tax:</span>
    <span>₹{selectedOrder.summary?.tax}</span>
  </div>

  <div className="flex justify-between">
    <span className="font-bold"> Delivery:</span>
    <span>₹{selectedOrder.summary?.deliveryCharge}</span>
  </div>

</div>
         
 

              

            
            </div>


        
      
    ))
  ) : (
    <p className="text-gray-400 text-sm">No items found</p>
  )}
</div>

        <div className="h-px bg-green-300 mb-4 mt-auto" />

        <p className="mb-5">
          <strong>Total:</strong> <span className="float-right text-xl"> {selectedOrder.total}.00</span>
        </p>

        <div className="h-px bg-green-300 mb-6" />

     
        <div className="flex gap-4">
          <button className="flex items-center justify-center gap-2 flex-1 bg-green-300  hover:bg-green-400 rounded-2xl p-3">
            Track <CgTrack />
          </button>

          <button className="flex items-center justify-center gap-2 flex-1 bg-amber-300   hover:bg-amber-400 rounded-2xl p-3">
            Refund <RiArrowGoBackLine />
          </button>
        </div>
      </div>
    </div>

      
</>
      )}

    </section>

  );
}

export default Order;



