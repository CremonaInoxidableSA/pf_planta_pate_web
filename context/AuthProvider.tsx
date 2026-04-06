"use client";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { UserSession } from "@/lib/types";
import Cookies from "js-cookie";

const BYPASS_AUTH = false;

const MOCK_USER: UserSession = {
  id: 0,
  email: "dev@localhost.com",
  username: "developer",
  nombre: "Developer",
  apellido: "Mode",
  rol: "admin",
  habilitado: true,
  reporte: true,
};

interface AuthContextType {
  user: UserSession | null;
  email: string | null;
  username: string | null;
  nombre: string | null;
  apellido: string | null;
  rol: string | null;
  habilitado: boolean | null;
  reporte: boolean | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<ApiResponse>;
  register: (data: RegisterData) => Promise<ApiResponse>;
  logout: () => Promise<boolean>;
}

interface ApiResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  message?: string;
}

interface RegisterData {
  email: string;
  username: UserSession;
  nombre: string;
  apellido: string;
  rol: "admin" | "user";
  habilitado: boolean;
  reporte: boolean;
  loading: boolean;
}

const decodeToken = (t?: string) => {
  if (!t) return null;
  try {
    const parts = t.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1];
    const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(b64)
        .split("")
        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join(""),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const isTokenValid = (t?: string): boolean => {
  if (!t) return false;
  const payload = decodeToken(t);
  if (!payload || !payload.sub) return false;
  if (payload.exp && payload.exp * 1000 < Date.now()) return false;
  return true;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(
    BYPASS_AUTH ? MOCK_USER : null,
  );
  const [email, setEmail] = useState<string | null>(
    BYPASS_AUTH ? (MOCK_USER.email ?? null) : null,
  );
  const [username, setUsername] = useState<string | null>(
    BYPASS_AUTH ? (MOCK_USER.username ?? null) : null,
  );
  const [nombre, setNombre] = useState<string | null>(
    BYPASS_AUTH ? (MOCK_USER.nombre ?? null) : null,
  );
  const [apellido, setApellido] = useState<string | null>(
    BYPASS_AUTH ? (MOCK_USER.apellido ?? null) : null,
  );
  const [rol, setRol] = useState<string | null>(
    BYPASS_AUTH ? (MOCK_USER.rol ?? null) : null,
  );
  const [habilitado, setHabilitado] = useState<boolean | null>(
    BYPASS_AUTH ? !!MOCK_USER.habilitado : null,
  );
  const [reporte, setReporte] = useState<boolean | null>(
    BYPASS_AUTH ? !!MOCK_USER.reporte : null,
  );
  const [loading, setLoading] = useState(BYPASS_AUTH ? false : true);
  const router = useRouter();
  const pathname = usePathname();

  const [needBootstrap, setNeedBootstrap] = useState(false);

  const checkSession = useCallback(async () => {
    try {
      // 1. Verificar needs-setup (con cache en sessionStorage)
      const setupDone =
        typeof window !== "undefined" &&
        sessionStorage.getItem("setup_done") === "true";

      if (!setupDone) {
        const needsSetupRes = await fetch(`/api/needs-setup`);
        if (needsSetupRes.ok) {
          const needsSetupData = await needsSetupRes.json();
          if (needsSetupData.needs_setup === true) {
            setNeedBootstrap(true);
            setUser(null);
            setLoading(false);
            return;
          } else {
            setNeedBootstrap(false);
            if (typeof window !== "undefined") {
              sessionStorage.setItem("setup_done", "true");
            }
          }
        }
      } else {
        setNeedBootstrap(false);
      }

      // 2. Leer token y usuario de localStorage
      const token =
        (typeof window !== "undefined" &&
          localStorage.getItem("access_token")) ||
        undefined;

      let hydratedFromStorage = false;
      if (typeof window !== "undefined") {
        const storedUserRaw = localStorage.getItem("user");
        if (storedUserRaw) {
          const parsed = JSON.parse(storedUserRaw);
          setUser(parsed);
          hydratedFromStorage = true;
        }
      }

      // 3. Si tenemos token válido + usuario en storage, confiar en local y salir
      if (token && isTokenValid(token)) {
        if (hydratedFromStorage) {
          setLoading(false);
          return;
        }
        // Token válido pero sin user en storage: crear user mínimo del token
        const payload = decodeToken(token);
        if (payload && payload.sub) {
          setUser({
            username: payload.sub,
            rol: payload.rol ?? undefined,
          } as UserSession);
          setLoading(false);
          return;
        }
      }

      // 4. Sin token válido o sin datos locales → verificar con backend
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/proxy/auth/check`, {
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (res.ok) {
        let data: {
          success?: boolean;
          data?: { needBootstrap?: boolean; user?: unknown };
        } = {};
        try {
          data = await res.json();
        } catch {
          data = {};
        }

        if (data && data.success) {
          if (data.data && data.data.needBootstrap) {
            setNeedBootstrap(true);
            setUser(null);
            setLoading(false);
            return;
          }

          if (data.data && data.data.user) {
            setNeedBootstrap(false);
            const incomingUser = data.data.user;
            const normalized =
              Array.isArray(incomingUser) && incomingUser.length > 0
                ? incomingUser[0]
                : incomingUser;
            setUser(normalized);
            if (typeof window !== "undefined")
              localStorage.setItem("user", JSON.stringify(normalized));
            setLoading(false);
            return;
          }
        }
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!BYPASS_AUTH) {
      checkSession();
    }
  }, [checkSession]);

  useEffect(() => {
    if (!BYPASS_AUTH && pathname === "/login" && needBootstrap) {
      checkSession();
    }
  }, [pathname, needBootstrap, checkSession]);

  useEffect(() => {
    if (BYPASS_AUTH) {
      if (
        pathname === "/login" ||
        pathname === "/register" ||
        pathname === "/bootstrap"
      ) {
        router.push("/");
      }
      return;
    }
    if (!loading) {
      if (!pathname) {
        return;
      }

      const publicRoutes = [
        "/login",
        "/register",
        "/bootstrap",
        "/login/recuperacion",
        "/login/recuperacion/reset_pass",
      ];

      const isPublicRoute = publicRoutes.some((route) =>
        pathname.startsWith(route),
      );

      if (isPublicRoute) {
        return;
      }

      if (needBootstrap && pathname !== "/bootstrap") {
        router.push("/bootstrap");
        return;
      }

      if (!user && pathname !== "/") {
        router.push("/login");
      }

      if (user && (pathname === "/login" || pathname === "/register")) {
        router.push("/");
      }
    }
  }, [user, loading, needBootstrap, pathname, router]);

  useEffect(() => {
    if (user) {
      setEmail(user.email ?? null);
      setUsername(user.username ?? null);
      setNombre(user.nombre ?? null);
      setApellido(user.apellido ?? null);
      setRol(user.rol ?? null);
      setHabilitado(!!user.habilitado);
      setReporte(!!user.reporte);
    } else {
      setEmail(null);
      setUsername(null);
      setNombre(null);
      setApellido(null);
      setRol(null);
      setHabilitado(null);
      setReporte(null);
    }
  }, [user]);

  const login = async (
    username: string,
    password: string,
  ): Promise<ApiResponse> => {
    try {
      const body = { username, password };

      const response = await fetch(`/api/proxy/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });

      let data: {
        access_token?: string;
        token?: string;
        data?: { token?: string; access_token?: string; user?: unknown };
        user?: unknown;
        error?: string;
        message?: string;
      } = {};
      try {
        data = await response.json();
      } catch {
        if (!response.ok) {
          return {
            success: false,
            error: response.statusText || "Error en el login",
          };
        }
        return { success: false, error: "Respuesta inesperada del servidor" };
      }

      const token =
        data.access_token ??
        data.token ??
        data.data?.token ??
        data.data?.access_token;

      if (token) {
        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", token);
          Cookies.set("access_token", token);
        }

        const decodeToken = (t: string) => {
          try {
            const parts = t.split(".");
            if (parts.length < 2) return null;
            const payload = parts[1];
            const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
            const json = decodeURIComponent(
              atob(b64)
                .split("")
                .map(
                  (c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`,
                )
                .join(""),
            );
            return JSON.parse(json);
          } catch {
            return null;
          }
        };

        const payload = decodeToken(token);
        if (payload && payload.sub) {
          setUser({
            username: payload.sub,
            rol: payload.rol ?? undefined,
          } as UserSession);
          if (typeof window !== "undefined")
            localStorage.setItem(
              "user",
              JSON.stringify({
                username: payload.sub,
                rol: payload.rol ?? undefined,
                token,
              }),
            );
        }

        const incomingUser = data.data?.user ?? data.user;
        if (incomingUser) {
          const u = Array.isArray(incomingUser)
            ? incomingUser[0]
            : incomingUser;
          const userToStore = { ...(u || {}), token };
          setUser(userToStore);
          if (typeof window !== "undefined")
            localStorage.setItem("user", JSON.stringify(userToStore));
        }

        setNeedBootstrap(false);
        if (token) {
          router.push(`/?token=${encodeURIComponent(token)}`);
        } else {
          router.push("/");
        }

        return { success: true, data };
      }

      return {
        success: false,
        error: data?.error ?? data?.message ?? "Login fallido",
      };
    } catch {
      return { success: false, error: "Error de conexión" };
    }
  };

  const register = async (): Promise<ApiResponse> => {
    return {
      success: false,
      error: "Registro no disponible. Contacte al administrador.",
    };
  };

  const logout = async (): Promise<boolean> => {
    try {
      const res = await fetch(`/api/proxy/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      let data: { success?: boolean } = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("setup_done");
        Cookies.remove("access_token");
      }

      router.push("/login");

      return res.ok && (data.success ?? true);
    } catch {
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("setup_done");
      }
      router.push("/login");
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        email,
        username,
        nombre,
        apellido,
        habilitado,
        rol,
        reporte,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
