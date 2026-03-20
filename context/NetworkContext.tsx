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
  camarasURL: string | null;
  mediaMTXBaseURL: string | null;
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
  camarasURL: null,
  mediaMTXBaseURL: null,
  isLoading: true,
});

export const useNetwork = () => useContext(NetworkContext);

export const NetworkProvider = ({ children }: NetworkProviderProps) => {
  const [clientIP, setClientIP] = useState<string | null>(null);
  const [targetAddress, setTargetAddress] = useState<string | null>(null);
  const [baseURL, setBaseURL] = useState<string | null>(null);
  const [loginURL, setLoginURL] = useState<string | null>(null);
  const [redirectURL, setRedirectURL] = useState<string | null>(null);
  const [camarasURL, setCamarasURL] = useState<string | null>(null);
  const [mediaMTXBaseURL, setMediaMTXBaseURL] = useState<string | null>(null);
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
        let camaras = null;
        let mediaMTX = null;

        if (hostname.startsWith("192.168.")) {
          const parts = hostname.split(".");

          if (parts.length === 4) {
            const frontIP = "192.168.20.150";

            base = `http://${frontIP}:3000`;
            login = `http://${frontIP}:3000`;
            redirect = `http://${frontIP}:3000`;
            camaras = `http://${hostname}:3000/camaras`;
            mediaMTX = `http://${hostname}:8888`;
            setClientIP(hostname);
            setTargetAddress(frontIP);
          }
        } else {
          // Para desarrollo local (localhost)
          base = "http://localhost:3000";
          login = "http://localhost:3000";
          redirect = "http://localhost:3000";
          camaras = "http://localhost:3000/camaras";
          mediaMTX = "http://localhost:8888";
          setClientIP(hostname);
          setTargetAddress("localhost");
        }

        setBaseURL(base);
        setLoginURL(login);
        setRedirectURL(redirect);
        setCamarasURL(camaras);
        setMediaMTXBaseURL(mediaMTX);

        // Guardar en sessionStorage
        if (base && login && redirect && camaras && mediaMTX) {
          sessionStorage.setItem("baseURL", base);
          sessionStorage.setItem("loginURL", login);
          sessionStorage.setItem("redirectURL", redirect);
          sessionStorage.setItem("camarasURL", camaras);
          sessionStorage.setItem("mediaMTXBaseURL", mediaMTX);
          sessionStorage.setItem("clientIP", hostname);
        }

        setIsLoading(false);
      }
    };

    // Intentar cargar desde sessionStorage primero
    if (typeof window !== "undefined") {
      const storedBase = sessionStorage.getItem("baseURL");
      const storedLogin = sessionStorage.getItem("loginURL");
      const storedRedirect = sessionStorage.getItem("redirectURL");
      const storedCamaras = sessionStorage.getItem("camarasURL");
      const storedMediaMTX = sessionStorage.getItem("mediaMTXBaseURL");
      const storedClientIP = sessionStorage.getItem("clientIP");
      const storedTargetAddress = sessionStorage.getItem("targetAddress");

      if (
        storedBase &&
        storedLogin &&
        storedRedirect &&
        storedCamaras &&
        storedMediaMTX
      ) {
        setBaseURL(storedBase); // eslint-disable-line react-hooks/set-state-in-effect
        setLoginURL(storedLogin);
        setRedirectURL(storedRedirect);
        setCamarasURL(storedCamaras);
        setMediaMTXBaseURL(storedMediaMTX);
        setClientIP(storedClientIP);
        setTargetAddress(storedTargetAddress);
        setIsLoading(false);
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
    camarasURL,
    mediaMTXBaseURL,
    isLoading,
  };

  return (
    <NetworkContext.Provider value={contextValue}>
      {children}
    </NetworkContext.Provider>
  );
};

export default NetworkContext;
