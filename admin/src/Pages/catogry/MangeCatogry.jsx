import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import AddCategoryModal from "./AddCategoryModal"; // Adjust the path as needed
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import the Alert components
import UpdateCategoryModal from "./UpdateCategoryModal"; // Import the UpdateCategoryModal

const ManageCategory = () => {
  const [categoriesData, setCategoriesData] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null); // To hold the category being edited
  const [searchTerm, setSearchTerm] = useState("");
  const [alert, setAlert] = useState(null); // For alert

  const URI = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const resp = await axios.get(`${URI}api/categories/`);
      setCategoriesData(resp.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSaveCategory = async (formData) => {
    try {
      const resp = await axios.post(`${URI}api/categories/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setCategoriesData([...categoriesData, resp.data]); // Add new category
      setAlert({
        type: "success",
        message: "Category added successfully!",
      });

      fetchCategories();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error saving category:", error);
      setAlert({
        type: "error",
        message: "Failed to save category.",
      });
    }
  };

  const handleUpdateCategory = async (categoryId, updatedData) => {
    try {
      await axios.put(`${URI}api/categories/${categoryId}`, updatedData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      fetchCategories(); // Refresh categories
      setAlert({
        type: "success",
        message: "Category updated successfully!",
      });
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating category:", error);
      setAlert({
        type: "error",
        message: "Failed to update category.",
      });
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await axios.delete(`${URI}api/categories/${categoryId}`);
      setCategoriesData(categoriesData.filter((cat) => cat._id !== categoryId));
      setAlert({
        type: "success",
        message: "Category deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      setAlert({
        type: "error",
        message: "Failed to delete category.",
      });
    }
  };

  const filteredCategories = categoriesData.filter((category) => {
    return (
      typeof category.category === "string" &&
      category.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  return (
    <div className="lg:py-5 py-4 px-4 font-sans text-white w-full flex-row items-center content-center justify-center">
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 w-full">
        <div className="w-full lg:w-1/2">
          <input
            type="text"
            placeholder="Search Category"
            className="px-4 py-2 border text-black rounded-lg w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full lg:w-1/2 flex justify-end">
          <Button
            className="my-4"
            onClick={() => {
              setIsAddModalOpen(true);
            }}
          >
            ADD Category
          </Button>
        </div>
      </div>

      {/* Display alert message */}
      {alert && (
        <Alert
          variant={alert.type === "success" ? "success" : "destructive"}
          className="my-4"
        >
          <AlertTitle>
            {alert.type === "success" ? "Success" : "Error"}
          </AlertTitle>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      {/* Display categories in a full-screen table */}
      <div className="overflow-x-auto w-full my-4">
        <table className="min-w-full divide-y divide-gray-200 text-white">
          <thead className="bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-center">
                No.
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Category Name
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Category Image
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Subcategories
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-700 divide-y divide-gray-600">
            {filteredCategories.map((data, index) => (
              <tr key={data._id}>
                <td className="px-6 py-4 border-b border-gray-700 text-center">
                  {index + 1}
                </td>
                <td className="px-6 py-4 border-b border-gray-700 text-center">
                  {data.category}
                </td>
                <td className="px-6 py-4 border-b border-gray-700 text-center">
                  {data.image ? (
                    <img
                      src={`${URI}${data.image}`}
                      alt={data.category}
                      className="h-12 w-12 object-cover rounded-lg mx-auto"
                    />
                  ) : (
                    "No Image"
                  )}
                </td>
                <td className="px-6 py-4 border-b border-gray-700 text-center">
                  {Array.isArray(data.subcategories) &&
                  data.subcategories.length > 0 ? (
                    <ul>
                      {data.subcategories.map((subcategory, subIndex) => (
                        <li key={subIndex} className="mb-2">
                          <span>{subcategory.name}</span>
                          {subcategory.image && (
                            <img
                              src={`${URI}${subcategory.image}`}
                              alt={subcategory.name}
                              className="h-8 w-8 object-cover inline-block ml-2"
                            />
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    "No Subcategories"
                  )}
                </td>
                <td className="px-6 py-4 border-b border-gray-700 text-center">
                  <Button
                    className="bg-green-500 text-white px-4 py-2 rounded-lg mx-2"
                    onClick={() => {
                      setSelectedCategory(data); // Set the selected category for editing
                      setIsEditModalOpen(true); // Open the edit modal
                    }}
                  >
                    Update
                  </Button>
                  <Button
                    className="bg-red-500 text-white px-4 py-2 rounded-lg mx-2"
                    onClick={() => handleDeleteCategory(data._id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveCategory}
      />

      {/* Update Category Modal */}
      {selectedCategory && (
        <UpdateCategoryModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={(updatedData) => {
            handleUpdateCategory(selectedCategory._id, updatedData); // Pass the selected category ID and updated data
            setSelectedCategory(null); // Clear selected category after update
          }}
          category={selectedCategory}
        />
      )}
    </div>
  );
};

export default ManageCategory;
