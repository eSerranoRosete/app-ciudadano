import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

interface IFProps {
  children: ReactNode;
}

const queryClient = new QueryClient();

export const Providers = ({ children }: IFProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <HeroUIProvider disableAnimation disableRipple>
        <ToastProvider />
        {children}
      </HeroUIProvider>
    </QueryClientProvider>
  );
};
