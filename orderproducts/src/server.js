// --------------------------------------------
// ORDERPRODUCTS - Serwer Express + Prisma
// --------------------------------------------
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { getAuth } = require('./auth');

// Konfiguracja połączenia z bazą
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const port = process.env.PORT || 3001;
const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://127.0.0.1:5500', 'http://localhost:5500'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['set-cookie']
}));

app.use(express.json());

app.all('/api/auth/*splat', async (req, res) => {
    const auth = await getAuth();
    const { toNodeHandler } = await import('better-auth/node');
    return toNodeHandler(auth)(req, res);
});

// ======================================================================================================
// ENDPOINTY BAZOWE
// ======================================================================================================

// Health check
app.get('/', (req, res) => {
    res.sendStatus(200);
});

// ======================================================================================================
// ROUTERY
// ======================================================================================================

// Importujemy routery i przekazujemy instancję 'prisma'
const ordersRouter = require('./routes/orders')(prisma);
const orderProductsRouter = require('./routes/orderProducts')(prisma);

// Podpinamy routery pod odpowiednie ścieżki
app.use('/orders', ordersRouter);
app.use('/order-products', orderProductsRouter);

// ======================================================================================================

app.listen(port, () => {
    console.log(`Serwer działa na porcie ${port}`);
});