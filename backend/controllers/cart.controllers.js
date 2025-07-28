
import Product from "../models/product.model.js";

export const getCartProducts = async (req, res) => {
  try {
    // ✅ Fallback if cartItems is undefined
    const cartItems = Array.isArray(req.user.cartItems) ? req.user.cartItems : [];

    const productIds = cartItems.map((item) => item.id);
    const products = await Product.find({ _id: { $in: productIds } });

    const responseItems = products.map((product) => {
      const item = cartItems.find(
        (cartItem) => cartItem.id.toString() === product._id.toString()
      );
      return { ...product.toJSON(), quantity: item?.quantity || 1 };
    });

    res.json(responseItems);
  } catch (error) {
    console.log("Error in getCartProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    // ✅ Safeguard against undefined cartItems
    if (!Array.isArray(user.cartItems)) {
      user.cartItems = [];
    }

    // ✅ Check if product already exists in cart
    const existingItem = user.cartItems.find(
      (item) => item.id.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      // ✅ Push new item as object with id and quantity
      user.cartItems.push({ id: productId, quantity: 1 });
    }

    await user.save();
    res.json(user.cartItems);
  } catch (error) {
    console.log("Error in addToCart controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const removeAllFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

	console.log("Current cartItems:", user.cartItems);

    if (!Array.isArray(user.cartItems)) {
      user.cartItems = [];
    }

    if (!productId) {
      user.cartItems = [];
    } else {
      user.cartItems = user.cartItems.filter(
        (item) => item.id.toString() !== productId
      );
    }

    await user.save();
    res.json(user.cartItems);
  } catch (error) {
    console.log("Error in removeAllFromCart controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const updateQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { quantity } = req.body;
    const user = req.user;

	console.log("Current cartItems:", user.cartItems);

    // Ensure cartItems is always an array
    if (!Array.isArray(user.cartItems)) {
      user.cartItems = [];
    }

    const existingItem = user.cartItems.find(
      (item) => item.id.toString() === productId
    );

    if (existingItem) {
      if (quantity === 0) {
        user.cartItems = user.cartItems.filter(
          (item) => item.id.toString() !== productId
        );
      } else {
        existingItem.quantity = quantity;
      }
      await user.save();
      res.json(user.cartItems);
    } else {
      res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (error) {
    console.log("Error in updateQuantity controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

