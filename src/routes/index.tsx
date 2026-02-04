import { XIcon } from "@phosphor-icons/react";
import {
  addToast,
  Alert,
  Card,
  CardBody,
  cn,
  Select,
  SelectItem,
} from "@heroui/react";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useGeolocation } from "@uidotdev/usehooks";
import { LngLatBounds, LngLat } from "maplibre-gl";
import {
  Marker,
  Map as ReactMap,
  useMap,
  Source,
  Layer,
} from "@vis.gl/react-maplibre";
import { useEffect, useMemo, useState } from "react";
import { TruckMarker } from "../components/TruckMarker";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

let isFetched = false;

function RouteComponent() {
  const loc = useGeolocation();
  const [selected, setSelected] = useState<any | null>(null);

  const { reactMap } = useMap();

  const getColonias = useMutation({
    mutationFn: async (cp: string) => {
      const res = await fetch(
        `https://sepomex.icalialabs.com/api/v1/zip_codes?zip_code=${cp}`,
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

  useEffect(() => {
    (async () => {
      if (loc.latitude && loc.longitude && reactMap && !isFetched) {
        reactMap.flyTo({
          center: [loc.longitude, loc.latitude],
          zoom: 15,
          speed: 4,
        });

        const cp = await getPostalCodeFromCoords({
          latitude: loc.latitude,
          longitude: loc.longitude,
        });

        if (cp) {
          await getColonias.mutateAsync(cp);
          isFetched = true;
        }
      }
    })();
  }, [isFetched, loc.latitude, loc.longitude, reactMap]);

  const getRutas = useMutation({
    mutationFn: async (coloniaId: string) => {
      const res = await fetch(
        `https://api.orion7.com.mx/api/public/rutas?coloniaId=${coloniaId}`,
      );

      if (!res.ok) throw new Error("Error");

      return await res.json();
    },
  });

  const lineCoords: [number, number][] | null = useMemo(() => {
    if (selected) {
      const found = getRutas.data?.items.find(
        (item: any) => item.id === selected,
      );
      if (found) {
        return found.puntos?.map((p: any) => [p.lng, p.lat]);
      }

      return null;
    }
  }, [selected, getRutas.data]);

  useEffect(() => {
    if (lineCoords?.length && reactMap) {
      const bounds = new LngLatBounds();

      lineCoords.forEach(([lng, lat]) => {
        bounds.extend(new LngLat(lng, lat));
      });

      reactMap.fitBounds(bounds, {
        padding: 40,
        speed: 5,
      });
    }
  }, [lineCoords, reactMap]);

  return (
    <div className="w-full h-screen relative">
      <div className="w-full absolute p-2 top-0 left-0 z-10">
        <img className="w-32 mx-auto mb-2" src="/lerma-logo.svg" />
        {getColonias.data && (
          <Select
            onSelectionChange={(val) => {
              if (val.currentKey) {
                getRutas.mutate(val.currentKey);
              }
            }}
            className="shadow-xl"
            size="sm"
            label="Selecciona tu colonia"
            isLoading={getRutas.isPending}
          >
            {getColonias.data.zip_codes.map((item: any) => (
              <SelectItem key={item.id}>{item.d_asenta}</SelectItem>
            ))}
          </Select>
        )}
      </div>

      <ReactMap
        id="reactMap"
        mapStyle="https://tiles.openfreemap.org/styles/bright"
        attributionControl={false}
      >
        {loc.latitude && loc.longitude && (
          <Marker latitude={loc.latitude} longitude={loc.longitude} />
        )}

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

        {selected && <TruckMarker rutaId={selected} />}
      </ReactMap>
      {getRutas.data && (
        <div
          className={cn(
            "w-full absolute z-10 bottom-0 left-0 bg-white h-1/2 rounded-3-xl shadow-xl p-1",
            selected && "h-fit bg-transparent",
          )}
        >
          {!selected && (
            <p className="px-2 py-4">
              {getLabelFromCount(getRutas.data.total)}
            </p>
          )}
          {getRutas.data.items.map((item: any) => (
            <Card
              key={item.id}
              fullWidth
              className="relative"
              isPressable
              onPress={() => {
                setSelected(item.id);
              }}
            >
              {selected && (
                <XIcon
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected(null);
                  }}
                  className="absolute z-20 top-3 right-3"
                />
              )}
              <CardBody>
                <p className="text-lg font-medium mb-1">{item.nombre}</p>
                <p className="text-sm text-default-500">
                  Días de Operación: Lunes, Miércoles y Viernes
                </p>

                <p className="text-sm">
                  {item.colonias
                    .map((colonia: any) => colonia.nombre)
                    .join(", ")}
                </p>

                {selected && (
                  <Alert
                    color="primary"
                    className="mt-2"
                    title="Tiempo estimado: 15 minutos"
                    description="El estimado puede variar por diferentes factores."
                  ></Alert>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

async function getPostalCodeFromCoords(coords: {
  latitude: number;
  longitude: number;
}): Promise<string | undefined> {
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&key=AIzaSyC0aAV5gYRN0iyLN_dDn5dIJ-YJXfNHAfQ`,
  );

  if (!res.ok) {
    console.error("Unable to get Coords");
  }

  const data = await res.json();

  if (data.results.length) {
    const firstResult = data.results[0].address_components;
    const postalCode = firstResult.find((item: any) =>
      item.types.includes("postal_code"),
    );
    if (postalCode) return postalCode.short_name;
  }
}

function getLabelFromCount(count: number) {
  if (count === 0) return "No se encontraron rutas en tu área.";
  if (count === 1) return "Se encontó 1 ruta en tu área.";
  if (count > 1) return `Se encontraron ${count} rutas en tu área.`;
}
