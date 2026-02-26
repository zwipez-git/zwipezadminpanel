import { useState } from "react";
import { CiSearch, CiMail } from "react-icons/ci";
import { BsThreeDots } from "react-icons/bs";
import { MdEmail,MdLocalPhone  } from "react-icons/md";
import { RiWhatsappFill,RiArrowGoBackLine  } from "react-icons/ri";
import { CgProfile,CgTrack } from "react-icons/cg";
import { RxCross2 } from "react-icons/rx";

function Order() {
  const [statusFilter, setStatusFilter] = useState("All");
  const [monthFilter, setMonthFilter] = useState("All");
  const [amountFilter, setAmountFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Paid":
        return "bg-yellow-200 text-yellow-800";
      case "Completed":
        return "bg-green-200 text-green-800";
      case "Delivered":
        return "bg-orange-200 text-orange-800";
      default:
        return "bg-gray-200";
    }
  };

    const orders = [
    { id: "#899011", name: "Smith", status: "Paid", total: "$190", date: "Jan 8" },
    { id: "#908435", name: "Saran", status: "Delivered", total: "$120", date: "Dec 10" },
    { id: "#257813", name: "Madhu", status: "Paid", total: "$1200", date: "Feb 3" },
    { id: "#100100", name: "Johna", status: "Delivered", total: "$1240", date: "Mar 15" },
    { id: "#763121", name: "Mani", status: "Paid", total: "$249", date: "Apr 1" },
    { id: "#111212", name: "Siva", status: "Paid", total: "$567", date: "May 22" },
    { id: "#122311", name: "Ram", status: "Completed", total: "$780", date: "Jun 9" },
    { id: "#087556", name: "Jansi", status: "Paid", total: "$110", date: "Jul 30" },
    { id: "#123401", name: "Kumar", status: "Paid", total: "$1080", date: "Aug 14" },
    { id: "#907431", name: "Pradeep", status: "Paid", total: "$1210", date: "Sep 5" },
    { id: "#123465", name: "Chandru", status: "Paid", total: "$200", date: "Oct 19" },
    { id: "#108911", name: "Gray", status: "Completed", total: "$340", date: "Nov 27" },
    { id: "#121001", name: "Chiristiana", status: "Delivered", total: "$420", date: "Dec 10" },
    { id: "#128637", name: "Jennifer", status: "Paid", total: "$590", date: "Jan 2" },
    { id: "#100112", name: "John", status: "Paid", total: "$1900", date: "Feb 18" },
    { id: "#212136", name: "James", status: "Delivered", total: "$900", date: "Mar 8" },
  ];
const filteredOrders = orders.filter((order) => {
    const statusMatch =
      statusFilter === "All" || order.status === statusFilter;

    const monthMatch =
      monthFilter === "All" || order.date.startsWith(monthFilter);

    const amountMatch =
      amountFilter === "All" ||
      (amountFilter === "100-1500" && order.total >= 100 && order.total <= 1500) ||
      (amountFilter === "1500-3000" && order.total > 1500 && order.total <= 3000);

    return statusMatch && monthMatch && amountMatch;
  });

  return (
    <section className="flex gap-6">
   
      <div className="flex-1">
     
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-green-700">Orders</h2>
          <div className="flex gap-4">
            <CiMail className="h-10 w-10 p-2 border rounded-xl bg-gray-100" />
            <CiSearch className="h-10 w-10 p-2 border rounded-xl bg-gray-100" />
          </div>
        </div>

      
        <div className="flex justify-between items-center mt-4">
          <div className="flex gap-4">
            <select
              className="px-4 py-2 border rounded-lg"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">Any Status</option>
              <option value="Paid">Paid</option>
              <option value="Delivered">Delivered</option>
              <option value="Completed">Completed</option>
            </select>

            <select
              className="px-4 py-2 border rounded-lg"
              onChange={(e) => setAmountFilter(e.target.value)}
            >
              <option value="All">Any Amount</option>
              <option value="100-1500">$100 - $1500</option>
              <option value="1500-3000">$1500+</option>
            </select>
          </div>

          <select
            className="px-4 py-2 border rounded-lg"
            onChange={(e) => setMonthFilter(e.target.value)}
          >
            <option value="All">Sort by Month</option>
            <option value="Jan">January</option>
            <option value="Feb">February</option>
            <option value="Mar">March</option>
            <option value="Apr">April</option>
            <option value="Aug">August</option>
            <option value="Sep">September</option>
            <option value="Oct">October</option>
            <option value="Nov">November</option>
            <option value="Dec">December</option>
          </select>
        </div>

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
        <tr
          key={order.id}
          className="hover:bg-gray-50 transition"
        >
          <td className="px-4 py-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedOrder?.id === order.id}
                onChange={() => setSelectedOrder(order)}
                className="focus:ring-0"
              />
              {order.id}
            </div>
          </td>

          <td className="px-4 py-2">{order.name}</td>

          <td className="px-4 py-2">
            <span
              className={`px-3 py-1 rounded-xl text-sm ${getStatusStyle(
                order.status
              )}`}
            >
              {order.status}
            </span>
          </td>

          <td className="px-4 py-2">{order.total}</td>
          <td className="px-4 py-2">{order.date}</td>

          <td className="px-4 py-2">
            <BsThreeDots className="cursor-pointer" />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

      </div>

      {/* RIGHT SIDE - DETAILS PANEL */}
    
{selectedOrder && (
  <>
  
    <div
      className="fixed inset-0 bg-black/20  z-40"
      onClick={() => setSelectedOrder(null)}
    />

    <div
      className="
        fixed top-0 right-0 h-220 w-80 bg-white shadow-3xl  z-50
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

        <div className="h-px bg-green-100 mb-4" />

      
        <p className="font-semibold mb-40">Order Items:</p>

        <div className="h-px bg-green-100 mb-4 mt-[9cm]" />

        <p className="mb-5">
          <strong>Total</strong> <span className="float-right text-xl"> {selectedOrder.total}.00</span>
        </p>

        <div className="h-px bg-green-100 mb-6" />

     
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
