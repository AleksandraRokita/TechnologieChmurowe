const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/requireAuth');

// ========================================================
// GET
// ========================================================

// Wszystkie produkty
router.get('/', async (req, res) => {
  try {
    const products = await req.prisma.product.findMany();
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Jeden produkt po ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Nieprawidłowy ID produktu' });
    }
    const product = await req.prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ error: 'Nie znaleziono produktu' });
    
    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// ========================================================
// POST
// ========================================================

// Nowy produkt
router.post('/', requireRole(['admin', 'worker']), async (req, res) => {

  const { name, price, stock } = req.body;
  
  if (!name || typeof price !== 'number' || typeof stock !== 'number') {
    return res.status(400).json({ error: 'Nieprawidłowe dane wejściowe' });
  }
  if (price < 0) {
    return res.status(400).json({ error: 'Cena nie może być ujemna' });
  }
  if (stock < 0) {
    return res.status(400).json({ error: 'Stan magazynowy nie może być ujemny' });
  }

  try {
    const newProduct = await req.prisma.product.create({
      data: { name, price, stock }
    });
    res.status(201).json(newProduct);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Produkt o takiej nazwie już istnieje' }); 
    }
    console.error(error);
    res.status(500).json({ error: 'Nie udało się utworzyć produktu' });
  }
});

// ========================================================
// PUT
// ========================================================

// Aktualizacja produktu (zmiana stanu magazynowego)
 router.put('/:id', requireRole(['admin', 'worker']), async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Nieprawidłowy ID produktu' });
  }
  
  const { stock } = req.body;
  if (typeof stock !== 'number') {
    return res.status(400).json({ error: 'Nieprawidłowe dane wejściowe' });
  }
  if (stock < 0) {
    return res.status(400).json({ error: 'Stan magazynowy nie może być ujemny' });
  }
  
  try {
    const updatedProduct = await req.prisma.product.update({
      where: { id },
      data: { stock }
    });
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Nie udało się zaktualizować produktu' });
  }
});

// Aktualizacja produktu (zmiana ceny)
 router.put('/:id/price', requireRole(['admin']), async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Nieprawidłowy ID produktu' });
  }
  
  const { price } = req.body;
  if (typeof price !== 'number') {
    return res.status(400).json({ error: 'Nieprawidłowe dane wejściowe' });
  }
  if (price < 0) {
    return res.status(400).json({ error: 'Cena nie może być ujemna' });
  }

  try {
    const updatedProduct = await req.prisma.product.update({
      where: { id },
      data: { price }
    });
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Nie udało się zaktualizować produktu' });
  }
});

// ========================================================
// DELETE
// ========================================================

// Usuwanie produktu
 router.delete('/:id', requireRole(['admin']), async (req, res) => {

  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Nieprawidłowy ID produktu' });
    }
    
    await req.prisma.product.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Nie znaleziono produktu' });
    }
    console.error(error);
    res.status(500).json({ error: 'Nie udało się usunąć produktu' });
  }
});

module.exports = router;