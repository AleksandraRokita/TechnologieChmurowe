const express = require('express');
const axios = require('axios');
const { requireRole } = require('../middleware/requireAuth');
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3000';

// Eksportujemy funkcję, która przyjmuje 'prisma' jako argument
module.exports = (prisma) => {
    const router = express.Router();

    // ========================================================
    // GET
    // ========================================================

    // Wszystkie zamówienia
    router.get('/', async (req, res) => {
        try {
            const orders = await prisma.order.findMany();
            res.status(200).json(orders);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Wystąpił błąd serwera' });
        }
    });

    // Jedno zamówienie po ID
    router.get('/:id', async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const order = await prisma.order.findUnique({ where: { id } });
            if (!order) return res.status(404).json({ error: 'Nie znaleziono zamówienia' });
            res.status(200).json(order);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Wystąpił błąd serwera' });
        }
    });

    // ========================================================
    // POST
    // ========================================================

    // Tworzenie nowego zamówienia
    router.post('/', async (req, res) => {
        try {
            const { customer_id, items } = req.body;

            // Walidacja: czy klient istnieje
            try {
                console.log(`Sprawdzanie istnienia użytkownika ID ${customer_id}...`);
                await axios.get(`${USER_SERVICE_URL}/users/${customer_id}`, { headers: { Cookie: req.headers.cookie || '' } });
            } catch (err) {
                return res.status(404).json({ error: `Błąd weryfikacji użytkownika o ID ${customer_id}: ${err.message}` });
            }

            let total_value = 0;
            const orderItemsData = [];
            const stockUpdates = [];

            // Walidacja produktów + obliczenie wartości zamówienia
            for (const item of items) {
                let realProduct;
                try {
                    console.log(`Sprawdzanie produktu ID ${item.product_id}...`);
                    const response = await axios.get(`${USER_SERVICE_URL}/products/${item.product_id}`, { headers: { Cookie: req.headers.cookie || '' } });
                    realProduct = response.data;
                } catch (err) {
                    return res.status(404).json({ error: `Błąd weryfikacji produktu o ID ${item.product_id}: ${err.message}` });
                }

                if (item.quantity <= 0) {
                    return res.status(400).json({ error: `Nieprawidłowa ilość dla produktu ID ${item.product_id}. Ilość musi być większa niż 0.` });
                }

                if (realProduct.stock < item.quantity) {
                    return res.status(400).json({
                        error: `Niewystarczający stan magazynowy dla produktu ID ${item.product_id}. Dostępne: ${realProduct.stock}, wymagane: ${item.quantity}`
                    });
                }

                const products_value = realProduct.price * item.quantity;
                total_value += products_value;
                
                orderItemsData.push({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    product_price: realProduct.price,
                    products_value
                });
                
                stockUpdates.push({
                    product_id: item.product_id,
                    new_stock: realProduct.stock - item.quantity,
                });
            }

            // Zapis zamówienia do bazy
            const newOrder = await prisma.order.create({
                data: {
                    customer_id,
                    order_date: new Date(),
                    total_value,
                    order_items: { create: orderItemsData }
                },
                include: { order_items: true }
            });

            // Aktualizacja stanów magazynowych produktów
            for (const update of stockUpdates) {
                try {
                    await axios.put(`${USER_SERVICE_URL}/products/${update.product_id}`, {
                        stock: update.new_stock
                    }, { headers: { Cookie: req.headers.cookie || '' } });
                } catch (err) {
                    console.error(`Ostrzeżenie: Nie udało się odjąć produktu ${update.product_id} z magazynu!`);
                }
            }

            res.status(201).json(newOrder);

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: `Błąd serwera podczas tworzenia zamówienia: ${error.message}` });
        }
    });


    // ========================================================
    // PUT
    // ========================================================
    // Zmiana statusu zamówienia
    // router.put('/:id/status', requireRole(['admin', 'worker']), async (req, res) => {
    router.put('/:id/status', requireRole(['admin', 'worker']), async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const { status } = req.body;
            const validStatuses = ['not started', 'pending', 'shipped', 'delivered', 'cancelled'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ error: 'Nieprawidłowy status zamówienia' });
            }
            const order = await prisma.order.findUnique({ where: { id } });
            if (!order) return res.status(404).json({ error: 'Nie znaleziono zamówienia' });
            const updatedOrder = await prisma.order.update({
                where: { id },
                data: { order_status: status }
            });
            res.json(updatedOrder);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: `Błąd serwera podczas zmiany statusu: ${error.message}` });
        }
    });

    return router;
};

