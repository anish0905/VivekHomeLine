import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const NavbarController = () => {
  const URI = import.meta.env.VITE_API_URL;

  const [formData, setFormData] = useState({
    categories: "",
    subcategories: [],
  });
  const [categories, setCategories] = useState([]);
  const [navbarHeaders, setNavbarHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchNavbarHeaders();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${URI}api/categories`);
      setCategories(response.data);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch categories",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNavbarHeaders = async () => {
    try {
      const response = await axios.get(`${URI}api/admin/navheaders`);
      setNavbarHeaders(response.data);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch navbar headers",
      });
    }
  };

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    const categoryObj = categories.find(
      (category) => category.category === selectedCategory
    );
    const selectedSubcategories = categoryObj
      ? categoryObj.subcategories.map((sub) => sub.name)
      : [];

    setFormData((prevData) => ({
      ...prevData,
      categories: selectedCategory,
      subcategories: selectedSubcategories,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${URI}api/admin/navheaders`, formData);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Navbar added successfully!",
      });
      setFormData({ categories: "", subcategories: [] });
      setIsModalOpen(false);
      fetchNavbarHeaders();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to add navbar: ${error.message}`,
      });
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${URI}api/admin/navheaders/${id}`);
          Swal.fire("Deleted!", "Your navbar has been deleted.", "success");
          fetchNavbarHeaders();
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to delete the navbar",
          });
        }
      }
    });
  };

  return (
    <>
      <div className="px-5 w-full bg-[#ffd8be] py-4 rounded-md">
        <div className="mb-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600"
          >
            Add New Navbar
          </button>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-[#ffefd3] p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-2xl font-semibold mb-4">Add Navbar</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.categories}
                    onChange={handleCategoryChange}
                    className="text-blue-950 font-serif font-semibold mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category.category}>
                        {category.category}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.subcategories.length > 0 && (
                  <div className="mb-4">
                    <label
                      htmlFor="subcategories"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Selected Subcategories
                    </label>
                    <ul className="list-disc list-inside text-blue-950">
                      {formData.subcategories.map((sub, index) => (
                        <li key={index}>{sub}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="mr-2 px-4 py-2 bg-gray-300 text-white rounded-md shadow-sm hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-500 text-white rounded-md shadow-sm hover:bg-green-600"
                  >
                    Add Navbar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Display fetched navbar headers in a table */}
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Existing Navbars:</h3>
          {navbarHeaders.length === 0 ? (
            <p>No navbars found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-sm leading-4 text-gray-600 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-sm leading-4 text-gray-600 uppercase tracking-wider">
                      Subcategories
                    </th>
                    <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-sm leading-4 text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {navbarHeaders.map((navbar) => (
                    <tr key={navbar._id}>
                      <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                        {navbar.categories}
                      </td>
                      <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                        {navbar.subcategories.join(", ")}
                      </td>
                      <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                        <button
                          onClick={() => handleDelete(navbar._id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-md shadow-sm hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NavbarController;
