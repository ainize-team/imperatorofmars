"use client";
import { PropsWithChildren, createContext, useEffect, useContext, useState } from "react";
import { custom } from "viem";
import { useWalletClient } from "wagmi";
import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";

interface AppContextType {
  client: StoryClient | undefined;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useStory = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useStory must be used within a AppProvider");
  }
  return context;
};

export default function AppProvider({ children }: PropsWithChildren) {
  const { data: wallet } = useWalletClient();
  const [client, setClient] = useState<StoryClient | undefined>(undefined);

  const setupStoryClient: () => StoryClient = () => {
    const config: StoryConfig = {
      wallet: wallet,
      transport: custom(wallet!.transport),
      chainId: "aeneid",
    };
    const client = StoryClient.newClient(config);
    return client;
  };

  useEffect(() => {
    if (!client && wallet?.account.address) {
      let newClient = setupStoryClient();
      setClient(newClient);
    }
  }, [wallet]);

  return <AppContext.Provider value={{ client }}>{children}</AppContext.Provider>;
}
