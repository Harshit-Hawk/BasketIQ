import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import connectDB from '../config/db.js';

dotenv.config();

const products = [
  {
    name: 'Organic Fresh Bananas',
    category: 'Fruits',
    price: 2.99,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&auto=format&fit=crop&q=80',
    description: 'Sweet organic bananas sourced from eco-friendly sustainable farms. Excellent source of potassium.',
  },
  {
    name: 'Fresh Red Strawberries',
    category: 'Fruits',
    price: 4.49,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800&auto=format&fit=crop&q=80',
    description: 'Delicious juicy red strawberries, freshly hand-picked from organic fields.',
  },
  {
    name: 'Whole Wheat Bread',
    category: 'Bakery',
    price: 3.29,
    stock: 20,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
    description: 'Freshly baked 100% whole wheat bread loaf. Rich in fiber and grains.',
  },
  {
    name: 'Fresh Organic Broccoli',
    category: 'Vegetables',
    price: 1.99,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=800&auto=format&fit=crop&q=80',
    description: 'Crisp green organic broccoli heads rich in vitamins C and K.',
  },
  {
    name: 'Organic Whole Milk',
    category: 'Dairy',
    price: 3.89,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800&auto=format&fit=crop&q=80',
    description: 'Fresh organic whole pasteurized milk from grass-fed cows.',
  },
  {
    name: 'Fresh Potato Chips',
    category: 'Snacks',
    price: 2.49,
    stock: 60,
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d20?w=800&auto=format&fit=crop&q=80',
    description: 'Crispy salted potato chips perfect for snacking.',
  },
];

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing collections
    await Product.deleteMany();
    await Order.deleteMany();
    await Cart.deleteMany();
    console.log('Existing products, orders, and carts cleared.');

    // Seed products
    const seededProducts = await Product.insertMany(products);
    console.log(`${seededProducts.length} Products seeded successfully!`);

    // Let's link relatedProducts mapping for AI recommendations
    // e.g. Bread -> Milk (or Bananas -> Strawberries)
    const bananas = seededProducts.find(p => p.name.includes('Bananas'));
    const milk = seededProducts.find(p => p.name.includes('Milk'));
    const bread = seededProducts.find(p => p.name.includes('Bread'));
    const strawberries = seededProducts.find(p => p.name.includes('Strawberries'));

    if (bread && milk && bananas && strawberries) {
      bread.relatedProducts = [milk._id, bananas._id];
      bananas.relatedProducts = [strawberries._id, milk._id];
      await Promise.all([bread.save(), bananas.save()]);
      console.log('Related products mapping configured.');
    }

    process.exit(0);
  } catch (error) {
    console.error(`Seeding error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
