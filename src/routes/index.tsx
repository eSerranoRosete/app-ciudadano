import { addToast, Button, Input, Select, SelectItem } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { MapComponent } from "../components/MapComponent";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

const formSchema = z.object({
	cp: z.string().nonempty(),
});

function RouteComponent() {
	const [cp, setCp] = useLocalStorage<string>("app-codigo-postal", "");
	const [colonia, setColonia] = useState<string>();

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			cp,
		},
	});

	const mutation = useMutation({
		mutationFn: async (data: z.infer<typeof formSchema>) => {
			setCp(data.cp); //Guardar a local storage

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

	const getRecolectores = useQuery({
		queryKey: ["recolectores"],
		queryFn: async () => {
			const res = await fetch(`https://api.blossomai.workers.dev/data`);
			if (!res.ok) throw new Error("Error fetching devices");
			return await res.json();
		},
		refetchInterval: 500,
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
							onSelectionChange={(val) => {
								setColonia(val.currentKey);
							}}
						>
							{mutation.data.zip_codes.map((item: any) => (
								<SelectItem key={item.id}>{item.d_asenta}</SelectItem>
							))}
						</Select>
					)}

					{getRecolectores.data && colonia && (
						<MapComponent recolectores={getRecolectores.data} />
					)}
				</div>
			</div>
		</>
	);
}
