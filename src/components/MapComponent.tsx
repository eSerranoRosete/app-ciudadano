import { Alert, Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { Layer, Map, Marker, Source } from "@vis.gl/react-maplibre";
import { useEffect, useState } from "react";
import { useGeolocated } from "react-geolocated";
import { route3 } from "../mockData";

interface IFProps {}

export const MapComponent = ({}: IFProps) => {
	const [currIndex, setCurrIndex] = useState<number>(0);

	useEffect(() => {
		const t = setTimeout(() => {
			setCurrIndex((prev) => prev + 1);
		}, 1500);

		return () => clearTimeout(t);
	}, [currIndex]);

	const { coords } = useGeolocated({
		positionOptions: {
			enableHighAccuracy: true,
		},
		userDecisionTimeout: 5000,
	});

	return (
		<div>
			<p className="text-sm text-default-500 mb-2 mt-4">
				Se encontraron 2 recolectores en tu zona
			</p>
			<div className="w-full aspect-square rounded-xl overflow-hidden">
				<Map
					mapStyle="https://tiles.openfreemap.org/styles/positron"
					attributionControl={false}
					initialViewState={{
						latitude: 19.69453338162022,
						longitude: -99.22305361931404,
						zoom: 14,
					}}
				>
					{coords && (
						<Marker latitude={coords.latitude} longitude={coords.longitude} />
					)}

					<Marker
						latitude={route3[currIndex][1]}
						longitude={route3[currIndex][0]}
						anchor="bottom"
					>
						<Popover placement="top">
							<PopoverTrigger>
								<img src="/truck-marker.png" className="size-10" />
							</PopoverTrigger>
							<PopoverContent>
								<div className="px-1 py-2">
									<div className="text-small font-bold">Camión 001</div>
									<div className="text-sm">
										Horario: Lun, Vie <br /> Desde 10:00am
									</div>
								</div>
							</PopoverContent>
						</Popover>
					</Marker>

					<Source
						id={"ruta-test"}
						type="geojson"
						data={{
							type: "Feature",
							geometry: {
								type: "LineString",
								coordinates: route3,
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
				</Map>
			</div>
			<Alert
				title="Instrucciones:"
				description="Da click en un camión para ver mas detalles"
				color="warning"
				className="mt-2"
			/>
		</div>
	);
};
