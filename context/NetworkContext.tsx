"use client";

import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";

interface NetworkContextType {
  clientIP: string | null;
  targetAddress: string | null;
  baseURL: string | null;
  loginURL: string | null;
  redirectURL: string | null;
  isLoading: boolean;
}

interface NetworkProviderProps {
  children: ReactNode;
}

const NetworkContext = createContext<NetworkContextType>({
  clientIP: null,
  targetAddress: null,
  baseURL: null,
  loginURL: null,
  redirectURL: null,
  isLoading: true,
});

export const useNetwork = () => useContext(NetworkContext);

export const NetworkProvider = ({ children }: NetworkProviderProps) => {
  const [clientIP, setClientIP] = useState<string | null>(null);
  const [targetAddress, setTargetAddress] = useState<string | null>(null);
  const [baseURL, setBaseURL] = useState<string | null>(null);
  const [loginURL, setLoginURL] = useState<string | null>(null);
  const [redirectURL, setRedirectURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const determineNetworkConfig = () => {
      if (typeof window !== "undefined") {
        const currentURL = window.location.href;
        const url = new URL(currentURL);
        const hostname = url.hostname;

        let base = null;
        let login = null;
        let redirect = null;

        if (hostname.startsWith("192.168.")) {
          const parts = hostname.split(".");

          if (parts.length === 4) {
            const frontIP = "192.168.20.150";

            base = `http://${frontIP}:3000`;
            login = `http://${frontIP}:3000`;
            redirect = `http://${frontIP}:3000`;
            setClientIP(hostname);
            setTargetAddress(frontIP);
          }
        } else {
          base = "http://localhost:3000";
          login = "http://localhost:3000";
          redirect = "http://localhost:3000";
          setClientIP(hostname);
          setTargetAddress("localhost");
        }

        setBaseURL(base);
        setLoginURL(login);
        setRedirectURL(redirect);

        if (base && login && redirect) {
          sessionStorage.setItem("baseURL", base);
          sessionStorage.setItem("loginURL", login);
          sessionStorage.setItem("redirectURL", redirect);
          sessionStorage.setItem("clientIP", hostname);
        }

        setIsLoading(false);
      }
    };

    if (typeof window !== "undefined") {
      const storedBase = sessionStorage.getItem("baseURL");
      const storedLogin = sessionStorage.getItem("loginURL");
      const storedRedirect = sessionStorage.getItem("redirectURL");
      const storedClientIP = sessionStorage.getItem("clientIP");
      const storedTargetAddress = sessionStorage.getItem("targetAddress");

      if (storedBase && storedLogin && storedRedirect) {
        const timer = setTimeout(() => {
          setBaseURL(storedBase);
          setLoginURL(storedLogin);
          setRedirectURL(storedRedirect);
          setClientIP(storedClientIP);
          setTargetAddress(storedTargetAddress);
          setIsLoading(false);
        }, 0);
        return () => clearTimeout(timer);
      } else {
        determineNetworkConfig();
      }
    }
  }, []);

  const contextValue: NetworkContextType = {
    clientIP,
    targetAddress,
    baseURL,
    loginURL,
    redirectURL,
    isLoading,
  };

  return (
    <NetworkContext.Provider value={contextValue}>
      {children}
    </NetworkContext.Provider>
  );
};

export default NetworkContext;
