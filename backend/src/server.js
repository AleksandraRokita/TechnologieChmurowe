require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { getAuth } = require('./auth');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const productsRouter = require('./routes/products');
const usersRouter = require('./routes/users');

const port = process.env.PORT || 3000;
const app = express();

// Konfiguracja połączenia z bazą
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Middleware do przekazania prisma do routerów
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

app.use(cors({
  origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL, 'http://localhost:5173'] : ['http://localhost:5173', 'http://127.0.0.1:5500', 'http://localhost:5500'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie']
}));

app.use(express.json({ limit: '10kb' }));


// Obsługa autoryzacji
app.all('/api/auth/*splat', async (req, res) => {
  const auth = await getAuth();
  const { toNodeHandler } = await import('better-auth/node');
  return toNodeHandler(auth)(req, res);
});

// Health check
app.get('/', (req, res) => {
  res.sendStatus(200);
});

// ========================================================
// PODPIĘCIE ROUTERÓW
// ========================================================
app.use('/products', productsRouter); 
app.use('/users', usersRouter);       

// ========================================================
// PROXY DO MIKROSERWISU ZAMÓWIEŃ (API GATEWAY)
// ========================================================
const axios = require('axios');
const ORDERS_SERVICE_URL = process.env.ORDERS_SERVICE_URL || 'http://localhost:3001';

app.use('/orders', async (req, res) => {
  try {
      const url = `${ORDERS_SERVICE_URL}/orders${req.url}`;
      const response = await axios({
          method: req.method,
          url: url,
          data: req.method !== 'GET' ? req.body : undefined,
          headers: {
              cookie: req.headers.cookie || '',
              'Content-Type': 'application/json'
          }
      });
      res.status(response.status).json(response.data);
  } catch (error) {
      if (error.response) {
          res.status(error.response.status).json(error.response.data);
      } else {
          console.error('Proxy Error:', error.message);
          res.status(500).json({ error: `Błąd komunikacji z mikroserwisem zamówień: ${error.message}` });
      }
  }
});

app.listen(port, () => {
  console.log(`Serwer działa na porcie ${port}`);
});