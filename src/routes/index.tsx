import {
	Alert,
	addToast,
	Button,
	Input,
	Popover,
	PopoverContent,
	PopoverTrigger,
	Select,
	SelectItem,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Layer, Map, Marker, Source } from "@vis.gl/react-maplibre";
import { Fragment } from "react/jsx-runtime";
import { useGeolocated } from "react-geolocated";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { route1, route2 } from "../mockData";

const routes = [route1, route2];

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

const formSchema = z.object({
	cp: z.string().nonempty(),
});

function RouteComponent() {
	const { coords } = useGeolocated({
		positionOptions: {
			enableHighAccuracy: true,
		},
		userDecisionTimeout: 5000,
	});

	const form = useForm({
		resolver: zodResolver(formSchema),
	});

	const mutation = useMutation({
		mutationFn: async (data: z.infer<typeof formSchema>) => {
			const res = await fetch(
				`https://sepomex.icalialabs.com/api/v1/zip_codes?zip_code=${data.cp}`,
			);
			if (!res.ok) {
				addToast({
					color: "danger",
					variant: "solid",
					title: "Error",
					description: "Ha ocurrido un error en la consulta.",
				});
			}

			return await res.json();
		},
	});

	const getRecolectores = useMutation({
		mutationFn: async (_: string) => {
			await new Promise((r) => setTimeout(r, 2000));
			return { data: "yessir" };
		},
	});

	return (
		<>
			<header className="p-6 text-center bg-primary text-primary-foreground">
				<div>
					<p className="font-semibold text-2xl">Servicios Públicos</p>
					<p className="text-sm">
						Localiza el recolector de basura mas cerca de ti.
					</p>
				</div>
			</header>
			<div className="flex flex-col items-center justify-center container mx-auto p-3">
				<div className="w-full max-w-md flex flex-col gap-2">
					<form onSubmit={form.handleSubmit(mutation.mutate as any)}>
						<Controller
							control={form.control}
							name="cp"
							render={({ field, fieldState }) => (
								<Input
									{...field}
									label="Código Postal"
									size="sm"
									placeholder="Ej. 54719"
									description="Introduce tu código postal."
									isInvalid={!!fieldState.error}
									type="number"
									endContent={
										<Button
											size="sm"
											color="primary"
											isLoading={mutation.isPending}
											type="submit"
										>
											Buscar
										</Button>
									}
								/>
							)}
						/>
					</form>
					{mutation.data && (
						<Select
							size="sm"
							label="Colonia"
							description="Selecciona tu colonia"
							onSelectionChange={({ currentKey }) => {
								currentKey && getRecolectores.mutate(currentKey);
							}}
							isLoading={getRecolectores.isPending}
						>
							{mutation.data.zip_codes.map((item: any) => (
								<SelectItem key={item.id}>{item.d_asenta}</SelectItem>
							))}
						</Select>
					)}

					{getRecolectores.data && (
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
										<Marker
											latitude={coords.latitude}
											longitude={coords.longitude}
										/>
									)}
									{routes.map((route, index) => (
										<Fragment key={`route-key-${index}`}>
											<Marker
												latitude={route[5][1]}
												longitude={route[5][0]}
												anchor="bottom"
											>
												<Popover placement="top">
													<PopoverTrigger>
														<img src="/truck-marker.png" className="size-10" />
													</PopoverTrigger>
													<PopoverContent>
														<div className="px-1 py-2">
															<div className="text-small font-bold">
																Camión 001
															</div>
															<div className="text-sm">
																Horario: Lun, Vie <br /> Desde 10:00am
															</div>
														</div>
													</PopoverContent>
												</Popover>
											</Marker>

											<Source
												id={`route-${index}`}
												type="geojson"
												data={{
													type: "Feature",
													geometry: {
														type: "LineString",
														coordinates: route,
													},
													properties: {},
												}}
											/>

											<Layer
												id={`route-line=${index}`}
												type="line"
												source={`route-${index}`}
												paint={{
													"line-color": "#216FEE",
													"line-width": 6,
													"line-blur": 1.5,
												}}
											/>
										</Fragment>
									))}
								</Map>
							</div>
							<Alert
								title="Instrucciones:"
								description="Da click en un camión para ver mas detalles"
								color="warning"
								className="mt-2"
							/>
						</div>
					)}
				</div>
			</div>
		</>
	);
}
