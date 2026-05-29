import { useState, useEffect } from 'react';
import axios from 'axios';

function Users() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:3000/users', {
          withCredentials: true
        });
        setUsers(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Błąd ładowania:", err);
        setError(err.response?.data?.error || "Błąd pobierania danych");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <p>Ładowanie...</p>;
  if (error) return <div style={{ color: 'red', fontWeight: 'bold' }}>Błąd: {error}</div>;

  return (
    <div>
      <h2>Lista użytkowników</h2>
      <ul>
        {users.length > 0 ? (
          users.map((user) => (
            <li key={user.id}>
              {user.email} - <strong>Rola: {user.role}</strong>
            </li>
          ))
        ) : (
          <p>Brak użytkowników.</p>
        )}
      </ul>
    </div>
  );
}

export default Users;