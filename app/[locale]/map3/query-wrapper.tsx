"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactNode } from "react"

// Create a client
const queryClient = new QueryClient()

export default function QueryWrapper({children}:{children:ReactNode}){
    
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}