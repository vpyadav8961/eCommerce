const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const {verifyToken} = require('../middleware/auth');
const {getProducts, addToCart, getCategories, deleteProductFromCart, addProducts, getCartItems} = require('../controllers/products');

const users = [
  { id: 1, username: 'user1', password: 'hashed1', email: 'user1@techmahindra.com' },
  { id: 2, username: 'user2', password: 'hashed2', email: 'user2@techmahindra.com' },
];

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log(username, password);
    const user = users.find(u => u.username === username && u.password === password);
  
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  
    // Generate JWT token
    const token = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_TOKEN_KEY, { expiresIn: '1h' });
  
    res.json({ token });
  });
  
router.get('/products', getProducts);
router.post('/add-products', addProducts);
router.get('/cartItems/:userId', getCartItems);
router.get('/categories', getCategories)
router.post('/add-to-cart', addToCart);
router.delete('/cartItems/:cartItemId', deleteProductFromCart);


module.exports = router;