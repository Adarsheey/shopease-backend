const express = require('express');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Get all products (with search & filter)
router.get('/', async (req, res) => {
  try {
    const { search, category, sort, page = 1, limit = 12 } = req.query;
    const query = {};

    if (search) query.name = { $regex: search, $options: 'i' };
    if (category && category !== 'All') query.category = category;

    let sortOption = {};
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };
    else sortOption = { featured: -1, createdAt: -1 };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ products, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Create product
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Update product
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Delete product
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Seed sample products
router.post('/seed/products', protect, adminOnly, async (req, res) => {
  try {
    const sampleProducts = [
      { name: 'Wireless Headphones', description: 'Premium noise-cancelling wireless headphones with 30hr battery.', price: 2999, category: 'Electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', stock: 50, rating: 4.5, featured: true },
      { name: 'Running Shoes', description: 'Lightweight, breathable running shoes for all terrains.', price: 1499, category: 'Sports', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', stock: 30, rating: 4.3, featured: true },
      { name: 'Leather Backpack', description: 'Genuine leather backpack with laptop compartment.', price: 1999, category: 'Bags', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', stock: 20, rating: 4.7 },
      { name: 'Smart Watch', description: 'Feature-rich smartwatch with health tracking and GPS.', price: 4999, category: 'Electronics', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', stock: 15, rating: 4.6, featured: true },
      { name: 'Yoga Mat', description: 'Non-slip premium yoga mat with alignment lines.', price: 599, category: 'Sports', image: 'https://images.unsplash.com/photo-1601925228869-d4e394bca5a2?w=400', stock: 100, rating: 4.2 },
      { name: 'Coffee Maker', description: 'Programmable drip coffee maker with thermal carafe.', price: 2499, category: 'Kitchen', image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400', stock: 25, rating: 4.4 },
      { name: 'Denim Jacket', description: 'Classic blue denim jacket, timeless style.', price: 1299, category: 'Clothing', image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=400', stock: 40, rating: 4.1 },
      { name: 'Bluetooth Speaker', description: 'Portable waterproof bluetooth speaker with 360° sound.', price: 1799, category: 'Electronics', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400', stock: 35, rating: 4.5, featured: true }
    ];
    await Product.deleteMany({});
    const products = await Product.insertMany(sampleProducts);
    res.json({ message: `${products.length} products seeded`, products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
