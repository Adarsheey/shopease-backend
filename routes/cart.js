const express = require('express');
const router = express.Router();
// Cart is managed client-side in localStorage for simplicity
// This route can be extended for server-side cart if needed
router.get('/health', (req, res) => res.json({ message: 'Cart API ready' }));
module.exports = router;
