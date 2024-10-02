import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert";
import Modal from "react-modal";
import { Link, useNavigate } from "react-router-dom";

Modal.setAppElement("#root");

const BookOrder = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedOrders, setExpandedOrders] = useState({});
  const navigate = useNavigate();

  const URI = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchOrder();
  }, []);

  useEffect(() => {
    filterOrdersByStatus();
  }, [activeTab, orders, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredOrders]);

  const fetchOrder = async () => {
    try {
      const response = await axios.get(`${URI}api/productOrder/`);
      const sortedOrders = response.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setOrders(sortedOrders);
      setFilteredOrders(sortedOrders);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const filterOrdersByStatus = () => {
    let filtered = orders;

    if (activeTab !== "all") {
      filtered = filtered.filter((order) => order.status === activeTab);
    }

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.address.phone.includes(searchTerm) ||
        order.products.some(product =>
          product.productName && product.productName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredOrders(filtered);
  };

  const handleOnclick = async (orderId, status, userId) => {
    if (status === "pending") {
      updateOrderStatus(orderId, "processing");
    } else if (status === "processing") {
      updateOrderStatus(orderId, "shipped");
    } else if (status === "shipped") {
      await delivered(orderId, userId);
    }
  };

  const delivered = async (orderId, userId) => {
    try {
      await axios.patch(`${URI}api/productOrder/changeOrderStatus`, {
        orderId,
        status: "delivered",
      });
      fetchOrder();
      Swal("Success", "Order has been marked as delivered", "success");
    } catch (error) {
      console.error("Error marking order as delivered:", error);
      Swal("Error", "Failed to mark order as delivered", "error");
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.patch(`${URI}api/productOrder/changeOrderStatus`, {
        orderId,
        status,
      });
      fetchOrder();
      Swal("Success", `Order status updated to ${status}`, "success");
    } catch (error) {
      console.error("Error updating order status:", error);
      Swal("Error", "Failed to update order status", "error");
    }
  };

  const cancelOrder = async (orderId) => {
    Swal({
      title: "Are you sure?",
      text: "Do you want to cancel this order?",
      icon: "warning",
      buttons: ["No", "Yes"],
      dangerMode: true,
    }).then(async (willCancel) => {
      if (willCancel) {
        try {
          await axios.put(`${URI}api/productOrder/cancelOrder/${orderId}`);
          Swal("Order Cancelled", "The order has been successfully cancelled", "success");
          fetchOrder();
        } catch (error) {
          console.error("Error:", error);
          Swal("Error", "Failed to cancel the order", "error");
        }
      }
    });
  };

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  return (
    <div className="container overflow-hidden p-4">
      <h1 className="text-2xl font-bold mb-4">Order Details</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by email, phone number, or product name"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="border p-2 rounded w-full"
        />
      </div>

      <div className="flex space-x-4 mb-6">
        {["all", "pending", "processing", "shipped", "delivered", "cancelled"].map((status) => (
          <button
            key={status}
            onClick={() => setActiveTab(status)}
            className={`py-2 px-4 rounded-md ${activeTab === status
              ? "bg-green-500 text-white"
              : "bg-gray-200 text-black hover:bg-gray-300"
              }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <p className="text-sm text-green-600 mb-4">
        {activeTab === "all" ? "List of All Orders" : `List of ${activeTab} Orders`}
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-full border bg-white text-black shadow-md rounded-lg">
          <thead>
            <tr className="text-left bg-blue-600 text-white">
              <th className="py-2 px-4">Customer Info</th>
              <th className="py-2 px-4">Shipping Information</th>
              <th className="py-2 px-4">Product Details</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.map((order) => (
              <React.Fragment key={order._id}>
                <tr className="border bg-blue-300 text-black">
                  <td className="py-2 px-4 text-center">
                    <p>Order Date <br />{new Date(order.createdAt).toLocaleString()}</p>
                    <p>{order.user?.phoneNumber}</p>
                  </td>
                  <td className="py-2 px-4">
                    <p>{order?.address?.street}</p>
                    <p>{order?.address?.city}, {order?.address?.state}</p>
                    <p>{order?.address?.country}, {order?.address?.postalCode}</p>
                    <p>{order?.address?.phone}</p>
                  </td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => toggleOrderExpand(order._id)}
                      className="bg-blue-500 text-white rounded px-2 py-1"
                    >
                      {expandedOrders[order._id] ? "Show Less" : "Show Products"}
                    </button>
                    {expandedOrders[order._id] && (
                      <div className="mt-2">
                        {order.products.map((product) => (
                          <div key={product.productId} className="border rounded-sm p-2 my-2 flex flex-col items-center content-center">
                            <img
                              src={`${URI}uploads/${product.image}`}
                              alt="Product"
                              className="w-full h-40 rounded-sm"
                            />
                            <p className="font-semibold">{product.productName}</p>
                            <p>Product ID: {product.productId}</p>
                            <div className="grid grid-cols-2 gap-2">
                              <p>Price: ₹{product.price}</p>
                              <p>Qty: {product.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className={`py-2 px-4 text-center ${getStatusClass(order.status)}`}>
  {order.status}
</td>
                  <td className="py-2 px-4 text-center">
                    {order.status === "pending" && (
                      <button
                        onClick={() => handleOnclick(order._id, order.status, order.userId)}
                        className="bg-green-600 text-white rounded px-2 py-1"
                      >
                        Process Order
                      </button>
                    )}
                    {order.status === "processing" && (
                      <button
                        onClick={() => handleOnclick(order._id, order.status, order.userId)}
                        className="bg-green-600 text-white rounded px-2 py-1"
                      >
                        Ship Order
                      </button>
                    )}
                    {order.status === "shipped" && (
                      <button
                        onClick={() => handleOnclick(order._id, order.status, order.userId)}
                        className="bg-green-600 text-white rounded px-2 py-1"
                      >
                        Mark as Delivered
                      </button>
                    )}
                    {/* Show the Cancel button only for 'pending' and 'processing' orders */}
                    {(order.status === "pending" || order.status === "processing") && (
                      <button
                        onClick={() => cancelOrder(order._id)}
                        className="bg-red-600 text-white rounded px-2 py-1 mt-1"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between mt-4">
          <button onClick={handlePreviousPage} disabled={currentPage === 1} className="bg-gray-300 text-black px-4 py-2 rounded disabled:opacity-50">
            Previous
          </button>
          <button onClick={handleNextPage} disabled={currentPage === totalPages} className="bg-gray-300 text-black px-4 py-2 rounded disabled:opacity-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookOrder;
const getStatusClass = (status) => {
  switch (status) {
    case "pending":
      return "text-yellow-500"; // Yellow for pending
    case "processing":
      return "text-blue-500"; // Blue for processing
    case "shipped":
      return "text-purple-500"; // Purple for shipped
    case "delivered":
      return "text-green-500"; // Green for delivered
    case "cancelled":
      return "text-red-500"; // Red for cancelled
    default:
      return "text-gray-500"; // Default color for other statuses
  }
};