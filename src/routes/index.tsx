import { addToast, Button, Input, Select, SelectItem } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useLocalStorage } from "@uidotdev/usehooks";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { MapComponent } from "../components/MapComponent";
import { useState } from "react";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

const formSchema = z.object({
	cp: z.string().nonempty(),
});

function RouteComponent() {
	const [cp, setCp] = useLocalStorage<string>("app-codigo-postal", "");
	const [selectedRecolectorId, setSelectedRecolectorId] = useState<string>("");

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

	const getRecolectores = useMutation({
		mutationFn: async (coloniaId: string) => {
			setSelectedRecolectorId(coloniaId);
			const res = await fetch(`https://api.blossomai.workers.dev/data`);
            if (!res.ok) throw new Error("Error fetching devices");
            return await res.json();
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
							onSelectionChange={( keys ) => {
								const currentKey = Array.from(keys)[0] as string;
								currentKey && getRecolectores.mutate(currentKey);
							}}
							isLoading={getRecolectores.isPending}
						>
							{getRecolectores.data ? 
                        getRecolectores.data.map((item: any) => (
                            <SelectItem key={item.id} textValue={item.id}>
                                {item.id} - Ubicación actual
                            </SelectItem>
                        )) : 
                        // Fallback por si no han cargado los recolectores todavía
                        mutation.data.zip_codes.map((item: any) => (
                            <SelectItem key={item.id}>{item.d_asenta}</SelectItem>
                        ))
                    }
						</Select>
					)}

					{getRecolectores.data && <MapComponent recolectores={getRecolectores.data} selectedId={selectedRecolectorId} onRefresh={() => getRecolectores.mutate(selectedRecolectorId)} />}
				</div>
			</div>
		</>
	);
}
