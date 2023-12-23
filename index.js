const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const { Pool } = require('pg');
const productsRoute = require('./routes/routes');
const cors = require('cors'); 

const app = express();
const port = process.env.PORT || 3003;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

app.use(cors());
app.use(bodyParser.json());

app.use('/api/v1', productsRoute);

// Endpoint to add a product
app.post('/api/products', async (req, res) => {
    console.log("Inside the API products:: ");
  const { productName, productDescription } = req.body;
  const query = 'INSERT INTO products (product_name, product_description) VALUES ($1, $2) RETURNING *';
  const values = [productName, productDescription];

  try {
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get all products
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to delete a product
app.delete('/api/products/:id', async (req, res) => {
  const productId = req.params.id;

  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [productId]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
