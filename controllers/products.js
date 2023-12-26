require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

let addProducts = async function (req, res) {
    try {
        console.log("Inside the addProducts:: ");
        const { productName, productDescription, price, product_url } = req.body;
        const query = 'INSERT INTO products (product_name, product_description, price, product_url) VALUES ($1, $2, $3, $4) RETURNING *';
        const values = [productName, productDescription, price, product_url];
        let id = await pool.query(query, values);
        res.status(200).json({message: "Inserted data in products table", productId: id});
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

let addToCart = async (req, res) => {
    try {
      const { userId, productId, quantity } = req.body;
      console.log("Request Body::: ", req.body);
        console.log("UserId: ", userId, " ProductId: ", productId, " quantity: ", quantity);
      // Check if the user and product exist
      const userResult = await pool.query('SELECT * FROM Users WHERE user_id = $1', [userId]);
      const productResult = await pool.query('SELECT * FROM Products WHERE id = $1', [productId]);
      console.log(userResult.rows, " Product Result::: ", productResult.rows);

      const cartResult = await pool.query('SELECT * FROM Cart WHERE user_id = $1', [userId]);
  
      if (userResult.rows.length === 0 || productResult.rows.length === 0) {
        return res.status(200).json({ message: 'User or product not found' });
      }

      let cart_id;
      if(cartResult.rows.length > 0){
        cart_id = cartResult.rows[0].cart_id;
      } else {
        const cartRes = await pool.query('INSERT INTO Cart (user_id) VALUES ($1) RETURNING cart_id;', [userId]);
        cart_id = cartRes.rows[0].cart_id;
      }

      const cartItem = await pool.query('SELECT * FROM CartItems WHERE cart_id = $1 AND product_id = $2', [cart_id, productId]);

      if(cartItem.rows.length > 0){
        await pool.query('UPDATE CartItems SET quantity = $1 WHERE cart_id = $2 AND product_id = $3', [quantity, cart_id, productId]);
      } else {
        await pool.query(
            'INSERT INTO CartItems (cart_id, product_id, quantity) VALUES ($1, $2, $3)',
            [cart_id, productId, quantity]
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
        await pool.query('DELETE FROM cartitems WHERE cart_item_id = $1', [cartItemId]);
        res.json({ message: 'Cart item deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

let getCartItems = async (req, res) => {
    try {
        let {userId} = req.params;
        let cartDetails = 'SELECT products.*, cartitems.quantity FROM users JOIN cart ON users.user_id  = cart.user_id JOIN cartitems ON cart.cart_id = cartitems.cart_id JOIN products ON cartitems.product_id = products.id WHERE users.user_id  = $1;';
        let cartRes = await pool.query(cartDetails, [userId]);
        console.log(cartRes.rows);
        res.status(200).json({status: "success", data: cartRes.rows})
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    getProducts, addProducts, addToCart, getCategories, deleteProductFromCart, getCartItems
}