import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {   
    type: String,
    required: true,
  },
    description: {
        type: String,
        required: false,
    },
    price: {
        type: Number,
        min:0,
        required: true,
    },  
    image: {
        type: String,
        required: [true, "Image is required"],
    },
    category: {
        type: String,
        required: true,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt fields
});

const Product = mongoose.model("Product", productSchema);

export default Product;