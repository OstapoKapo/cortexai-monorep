
"use client";

import { QueryClient, QueryClientProvider as QueryClientProviderBase } from "@tanstack/react-query";

const queryClient = new QueryClient();

export const QueryClientProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProviderBase client={queryClient}>
      {children}
    </QueryClientProviderBase>
  );
}