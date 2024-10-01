// controllers/authController.js
const User = require("../models/User");
const twilio = require("twilio")
const jwt = require("jsonwebtoken")
const otpGenerator = require('otp-generator');



const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const twilioClient = new twilio(accountSid, authToken);


// Login
exports.login = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    // Check if phoneNumber exists in the request
    if (!phoneNumber) {
        return res.status(400).json({
            success: false,
            msg: "Phone number is required."
        });
    }

    console.log(`Sending OTP to: ${phoneNumber}`);

    // Generate a 6-digit OTP without alphabets or special characters
    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
    const cDate = new Date();

    // Save OTP and expiration date to the database (set expiration to 5 minutes)
    await User.findOneAndUpdate(
        { phoneNumber },
        { otp, otpExpiration: new Date(cDate.getTime() + 5 * 60 * 1000) },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Send OTP via Twilio and wait for the response
    await twilioClient.messages.create({
        body: `Welcome to HomeLine. Your OTP is: ${otp}`,
        to: phoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER
    });

    return res.status(200).json({
        success: true,
        msg: "OTP sent successfully",
        
    });

} catch (error) {
    console.error(`Error sending OTP: ${error.message}`);
    return res.status(400).json({
        success: false,
        msg: error.message
    });
}
};

exports.verifyOtp = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    // Check if phoneNumber and OTP exist in the request
    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        msg: "Mobile number and OTP are required."
      });
    }

    // Find the user by mobile number
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found."
      });
    }

    // Check if the OTP matches and if it has not expired
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        msg: "Invalid OTP."
      });
    }

    // Check for OTP expiration
    if (user.otpExpiration < Date.now()) {
      return res.status(400).json({
        success: false,
        msg: "OTP has expired. Please request a new one."
      });
    }

    // OTP is valid, mark user as verified
    user.isVerified = true;
    user.otp = null; // Optionally clear OTP after verification
    user.otpExpiration = null; // Optionally clear expiration
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { _id: user._id, phoneNumber: user.phoneNumber },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Set token expiration time as needed
    );

    return res.status(200).json({
      success: true,
      msg: "OTP verified successfully. User is now verified.",
      token,
      user // Send the token in the response
    });
  } catch (error) {
    console.error(`Error verifying OTP: ${error.message}`);
    return res.status(500).json({
      success: false,
      msg: "Server error. Please try again later."
    });
  }
};


exports.addItemToCart = async (req, res) => {
  const {
    VendorUser,
    userId,
    productId,
    productName,
    quantity,
    price,
    attributes,
    promotionCode,
    discountPercentage,
    image,
  } = req.body;

  try {
    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingItemIndex = user.cart.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingItemIndex !== -1) {
      user.cart[existingItemIndex].quantity += quantity;
      user.cart[existingItemIndex].price += price;
    } else {
      user.cart.push({
        VendorUser,
        productId,
        productName,
        quantity,
        price,
        attributes,
        promotionCode,
        discountPercentage,
        image,
      });
    }

    user.totalPrice = user.cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    user = await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error adding item to cart", error });
  }
};

exports.removeItemFromCart = async (req, res) => {
  const { userId, productId } = req.params;

  console.log("Removing item from cart", userId, productId);

  try {
    // Step 1: Remove the item from the cart using $pull
    const user = await User.findOneAndUpdate(
      { _id: userId },
      { $pull: { cart: { productId: productId } } }, // Match and remove the item by productId
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Step 2: Use the aggregation pipeline to recalculate the total price after removal
    const updatedUser = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } }, // Correct use of ObjectId
      {
        $addFields: {
          totalPrice: {
            $sum: {
              $map: {
                input: "$cart",
                as: "item",
                in: { $multiply: ["$$item.price", "$$item.quantity"] }
              }
            }
          }
        }
      }
    ]);

    // Step 3: Check if the user still exists after aggregation
    if (updatedUser.length === 0) {
      return res.status(404).json({ message: "User not found after item removal" });
    }

    // Send back the updated user with the recalculated total price
    res.status(200).json({ message: "Item removed and total price recalculated", user: updatedUser[0] });
  } catch (error) {
    console.error("Error removing item from cart", error);
    res.status(500).json({ message: "Error removing item from cart", error });
  }
};

exports.addProductQuantity = async (req, res) => {
  const { userId, productId } = req.body;

  try {
    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const productIndex = user.cart.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (productIndex !== -1) {
      user.cart[productIndex].quantity += 1;
    } else {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    await user.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error updating product quantity", error });
  }
};

exports.subProductQuantity = async (req, res) => {
  const { userId, productId } = req.body;

  try {
    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const productIndex = user.cart.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (productIndex !== -1) {
      user.cart[productIndex].quantity -= 1;

      if (user.cart[productIndex].quantity === 0) {
        user.cart.splice(productIndex, 1);
      }
    } else {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    await user.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error updating product quantity", error });
  }
};

exports.getCartByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.cart);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart", error });
  }
};

exports.updateCart = async (req, res) => {
  const { userId, cartItems, promotionCode, totalPrice } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { cart: cartItems, promotionCode, totalPrice },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.totalPrice = user.cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    await user.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error updating cart", error });
  }
};

exports.getTotalQuantity = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const totalQuantity = user.cart.reduce(
      (total, item) => total + item.quantity,
      0
    );

    res.status(200).json({ totalQuantity });
  } catch (error) {
    res.status(500).json({ message: "Error getting total quantity", error });
  }
};

exports.deleteCartByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    // Find the user by userId and delete the cart
    const user = await User.findByIdAndUpdate(userId, {
      cart: [],
      totalPrice: 0,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Cart deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting cart", error });
  }
};