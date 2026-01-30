import {
	Alert,
	cn,
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@heroui/react";
import { Map, Marker } from "@vis.gl/react-maplibre";

interface Recolector {
	id: string;
	coords: {
		latitude: number;
		longitude: number;
	};
	status: "active" | "inactive";
}

interface IFProps {
	recolectores: Recolector[];
}

export const MapComponent = ({ recolectores }: IFProps) => {
	return (
		<div>
			<p className="text-sm text-default-500 mb-2 mt-4">
				Se encontraron {recolectores.length} recolectores en tu zona
			</p>
			<div className="w-full aspect-square rounded-xl overflow-hidden">
				<Map
					// Usamos key para forzar el re-renderizado cuando cambie el recolector y se mueva la cámara
					// key={activeRecolector?.id}
					mapStyle="https://tiles.openfreemap.org/styles/bright"
					attributionControl={false}
					initialViewState={{
						latitude: 19.6945,
						longitude: -99.223,
						zoom: 14,
					}}
				>
					{recolectores.map((recolector) => (
						<Marker
							key={recolector.id}
							latitude={recolector.coords.latitude}
							longitude={recolector.coords.longitude}
							anchor="bottom"
						>
							<Popover placement="top">
								<PopoverTrigger>
									<div className="relative cursor-pointer">
										{/* Círculo de color según status */}
										<div
											className={`size-5 z-10 rounded-full border-2 border-white ${recolector.status === "inactive" ? "bg-danger" : "bg-success"}`}
										/>
										<div
											className={cn(
												recolector.status === "active" &&
													"absolute w-full h-full bg-success top-0 left-0 rounded-full animate-ping",
											)}
										/>
									</div>
								</PopoverTrigger>
								<PopoverContent>
									<div className="px-1 py-2">
										<div className="text-small font-bold">
											Recolector: {recolector.id}
										</div>
										<div className="text-xs capitalize">
											Estado: {recolector.status}
										</div>
									</div>
								</PopoverContent>
							</Popover>
						</Marker>
					))}
				</Map>
			</div>
			<Alert
				title="Instrucciones:"
				description="El punto rojo indica inactivo y el verde activo."
				color="warning"
				className="mt-2"
			/>
		</div>
	);
};
