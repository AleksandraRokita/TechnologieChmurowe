const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/requireAuth');

// ========================================================
// GET
// ========================================================

// Wszyscy użytkownicy
 router.get('/', requireRole(['admin', 'worker']), async (req, res) => {

  try {
    const users = await req.prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Wystąpił błąd serwera' });
  }
});

// Jeden użytkownik po ID
 router.get('/:id', requireRole(['admin', 'worker']), async (req, res) => {

  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Nieprawidłowy ID użytkownika' });
    }
    const user = await req.prisma.user.findFirst({ where: { account_id: id } });
    if (!user) return res.status(404).json({ error: 'Nie znaleziono użytkownika' });
    
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// ========================================================
// PUT
// ========================================================

// Zamiana roli użytkownika 
router.put('/change/:id/userrole', requireRole(['admin']), async(req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Nieprawidłowy ID użytkownika' });
  }
  
  const { role } = req.body;
  const validRoles = ['admin', 'worker', 'user'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Nieprawidłowa rola użytkownika' });
  }

  try {
    const user = await req.prisma.user.findFirst({ where: { account_id: id } });
    if (!user) return res.status(404).json({ error: 'Nie znaleziono użytkownika' });

    const updateUser = await req.prisma.user.update({
      where: { id: user.id },
      data: { role }
    });
    res.status(200).json(updateUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Nie udało się zaktualizować uprawnień użytkownika' });
  }
});

module.exports = router;