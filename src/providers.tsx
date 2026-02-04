import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MapProvider } from "@vis.gl/react-maplibre";
import type { ReactNode } from "react";

interface IFProps {
	children: ReactNode;
}

const queryClient = new QueryClient();

export const Providers = ({ children }: IFProps) => {
	return (
		<MapProvider>
			<QueryClientProvider client={queryClient}>
				<HeroUIProvider disableAnimation disableRipple>
					<ToastProvider />
					{children}
				</HeroUIProvider>
			</QueryClientProvider>
		</MapProvider>
	);
};
