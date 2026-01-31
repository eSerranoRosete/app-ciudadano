import { Alert, cn } from "@heroui/react";
import { Layer, Map, Marker, Source } from "@vis.gl/react-maplibre";
import { useMemo, useState } from "react";

interface Recolector {
	id: string;
	coords: {
		latitude: number;
		longitude: number;
	};
	rutaId: string;
	status: "active" | "inactive";
}

interface IFProps {
	rutas: any[];
	recolectores: Recolector[];
}

export const MapComponent = ({ recolectores, rutas }: IFProps) => {
	const [activeRuta, setActiveRuta] = useState<string | null>(null);

	const filtered = useMemo(() => {
		const rutasIds: string[] = rutas.map((item) => item.id);
		return recolectores.filter((rec) => rutasIds.includes(rec.rutaId));
	}, [recolectores, rutas]);

	const lineCoords: [number, number][] | null = useMemo(() => {
		if (activeRuta) {
			const found = rutas.find((item) => item.id === activeRuta);
			if (found) {
				return found.puntos?.map((p: any) => [p.lng, p.lat]);
			}

			return null;
		}
	}, [activeRuta]);

	return (
		<div>
			<p className="text-sm text-default-500 mb-2 mt-4">
				Se encontraron {rutas.length} rutas en tu zona
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
					{lineCoords && (
						<>
							<Source
								id={"ruta-test"}
								type="geojson"
								data={{
									type: "Feature",
									geometry: {
										type: "LineString",
										coordinates: lineCoords,
									},
									properties: {},
								}}
							/>

							<Layer
								id={"ruta-test-linea"}
								type="line"
								source={"ruta-test"}
								paint={{
									"line-color": "#216FEE",
									"line-width": 6,
									"line-blur": 1.5,
								}}
							/>
						</>
					)}

					{filtered.map((recolector) => (
						<Marker
							key={recolector.id}
							latitude={recolector.coords.latitude}
							longitude={recolector.coords.longitude}
							anchor="bottom"
							onClick={() => {
								setActiveRuta(recolector.rutaId);
							}}
						>
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
