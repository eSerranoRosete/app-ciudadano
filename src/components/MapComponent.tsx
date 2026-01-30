import { Alert, Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { Map, Marker } from "@vis.gl/react-maplibre";
// import { Layer, Source } from "@vis.gl/react-maplibre";
import { useEffect } from "react";
// import { useGeolocated } from "react-geolocated";
// import { route3 } from "../mockData";

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
    selectedId?: string;
	onRefresh: () => void;
}

export const MapComponent = ({ recolectores, selectedId, onRefresh }: IFProps) => {
	useEffect(() => {
        const interval = setInterval(() => {
            onRefresh();
        }, 2000);

        return () => clearInterval(interval);
    }, [onRefresh]);
    // Buscamos el recolector seleccionado para centrar el mapa en él
    const activeRecolector = recolectores.find(r => r.id === selectedId) || recolectores[0];

    return (
        <div>
            <p className="text-sm text-default-500 mb-2 mt-4">
                Se encontraron {recolectores.length} recolectores en tu zona
            </p>
            <div className="w-full aspect-square rounded-xl overflow-hidden">
                <Map
                    // Usamos key para forzar el re-renderizado cuando cambie el recolector y se mueva la cámara
                    // key={activeRecolector?.id} 
                    mapStyle="https://tiles.openfreemap.org/styles/positron"
                    attributionControl={false}
                    initialViewState={{
                        latitude: activeRecolector?.coords.latitude || 19.6945,
                        longitude: activeRecolector?.coords.longitude || -99.2230,
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
                                        <div className={`absolute -top-1 -right-1 size-3 rounded-full border-2 border-white ${recolector.status === 'inactive' ? 'bg-danger' : 'bg-success'}`} />
                                        <img 
                                            src="/truck-marker.png" 
                                            className={`size-10 ${recolector.id === selectedId ? 'scale-125 transition-transform' : 'opacity-80'}`} 
                                        />
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent>
                                    <div className="px-1 py-2">
                                        <div className="text-small font-bold">Recolector: {recolector.id}</div>
                                        <div className="text-xs capitalize">Estado: {recolector.status}</div>
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
	