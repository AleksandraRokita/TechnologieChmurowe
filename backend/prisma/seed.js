const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

// 1. Tworzymy pulę połączeń do PostgreSQL (używając Twojego .env)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 2. Tworzymy adapter
const adapter = new PrismaPg(pool);

// 3. Przekazujemy adapter do klienta
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Rozpoczynam pełne seedowanie bazy Backend...');

  // --- 1. SEEDOWANIE UŻYTKOWNIKÓW (Admin + 3 Users) ---
  const usersToSeed = [
    {
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      accountId: 'admin-123'
    },
    {
      name: 'Jan Kowalski',
      email: 'jan.kowalski@example.com',
      role: 'user',
      accountId: 'acc-001'
    },
    {
      name: 'Anna Nowak',
      email: 'anna.nowak@example.com',
      role: 'user',
      accountId: 'acc-002'
    },
    {
      name: 'Piotr Zieliński',
      email: 'piotr.zielinski@example.com',
      role: 'user',
      accountId: 'acc-003'
    }
  ];

  for (const u of usersToSeed) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {}, // Jeśli istnieje, nic nie zmieniaj
      create: {
        name: u.name,
        email: u.email,
        role: u.role,
        accounts: {
          create: {
            accountId: u.accountId,
            providerId: 'credentials',
            password: 'password123', // Pamiętaj o hashowaniu w przyszłości!
          }
        }
      },
    });
    console.log(`Użytkownik gotowy: ${user.email} (rola: ${user.role})`);
  }

  // --- 2. SEEDOWANIE PRODUKTÓW ---
  const products = [
    { name: 'Laptop Pro', price: 4500.00, stock: 10 },
    { name: 'Mysz Bezprzewodowa', price: 120.50, stock: 50 },
    { name: 'Monitor 4K', price: 1899.99, stock: 5 },
    { name: 'Klawiatura Mechaniczna', price: 350.00, stock: 20 },
    { name: 'Słuchawki BT', price: 599.00, stock: 15 }
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { name: p.name },
      update: {},
      create: p,
    });
    console.log(`Produkt gotowy: ${p.name}`);
  }

  console.log('Backend zasilony pomyślnie!');
}

main()
  .catch((e) => {
    console.error('Błąd podczas seedowania:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });