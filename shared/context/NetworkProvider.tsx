import NetInfo from "@react-native-community/netinfo";
import { useRouter } from "expo-router";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export type NetworkStatus = "online" | "offline";

interface NetworkContextValue {
  status: NetworkStatus;
  isConnected: boolean;
  retry: () => void;
}

const NetworkContext = createContext<NetworkContextValue | undefined>(
  undefined
);

export const NetworkProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [status, setStatus] = useState<NetworkStatus>("online");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? true);
      setStatus(state.isConnected ? "online" : "offline");
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isConnected) {
      router.replace("/(utils)/no-internet");
    }
  }, [isConnected, router]);

  const retry = () => {
    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected ?? true);
      setStatus(state.isConnected ? "online" : "offline");
    });
  };

  return (
    <NetworkContext.Provider value={{ status, isConnected, retry }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context)
    throw new Error("useNetwork must be used within a NetworkProvider");
  return context;
};
