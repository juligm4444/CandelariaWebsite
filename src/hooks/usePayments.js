import { useState } from 'react';
import { paymentsAPI } from '../services/api';

export const usePayments = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const createPayment = async ({ amount, currency = 'cop', type }) => {
    setLoading(true);
    setError('');
    try {
      const response = await paymentsAPI.createPayment({ amount, currency, type });
      return { success: true, data: response.data };
    } catch (err) {
      const message = err?.response?.data?.error || 'Could not create payment.';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createPayment,
  };
};

export default usePayments;
