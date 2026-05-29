const { getAuth } = require('../auth');

// Middleware sprawdzający, czy użytkownik ma odpowiednią rolę
const requireRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      // 1. Pobieramy instancję autoryzacji (czekamy na nią, bo używasz importów dynamicznych)
      const auth = await getAuth();

      // 2. Pobieramy sesję z better-auth na podstawie nagłówków zapytania
      const session = await auth.api.getSession({
        headers: req.headers
      });

      // 3. Jeśli nie ma sesji -> użytkownik nie jest zalogowany
      if (!session || !session.user) {
        return res.status(401).json({ message: "Brak autoryzacji. Zaloguj się." });
      }

      // 4. Jeśli użytkownik jest zalogowany, ale jego rola nie znajduje się na liście dozwolonych
      if (!allowedRoles.includes(session.user.role)) {
        return res.status(403).json({ 
          message: "Odmowa dostępu. Nie masz uprawnień do tego zasobu.",
          yourRole: session.user.role
        });
      }

      // 5. Wszystko się zgadza! Dodajemy dane użytkownika do obiektu `req`, 
      // żeby mieć do nich łatwy dostęp w samym endpoincie
      req.user = session.user;
      
      // Przechodzimy dalej do właściwej logiki endpointu
      next();
      
    } catch (error) {
      console.error("Błąd w middleware requireRole:", error);
      res.status(500).json({ message: "Wewnętrzny błąd serwera podczas autoryzacji." });
    }
  };
};

module.exports = { requireRole };