import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import FacebookIcon from "@mui/icons-material/Facebook";
import GoogleIcon from "@mui/icons-material/Google";
import Register from "./Register";

const Login = ({ setIsLoginModalOpen }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [loginWithOTP, setLoginWithOTP] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("+91");
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState("");
  const URI = import.meta.env.VITE_API_URL;

  // Function to handle sending OTP
  const handleSendOTP = async () => {
    try {
      const response = await axios.post(`${URI}api/user/login`, {
        mobileNumber: phoneNumber.length === 13 ? phoneNumber : null,
        email: usernameOrEmail || null,
      });

      // Store mobile number in local storage if OTP is sent
      if (response.status === 200) {
        if (phoneNumber.length === 13) {
          localStorage.setItem("mobileNumber", phoneNumber);
        }
        setLoginWithOTP(true);
        setUserId(response.data.user._id); // Set user ID for later use
        Swal.fire({
          icon: "success",
          title: "OTP Sent",
          text: response.data.message,
        });
      }
    } catch (error) {
      console.error("Failed to send OTP", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while sending OTP. Please try again.",
      });
    }
  };

  // Function to handle OTP verification
  const handleVerifyOTP = async () => {
    try {
      const response = await axios.post(`${URI}api/user/verifyOtp`, {
        otp,
        mobileNumber: phoneNumber.length === 13 ? phoneNumber : null,
        email: usernameOrEmail || null,
      });

      // Store token in localStorage upon successful verification
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userId", response.data.user._id);
      localStorage.setItem("email", response.data.user.email);

      Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: "You have successfully logged in.",
      });

      // Close modal after successful login
      setIsLoginModalOpen(false);
    } catch (error) {
      console.error("OTP verification failed", error);
      Swal.fire({
        icon: "error",
        title: "OTP Verification Failed",
        text: "Invalid OTP. Please try again.",
      });
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      {!loginWithOTP ? (
        <div className="w-full">
          <input
            type="text"
            placeholder="Email or Mobile Number"
            className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={usernameOrEmail || phoneNumber}
            onChange={(e) => {
              const value = e.target.value;
              if (value.includes('@')) {
                setUsernameOrEmail(value);
                setPhoneNumber("+91");
              } else if (value.length <= 13) {
                setPhoneNumber(value);
                setUsernameOrEmail("");
              }
            }}
          />
          <button
            onClick={handleSendOTP}
            className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
          >
            Send OTP
          </button>
        </div>
      ) : (
        <div className="w-full">
          <input
            type="text"
            placeholder="Enter OTP"
            className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button
            onClick={handleVerifyOTP}
            className="w-full py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300"
          >
            Verify OTP
          </button>
        </div>
      )}
      <div className="flex items-center justify-between w-full mt-4">
        <button
          onClick={() => setIsRegister(true)}
          className="text-blue-500 hover:underline"
        >
          Register
        </button>
        <div className="flex space-x-4">
          <FacebookIcon className="text-blue-600 cursor-pointer hover:text-blue-800" />
          <GoogleIcon className="text-red-600 cursor-pointer hover:text-red-800" />
        </div>
      </div>
      {isRegister && <Register setIsRegister={setIsRegister} />}
    </div>
  );
};

export default Login;
