import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import type { GatewayDashboardData, CartHistoryPayload } from '../shared';

// Determine API_BASE_URL (duplicating what's in api.ts to avoid circular deps if any, or just import it)
// For simplicity, we'll hardcode or use relative path since we run on vite proxy or fixed port.
const API_BASE_URL = "http://localhost:5000/api";

interface GatewayContextType {
  data: GatewayDashboardData | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredHistory: CartHistoryPayload[];
  refreshDashboard: (token?: string) => Promise<void>;
}

const GatewayContext = createContext<GatewayContextType | undefined>(undefined);

export const GatewayProvider = ({ children, token }: { children: ReactNode, token: string }) => {
  const [data, setData] = useState<GatewayDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const refreshDashboard = async (overrideToken?: string) => {
    try {
      const activeToken = overrideToken || token;
      const res = await fetch(`${API_BASE_URL}/gateway/dashboard`, {
        headers: activeToken ? { 'Authorization': `Bearer ${activeToken}` } : undefined
      });
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      const payload = await res.json();
      setData(payload);
    } catch (err) {
      console.error('Error refreshing dashboard:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only refresh if token is present or we intentionally want to fetch without auth for demo
    refreshDashboard();
  }, [token]);

  // Compute filtered history based on debounced search query
  const filteredHistory = useMemo(() => {
    if (!data) return [];
    if (!debouncedQuery.trim()) return data.history;

    const lowerQuery = debouncedQuery.toLowerCase().trim();
    return data.history.filter(log => {
      // Try parsing JSON if they pasted the QR string manually
      let actualQuery = lowerQuery;
      try {
        const parsed = JSON.parse(debouncedQuery);
        if (parsed.invoiceId) {
          actualQuery = parsed.invoiceId.toLowerCase();
        }
      } catch (e) {}

      return (
        log.cartId.toLowerCase().includes(actualQuery) ||
        log.invoiceCode.toLowerCase().includes(actualQuery) ||
        log.customerPhone.toLowerCase().includes(actualQuery)
      );
    });
  }, [data, debouncedQuery]);

  return (
    <GatewayContext.Provider value={{
      data,
      loading,
      error,
      searchQuery,
      setSearchQuery,
      filteredHistory,
      refreshDashboard
    }}>
      {children}
    </GatewayContext.Provider>
  );
};

export const useGateway = () => {
  const context = useContext(GatewayContext);
  if (context === undefined) {
    throw new Error('useGateway must be used within a GatewayProvider');
  }
  return context;
};
