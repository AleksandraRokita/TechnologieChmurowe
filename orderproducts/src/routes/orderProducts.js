const express = require('express');
const { requireRole } = require('../middleware/requireAuth');

// Eksportujemy funkcję, która przyjmuje 'prisma' jako argument
module.exports = (prisma) => {
    const router = express.Router();

    // ========================================================
    // GET
    // ========================================================

    // Wszystkie pozycje zamówień
    router.get('/', requireRole(['admin', 'worker']), async (req, res) => {
        try {
            const orderProducts = await prisma.orderProduct.findMany();
            res.status(200).json(orderProducts);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Wystąpił błąd serwera' });
        }
    });

    // Historia sprzedaży produktu
    router.get('/product/:product_id', requireRole(['admin', 'worker']),async (req, res) => {
        try {
            const id = parseInt(req.params.product_id);
            const orderProduct = await prisma.orderProduct.findMany({ where: { product_id: id } });
            if (orderProduct.length === 0) return res.status(404).json({ error: 'Nie znaleziono rekordów dla tego produktu' });
            res.status(200).json(orderProduct);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Wystąpił błąd serwera' });
        }
    });

    // Zakupy konkretnego klienta
    router.get('/customer/:customer_id', requireRole(['admin', 'worker']),async (req, res) => {
        try {
            const id = parseInt(req.params.customer_id);
            const orderProducts = await prisma.orderProduct.findMany({
                where: { order: { customer_id: id } },
            });
            if (orderProducts.length === 0) return res.status(404).json({ error: 'Nie znaleziono rekordów dla tego użytkownika' });
            res.status(200).json(orderProducts);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Wystąpił błąd serwera' });
        }
    });

    // Pozycje konkretnego zamówienia (umieszczone na końcu, żeby nie kolidować z innymi ścieżkami)
    router.get('/:order_id', requireRole(['admin', 'worker']),async (req, res) => {
        try {
            const id = parseInt(req.params.order_id);
            const orderProduct = await prisma.orderProduct.findMany({ where: { order_id: id } });
            if (orderProduct.length === 0) return res.status(404).json({ error: 'Nie znaleziono rekordów dla tego zamówienia' });
            res.status(200).json(orderProduct);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Wystąpił błąd serwera' });
        }
    });

    return router;
};