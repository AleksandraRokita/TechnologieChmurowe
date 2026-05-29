const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

let authInstance = null;

async function getAuth() {
  if (authInstance) return authInstance;

  const { betterAuth } = await import('better-auth');
  const { prismaAdapter } = await import('@better-auth/prisma-adapter');
  const { admin } = await import('better-auth/plugins'); // <-- 1. Importujemy plugin

  authInstance = betterAuth({
    database: prismaAdapter(prisma, {
      provider: 'postgresql',
    }),
    socialProviders: {
        google: { 
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }, 
    },
    emailAndPassword: {
      enabled: true,
    },
    
    plugins: [
        admin() 
    ],
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
    trustedOrigins: [process.env.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:5173'].filter(Boolean),
    advanced: {
      defaultCookieAttributes: {
        sameSite: 'none',
        secure: true,
      },
    },
  });

  return authInstance;
}

module.exports = { getAuth };