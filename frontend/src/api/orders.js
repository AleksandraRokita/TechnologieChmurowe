import axios from 'axios';

const ordersApi = axios.create({
  baseURL: import.meta.env.VITE_ORDERS_API_URL || 'http://localhost:3001',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const orderStatuses = [
  'not started',
  'pending',
  'shipped',
  'delivered',
  'cancelled',
];

export async function getOrders() {
  const response = await ordersApi.get('/orders');
  return response.data;
}

export async function createOrder(payload) {
  const response = await ordersApi.post('/orders', payload);
  return response.data;
}

export async function updateOrderStatus(orderId, status) {
  const response = await ordersApi.put(`/orders/${orderId}/status`, { status });
  return response.data;
}
