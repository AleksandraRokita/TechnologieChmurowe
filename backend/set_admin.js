/* 
=========================================================
INSTRUKCJA UŻYCIA SKRYPTU
=========================================================
Aby nadać uprawnienia administratora, otwórz terminal w 
folderze "backend" i wpisz komendę:

    node set_admin.js

UWAGA: W obecnej formie skrypt nadaje rolę "admin" WSZYSTKIM 
użytkownikom w bazie danych. 

Jeśli w przyszłości będziesz chciała nadać admina tylko 
konkretnej osobie, zakomentuj "updateMany" i odkomentuj 
poniższy kod z "update", podając jej e-mail:
=========================================================
*/

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Opcja 1: Zmiana wszystkich użytkowników na admina
  const result = await prisma.user.updateMany({
    data: { role: 'admin' },
  });
  console.log('Zaktualizowano użytkowników (updateMany):', result);

  /*
  // Opcja 2: Zmiana tylko JEDNEGO użytkownika po adresie e-mail
  // (Odkomentuj to, jeśli chcesz zmienić konkretną osobę)
  const resultSingle = await prisma.user.update({
    where: { email: 'adres.email@gmail.com' },
    data: { role: 'admin' },
  });
  console.log('Nadano admina dla:', resultSingle.email);
  */
}

main().catch(console.error).finally(() => process.exit(0));
