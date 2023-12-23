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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
