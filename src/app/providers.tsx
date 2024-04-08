"use client";

import { ChakraProvider } from "@chakra-ui/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider
      toastOptions={{
        defaultOptions: {
          position: "top-right",
          duration: 5000,
          isClosable: true,
        },
      }}
    >
      {children}
    </ChakraProvider>
  );
}
