'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Farmer, farmers as fallbackFarmers } from '@/lib/mock-data';
import { apiClient } from '@/lib/api-client';

export type LoginMethod = 'mobile' | 'aadhaar' | 'farmerId';

export interface RegistrationData {
  name?: string;
  village?: string;
  district?: string;
  state?: string;
  aadhaarLast4?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: Farmer | null;
  loginMethod: LoginMethod | null;
  token: string | null;
  sendOtp: (identifier: string, method?: LoginMethod) => Promise<{ success: boolean; simulatedOtp?: string; message?: string }>;
  verifyOtp: (identifier: string, method: LoginMethod, otp: string, registrationData?: RegistrationData) => Promise<{ success: boolean; message?: string; isNewFarmer?: boolean }>;
  devLogin: (uid?: string) => Promise<boolean>;
  login: (credentials: { identifier: string; method: LoginMethod; otp?: string; name?: string; village?: string; district?: string }) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'mandi_mitra_auth_farmer';
const TOKEN_STORAGE_KEY = 'mandi_mitra_token';

// Helper to ensure database snake_case fields map seamlessly to frontend camelCase
function normalizeFarmer(raw: any): Farmer {
  if (!raw) return raw;
  return {
    id: raw.id || '',
    name: raw.name || '',
    nameHi: raw.nameHi || raw.name_hi || raw.name || '',
    phone: raw.phone || '',
    village: raw.village || '',
    villageHi: raw.villageHi || raw.village_hi || raw.village || '',
    district: raw.district || '',
    districtHi: raw.districtHi || raw.district_hi || raw.district || '',
    state: raw.state || 'Madhya Pradesh',
    stateHi: raw.stateHi || raw.state_hi || raw.state || 'मध्य प्रदेश',
    aadhaarLast4: raw.aadhaarLast4 || raw.aadhaar_last4 || (raw.phone ? raw.phone.slice(-4) : '1234'),
    bankName: raw.bankName || raw.bank_name || 'State Bank of India',
    accountLast4: raw.accountLast4 || raw.account_last4 || '4567',
    photo: raw.photo || '/images/farmers/farmer1.jpg',
    registeredAt: raw.registeredAt || raw.created_at || new Date().toISOString().split('T')[0],
    ...raw,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Farmer | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loginMethod, setLoginMethod] = useState<LoginMethod | null>(null);

  // Load saved session on initial mount
  useEffect(() => {
    async function initSession() {
      try {
        const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
        const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);

        if (savedToken) {
          setToken(savedToken);
          // Attempt to fetch profile from API
          const res = await apiClient<{ farmer: Farmer }>('/farmers/me');
          if (res.success && res.data?.farmer) {
            const normalized = normalizeFarmer(res.data.farmer);
            setUser(normalized);
            setIsAuthenticated(true);
            setLoginMethod('mobile');
            setIsLoading(false);
            return;
          }
        }

        if (savedAuth) {
          const parsed = JSON.parse(savedAuth);
          if (parsed?.user) {
            setUser(normalizeFarmer(parsed.user));
            setIsAuthenticated(true);
            setLoginMethod(parsed.loginMethod || 'mobile');
          }
        }
      } catch (e) {
        console.warn('Notice while restoring session:', e);
      } finally {
        setIsLoading(false);
      }
    }

    initSession();
  }, []);

