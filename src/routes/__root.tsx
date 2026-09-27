import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import type { ReactNode } from "react";
import appCss from "../styles.css?url";
import { MaloomShell } from "../components/MaloomShell";
export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
 head:()=>({meta:[{charSet:"utf-8"},{name:"viewport",content:"width=device-width, initial-scale=1, viewport-fit=cover"},{name:"author",content:"Maloom"}],links:[{rel:"stylesheet",href:appCss},{rel:"preconnect",href:"https://fonts.googleapis.com"},{rel:"preconnect",href:"https://fonts.gstatic.com",crossOrigin:"anonymous"},{rel:"stylesheet",href:"https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap"},{rel:"icon",href:"/favicon.svg"}]}),
 shellComponent:({children}:{children:ReactNode})=><html lang="ar" dir="rtl"><head><HeadContent/></head><body>{children}<Scripts/></body></html>,
 component:()=>{const {queryClient}=Route.useRouteContext();return <QueryClientProvider client={queryClient}><MaloomShell><Outlet/></MaloomShell></QueryClientProvider>}
});
