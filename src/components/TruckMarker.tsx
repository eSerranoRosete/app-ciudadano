import { cn } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { Marker } from "@vis.gl/react-maplibre";
import { useMemo } from "react";

interface IFProps {
  rutaId: string;
}
export const TruckMarker = (props: IFProps) => {
  const getRecolectores = useQuery({
    queryKey: ["recolectores"],
    queryFn: async () => {
      const res = await fetch(`https://api.blossomai.workers.dev/data`);
      if (!res.ok) throw new Error("Error fetching devices");
      return await res.json();
    },
    refetchInterval: 500,
  });

  const recolector = useMemo(() => {
    const found = getRecolectores.data?.find(
      (item: any) => item.rutaId === props.rutaId,
    );

    return found;
  }, [props.rutaId, getRecolectores.data]);

  if (!recolector) return;

  return (
    <Marker
      key={recolector.id}
      latitude={recolector.coords.latitude}
      longitude={recolector.coords.longitude}
    >
      <div
        className={cn(
          "size-4 rounded-full bg-emerald-500 relative",
          recolector.status === "inactive" && "bg-red-500",
        )}
      >
        <div
          className={cn(
            "absolute w-full h-full rounded-full bg-emerald-500 animate-ping scale-200",
            recolector.status === "inactive" && "animate-none opacity-0",
          )}
        ></div>
      </div>
    </Marker>
  );
};
