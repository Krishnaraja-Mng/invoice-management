import React, { createContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

type User = {
    id: string;
    name: string;
    email?: string | null;
    role?: string;
};

type AuthContextType = {
    user: User | null;
    token: string | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
    signUp: (name: string, email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
    signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    loading: true,
    signIn: async () => ({ ok: false, message: "not implemented" }),
    signUp: async () => ({ ok: false, message: "not implemented" }),
    signOut: async () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const restore = async () => {
            try {
                const [t, u] = await Promise.all([AsyncStorage.getItem("token"), AsyncStorage.getItem("user")]);
                if (t) setToken(t);
                if (u) setUser(JSON.parse(u));
            } catch (err) {
                console.warn("Auth restore error", err);
            } finally {
                setLoading(false);
            }
        };
        restore();
    }, []);

    const signIn = async (email: string, password: string) => {
        try {
            const resp = await api.post("/auth/login", { email, password });
            const data = resp.data;
            if (!data || !data.token) return { ok: false, message: "Invalid response from server" };

            await AsyncStorage.setItem("token", data.token);
            await AsyncStorage.setItem("user", JSON.stringify(data.user || null));
            setToken(data.token);
            setUser(data.user || null);
            return { ok: true };
        } catch (err: any) {
            const message = err?.response?.data?.message || err.message || "Login failed";
            return { ok: false, message };
        }
    };

    const signUp = async (name: string, email: string, password: string) => {
        try {
            const resp = await api.post("/auth/register", { name, email, password });
            const data = resp.data;
            if (!data || !data.token) return { ok: false, message: "Invalid response from server" };

            await AsyncStorage.setItem("token", data.token);
            await AsyncStorage.setItem("user", JSON.stringify(data.user || null));
            setToken(data.token);
            setUser(data.user || null);
            return { ok: true };
        } catch (err: any) {
            const message = err?.response?.data?.message || err.message || "Register failed";
            return { ok: false, message };
        }
    };

    const signOut = async () => {
        try {
            await AsyncStorage.removeItem("token");
            await AsyncStorage.removeItem("user");
        } catch (err) {
            // ignore
        } finally {
            setToken(null);
            setUser(null);
        }
    };

    const value = useMemo(
        () => ({
            user,
            token,
            loading,
            signIn,
            signUp,
            signOut,
        }),
        [user, token, loading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};