  const sendOtp = async (identifier: string, method: LoginMethod = 'mobile') => {
    const res = await apiClient<{ simulatedOtp?: string; message?: string }>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier, method }),
    });

    if (res.success) {
      return {
        success: true,
        simulatedOtp: res.data?.simulatedOtp,
        message: res.message || res.data?.message,
      };
    }

    // Graceful offline fallback if backend service is unreachable
    if (res.error?.code === 'NETWORK_ERROR') {
      return {
        success: true,
        simulatedOtp: '1234',
        message: 'Backend offline: using demo OTP 1234',
      };
    }

    return { success: false, message: res.error?.message || 'Failed to send OTP' };
  };

  const verifyOtp = async (
    identifier: string,
    method: LoginMethod,
    otp: string,
    registrationData?: RegistrationData
  ) => {
    const res = await apiClient<{ token?: string; farmer?: Farmer; isNewFarmer?: boolean }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({
        identifier,
        method,
        otp,
        ...(registrationData || {})
      }),
    });

    if (res.success) {
      const authToken = res.data?.token;
      if (authToken) {
        setToken(authToken);
        localStorage.setItem(TOKEN_STORAGE_KEY, authToken);
      }

      if (res.data?.farmer) {
        const normalized = normalizeFarmer(res.data.farmer);
        setUser(normalized);
        setIsAuthenticated(true);
        setLoginMethod(method);
        localStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify({ user: normalized, loginMethod: method })
        );
      } else if (authToken) {
        setIsAuthenticated(true);
        setLoginMethod(method);
      }
      return { success: true, message: res.message, isNewFarmer: res.data?.isNewFarmer };
    }

    // Graceful offline fallback if backend service is unreachable
    if (res.error?.code === 'NETWORK_ERROR') {
      login({
        identifier,
        method,
        otp,
        name: registrationData?.name,
        village: registrationData?.village,
        district: registrationData?.district,
      });
      return {
        success: true,
        message: 'Registered & logged in successfully (Offline/Demo Mode)',
        isNewFarmer: true,
      };
    }

    return { success: false, message: res.error?.message || 'OTP verification failed' };
  };

  const devLogin = async (uid: string = 'f1') => {
    const res = await apiClient<{ token: string }>('/auth/mock-token', {
      method: 'POST',
      body: JSON.stringify({ uid }),
    });

    if (res.success && res.data?.token) {
      const authToken = res.data.token;
      setToken(authToken);
      localStorage.setItem(TOKEN_STORAGE_KEY, authToken);

      // Fetch farmer profile
      const profRes = await apiClient<{ farmer: Farmer }>('/farmers/me');
      if (profRes.success && profRes.data?.farmer) {
        const normalized = normalizeFarmer(profRes.data.farmer);
        setUser(normalized);
        setIsAuthenticated(true);
        setLoginMethod('mobile');
        localStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify({ user: normalized, loginMethod: 'mobile' })
        );
        return true;
      }
    }

    // Fallback if dev token fails
    return login({ identifier: uid, method: 'farmerId' });
  };

  const login = ({
    identifier,
    method,
    name,
    village,
    district,
  }: {
    identifier: string;
    method: LoginMethod;
    otp?: string;
    name?: string;
    village?: string;
    district?: string;
  }): boolean => {
    let matchedFarmer = fallbackFarmers.find((f) => {
      if (method === 'mobile') return f.phone === identifier;
      if (method === 'aadhaar') return f.aadhaarLast4 === identifier.slice(-4);
      if (method === 'farmerId') return f.id.toLowerCase() === identifier.toLowerCase();
      return false;
    });

    if (!matchedFarmer) {
      const cleanName =
        name?.trim() || (method === 'mobile' ? `Kisan (${identifier.slice(-4)})` : 'Kisan Mitra');
      matchedFarmer = {
        id: `f_${Date.now()}`,
        name: cleanName,
        nameHi: cleanName,
        phone: method === 'mobile' ? identifier : '9876543210',
        village: village?.trim() || 'Rampur',
        villageHi: village?.trim() || 'रामपुर',
        district: district?.trim() || 'Bhopal',
        districtHi: district?.trim() || 'भोपाल',
        state: 'Madhya Pradesh',
        stateHi: 'मध्य प्रदेश',
        aadhaarLast4: method === 'aadhaar' ? identifier.slice(-4) : identifier.slice(-4) || '1234',
        bankName: 'State Bank of India',
        accountLast4: '4567',
        photo: '/images/farmers/farmer1.jpg',
        registeredAt: new Date().toISOString().split('T')[0],
      };
    }

    const mockToken = `mock-token-${matchedFarmer.id}`;
    setToken(mockToken);
    localStorage.setItem(TOKEN_STORAGE_KEY, mockToken);

    setUser(matchedFarmer);
    setIsAuthenticated(true);
    setLoginMethod(method);

    try {
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({
          user: matchedFarmer,
          loginMethod: method,
          timestamp: new Date().toISOString(),
        })
      );
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }

    return true;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setLoginMethod(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch (e) {}
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        loginMethod,
        token,
        sendOtp,
        verifyOtp,
        devLogin,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
