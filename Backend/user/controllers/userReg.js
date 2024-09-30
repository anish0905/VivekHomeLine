// controllers/authController.js
const User = require("../models/User");
const nodemailer = require("nodemailer");
const twilio = require("twilio")
const jwt = require("jsonwebtoken")

const generateOTP = (length) => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a random 6-digit number
};

const sendOtp = async (mobileNumber) => {
  try {
    const verification = await client.verify
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({ to: mobileNumber, channel: "sms" });
    console.log(`OTP sent to ${mobileNumber}. SID: ${verification.sid}`);
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw new Error("Failed to send OTP. Please verify the phone number.");
  }
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const client = new twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);


exports.register = async (req, res) => {
  try {
    const { email, password, name, mobile } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: "All fields are mandatory" });
    }

    let user = await User.findOne({ email });

    if (user) {
      if (!user.isVerified) {
        user.generateOtp();
        await user.save();

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: "Verify your email",
          text: `Your OTP is ${user.otp}`,
        };

        transporter.sendMail(mailOptions, (error) => {
          if (error) return res.status(500).send(error.toString());
          return res.status(200).send("OTP resent to your email");
        });
      } else {
        return res.status(400).send("User already exists and is verified");
      }
    } else {
      user = new User({ email, password, name, mobile });
      user.generateOtp();
      await user.save();

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Verify your email",
        text: `Your OTP is ${user.otp}`,
      };

      transporter.sendMail(mailOptions, (error) => {
        if (error) return res.status(500).send(error.toString());
        res.status(200).send("OTP sent to your email for verification");
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "An error occurred during registration",
      error: error.message,
    });
  }
};


exports.verifyOtp = async (req, res) => {
  const { phoneNumber, otp } = req.body;
  try {
      const verificationCheck = await client.verify.services(config.twilio.verifyServiceSid)
          .verificationChecks
          .create({ to: phoneNumber, code: otp });

      if (verificationCheck.status === "approved") {
          await User.updateOne({ phoneNumber }, { isVerified: true });
          res.status(200).json({ message: "OTP verified successfully." });
      } else {
          res.status(400).json({ message: "Invalid OTP." });
      }
  } catch (error) {
      res.status(500).json({ message: "Error verifying OTP", error });
  }
};




exports.resendOtp = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).send("User not found");

  user.generateOtp();
  await user.save();

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Verify your email",
    text: `Your OTP is ${user.otp}`,
  };

  transporter.sendMail(mailOptions, (error) => {
    if (error) return res.status(500).send(error.toString());
    res.status(200).send("OTP resent to your email");
  });
};


// Function to generate a 6-digit OTP


// Login
exports.login = async (req, res) => {
  const { phoneNumber, password } = req.body;
  try {
      const user = await User.findOne({ phoneNumber });
      if (!user || !(await bcrypt.compare(password, user.password))) {
          return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!user.isVerified) {
          return res.status(403).json({ message: "User not verified." });
      }

      const token = jwt.sign({ id: user._id }, config.jwtSecret, { expiresIn: '1h' });
      res.status(200).json({ token });
  } catch (error) {
      res.status(500).json({ message: "Error logging in", error });
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