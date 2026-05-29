# Instrukcja uruchomienia projektu

### 1. Klonowanie repozytorium
Skopiuj repozytorium na swój komputer:
```bash
git clone https://github.com/AleksandraRokita/Enterprise-Resource-Planning
```

### 2. Weryfikacja środowiska
Upewnij się, że masz zainstalowane wymagane narzędzia:
- Node.js
- npm

Sprawdź wersje:
```bash
node -v
npm -v
```

### 3. Uruchomienie Dockera
Upewnij się, że aplikacja Docker Desktop jest uruchomiona, a następnie wykonaj:
```bash
docker compose up -d
```

### 4. Konfiguracja pliku środowiskowego
Utwórz plik `.env` na podstawie przykładowego pliku:
```bash
copy .env.example .env
```

W pliku `.env` uzupełnij dane logowania (login i hasło)

### 5. Instalacja i konfiguracja backendu oraz orderproducts
Przejdź do każdego z folderów (`backend` oraz `orderproducts`) i wykonaj poniższe komendy:
```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### 6. Instalacja frontendu
Przejdź do folderu `frontend` i zainstaluj zależności:
```bash
npm install
```

---

# Project Setup Instructions

### 1. Clone the repository
Clone the repository to your local machine:
```bash
git clone https://github.com/AleksandraRokita/Enterprise-Resource-Planning
```

### 2. Verify environment
Make sure you have the required tools installed:
- Node.js
- npm

Check their versions:
```bash
node -v
npm -v
```

### 3. Start Docker
Ensure that Docker Desktop is running, then execute:
```bash
docker compose up -d
```

### 4. Configure environment file
Create a `.env` file based on the example:
```bash
copy .env.example .env
```

Fill in the login and password fields in the `.env` file

### 5. Setup backend and orderproducts
Navigate to each directory (`backend` and `orderproducts`) and run:
```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### 6. Setup frontend
Navigate to the `frontend` directory and install dependencies:
```bash
npm install
```

# Cheatsheet

## Prisma

### Inicjalizacja i instalacja

Inicjowanie Prismy w projekcie:
```bash
npx prisma init
```

Instalacja wymaganych bibliotek:
```bash
npm install express prisma @prisma/client dotenv
```

### Migracje

Pobranie migracji (wspólna baza danych):
```bash
npx prisma migrate deploy
```

Generowanie tabel — w folderze `backend`:
```bash
npx prisma migrate dev --name init_main
```

Generowanie tabel — w folderze `orderproducts`:
```bash
npx prisma migrate dev --name init_orders
```

### Aktualizacja bazy danych 
1. Zatrzymanie serwerów
2. Czyszczenie bazy 
```
npx prisma migrate reset
```
3. Aktualizacja prisma schema
4. Nowa migracja
```
npx prisma migrate dev --name nazwa
```
### Seedowanie bazy danych 
```
npx prisma db seed
```
### Narzędzia

Widok bazy danych w przeglądarce:
```bash
npx prisma studio
```

---

## Rozwiązywanie błędów (Errors)

### `Cannot find module 'axios'`
```bash
npm install axios
```

### `Cannot find module '.prisma/client/default'`
```bash
npx prisma generate
```

### `Cannot find module '@prisma/adapter-pg'`
```bash
npm install @prisma/adapter-pg
```
"# TechnologieChmurowe" 
