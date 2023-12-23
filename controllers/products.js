require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

let addProducts = function (req, res) {
    try {
        const { productName, productDescription } = req.body;
        const query = 'INSERT INTO products (product_name, product_description) VALUES ($1, $2) RETURNING *';
        const values = [productName, productDescription];
    } catch (error) {
        
    }
}

let addToCart = async (req, res) => {
    try {
      const { userId, productId, quantity, cartId } = req.body;
        console.log("UserId: ", userId, " ProductId: ", productId, " quantity: ", quantity);
      // Check if the user and product exist
      const userResult = await pool.query('SELECT * FROM Users WHERE user_id = $1', [userId]);
      const productResult = await pool.query('SELECT * FROM Products WHERE id = $1', [productId]);
      console.log(userResult, " Product Result::: ", productResult);
  
      if (userResult.rows.length === 0 || productResult.rows.length === 0) {
        return res.status(404).json({ message: 'User or product not found' });
      }

      const cartItem = await pool.query('SELECT * FROM CartItems WHERE cart_id = $1 AND product_id = $2', [cartId, productId]);

      console.log("Cart Item:::: ", cartItem);

      if(cartItem.rows.length > 0){
          console.log("Inside the update cart::: ");
        await pool.query('UPDATE CartItems SET quantity = $1 WHERE cart_id = $2 AND product_id = $3', [quantity, cartId, productId]);
      } else {
        await pool.query(
            'INSERT INTO CartItems (cart_id, product_id, quantity) VALUES ($1, $2, $3)',
            [cartId, productId, quantity]
          );
      }

      res.json({ message: 'Product added to the cart successfully' });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

let getProducts = async (req, res) => {
    try {
        console.log("Inside the get Products:::: ");
        const result = await pool.query('SELECT * FROM products');
        res.json(result.rows);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
}

let getCategories = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Categories');
        res.json(result.rows);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
}

let deleteProductFromCart = async (req, res) => {
    try {
        let cartItemId = req.params.cartItemId;
        await client.query('DELETE FROM cart_items WHERE id = $1', [cartItemId]);
        res.json({ message: 'Cart item deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    getProducts, addProducts, addToCart, getCategories, deleteProductFromCart
}