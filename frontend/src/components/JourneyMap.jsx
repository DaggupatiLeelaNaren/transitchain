
import React, { useEffect, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  ZoomControl,
} from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  Navigation,
  Route,
  Sparkles,
} from 'lucide-react';

// --------------------------------------------------
// TRANSITCHAIN MAP MARKERS
// --------------------------------------------------

const createIcon = (background, label, size = 34) => {
  return L.divIcon({
    className: 'tc-map-marker',
    html: `
      <div style="
        width:${size}px;
        height:${size}px;
        border-radius:50%;
        background:${background};
        border:3px solid #ffffff;
        box-shadow:0 5px 16px rgba(43,24,74,.28);
        display:flex;
        align-items:center;
        justify-content:center;
        color:white;
        font-family:Arial,sans-serif;
        font-size:12px;
        font-weight:800;
      ">${label}</div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

const originIcon = createIcon('#059669', 'A', 38);
const destinationIcon = createIcon('#dc2626', 'B', 38);
const busIcon = createIcon('#0284c7', 'B');
const metroIcon = createIcon('#7c3aed', 'M');

// --------------------------------------------------
// MAP BOUNDS
// --------------------------------------------------

function MapBoundsUpdater({ coordinates }) {
  const map = useMap();

  useEffect(() => {
    if (!coordinates || coordinates.length === 0) return;

    const validCoordinates = coordinates.filter(
      (coord) =>
        Array.isArray(coord) &&
        coord.length >= 2 &&
        Number.isFinite(Number(coord[0])) &&
        Number.isFinite(Number(coord[1]))
    );

    if (validCoordinates.length === 0) return;

    if (validCoordinates.length === 1) {
      map.setView(validCoordinates[0], 14);
      return;
    }

    const bounds = L.latLngBounds(validCoordinates);

    map.fitBounds(bounds, {
      padding: [55, 55],
      maxZoom: 15,
      animate: true,
    });
  }, [coordinates, map]);

  return null;
}

// --------------------------------------------------
// MAP CONTENT
// --------------------------------------------------

export default function JourneyMap({
  alternative,
  height = '450px',
}) {
  const legs = alternative?.legs || [];

  const hasJourney = legs.length > 0;

  const validLegs = useMemo(() => {
    return legs.filter((leg) => {
      return (
        leg.from_coords &&
        leg.to_coords &&
        Number.isFinite(Number(leg.from_coords.lat)) &&
        Number.isFinite(Number(leg.from_coords.lon)) &&
        Number.isFinite(Number(leg.to_coords.lat)) &&
        Number.isFinite(Number(leg.to_coords.lon))
      );
    });
  }, [legs]);

  const originCoord = validLegs.length
    ? [
        Number(validLegs[0].from_coords.lat),
        Number(validLegs[0].from_coords.lon),
      ]
    : [17.4435, 78.3582];

  const lastLeg = validLegs.length
    ? validLegs[validLegs.length - 1]
    : null;

  const destinationCoord = lastLeg
    ? [
        Number(lastLeg.to_coords.lat),
        Number(lastLeg.to_coords.lon),
      ]
    : null;

  const renderedLegs = useMemo(() => {
    return validLegs.map((leg, index) => {
      const isWalk =
        leg.leg_type === 'walk' ||
        (leg.mode || '').toLowerCase() === 'walk';

      const isMetro =
        (leg.mode || '').toLowerCase() === 'metro';

      const coordinates =
        Array.isArray(leg.polyline) && leg.polyline.length > 0
          ? leg.polyline
              .filter(
                (point) =>
                  Array.isArray(point) &&
                  point.length >= 2 &&
                  Number.isFinite(Number(point[0])) &&
                  Number.isFinite(Number(point[1]))
              )
              .map((point) => [
                Number(point[0]),
                Number(point[1]),
              ])
          : [
              [
                Number(leg.from_coords.lat),
                Number(leg.from_coords.lon),
              ],
              [
                Number(leg.to_coords.lat),
                Number(leg.to_coords.lon),
              ],
            ];

      return {
        leg,
        coordinates,
        key: `journey-leg-${index}`,
        color: isWalk
          ? '#d97706'
          : isMetro
            ? '#7c3aed'
            : '#0284c7',
        dashArray: isWalk ? '7 9' : null,
        weight: isWalk ? 4 : 6,
      };
    });
  }, [validLegs]);

  const allCoordinates = useMemo(() => {
    const points = [];

    if (originCoord) points.push(originCoord);

    if (destinationCoord) points.push(destinationCoord);

    renderedLegs.forEach((leg) => {
      points.push(...leg.coordinates);
    });

    return points;
  }, [originCoord, destinationCoord, renderedLegs]);

  const formatLegTime = (time) => time || 'Not available';

  const mapCenter = originCoord;

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-violet-200/80 bg-[#eee8f8] shadow-inner"
      style={{ height }}
    >

      {/* Map */}
      <MapContainer
        center={mapCenter}
        zoom={13}
        scrollWheelZoom={false}
        zoomControl={false}
        className="w-full h-full"
        style={{
          width: '100%',
          height: '100%',
          background: '#eee8f8',
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ZoomControl position="bottomright" />

        {hasJourney && (
          <>
            <MapBoundsUpdater coordinates={allCoordinates} />

            {/* Origin marker */}
            <Marker
              position={originCoord}
              icon={originIcon}
            >
              <Popup>
                <div className="text-xs font-sans min-w-[130px]">
                  <p className="font-extrabold text-emerald-700 mb-1">
                    Journey origin
                  </p>

                  <p className="text-slate-600">
                    {validLegs[0]?.from_stop_name || 'Starting point'}
                  </p>
                </div>
              </Popup>
            </Marker>

            {/* Destination marker */}
            {destinationCoord && (
              <Marker
                position={destinationCoord}
                icon={destinationIcon}
              >
                <Popup>
                  <div className="text-xs font-sans min-w-[130px]">
                    <p className="font-extrabold text-red-600 mb-1">
                      Journey destination
                    </p>

                    <p className="text-slate-600">
                      {lastLeg?.to_stop_name || 'Destination'}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Transit stops */}
            {validLegs.map((leg, index) => {
              if (leg.leg_type !== 'transit') return null;

              const isMetro =
                (leg.mode || '').toLowerCase() === 'metro';

              const stopIcon = isMetro ? metroIcon : busIcon;

              return (
                <React.Fragment key={`transit-stops-${index}`}>
                  <Marker
                    position={[
                      Number(leg.from_coords.lat),
                      Number(leg.from_coords.lon),
                    ]}
                    icon={stopIcon}
                  >
                    <Popup>
                      <div className="text-xs font-sans min-w-[145px]">
                        <p className="font-extrabold text-violet-700 mb-1">
                          Boarding stop
                        </p>

                        <p className="font-semibold text-slate-700">
                          {leg.from_stop_name || 'Boarding point'}
                        </p>

                        <p className="text-slate-500 mt-1">
                          Departure: {formatLegTime(leg.departure_time)}
                        </p>

                        <p className="text-slate-500">
                          Mode: {leg.mode || 'Transit'}
                        </p>
                      </div>
                    </Popup>
                  </Marker>

                  <Marker
                    position={[
                      Number(leg.to_coords.lat),
                      Number(leg.to_coords.lon),
                    ]}
                    icon={stopIcon}
                  >
                    <Popup>
                      <div className="text-xs font-sans min-w-[145px]">
                        <p className="font-extrabold text-violet-700 mb-1">
                          Alighting stop
                        </p>

                        <p className="font-semibold text-slate-700">
                          {leg.to_stop_name || 'Alighting point'}
                        </p>

                        <p className="text-slate-500 mt-1">
                          Arrival: {formatLegTime(leg.arrival_time)}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                </React.Fragment>
              );
            })}

            {/* Route lines */}
            {renderedLegs.map((routeLeg) => (
              <Polyline
                key={routeLeg.key}
                positions={routeLeg.coordinates}
                pathOptions={{
                  color: routeLeg.color,
                  weight: routeLeg.weight,
                  opacity: 0.9,
                  dashArray: routeLeg.dashArray,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
            ))}
          </>
        )}
      </MapContainer>

      {/* Top map information */}
      <div className="absolute top-3 left-3 right-3 z-[500] pointer-events-none">
        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/90 backdrop-blur-xl border border-white shadow-lg">
          <div className="w-7 h-7 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center">
            <Navigation className="w-4 h-4" />
          </div>

          <div>
            <p className="text-[10px] font-extrabold text-[#241638]">
              TransitChain Live Map
            </p>

            <p className="text-[9px] text-slate-500">
              {hasJourney
                ? 'Selected journey visualization'
                : 'Hyderabad map view'}
            </p>
          </div>
        </div>
      </div>

      {/* Empty map overlay */}
      {!hasJourney && (
        <div className="absolute inset-0 z-[400] pointer-events-none flex items-center justify-center">
          <div className="mx-5 rounded-2xl bg-white/90 backdrop-blur-xl border border-white shadow-xl p-5 text-center max-w-[260px]">
            <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-6 h-6" />
            </div>

            <p className="text-sm font-extrabold text-[#241638]">
              Your journey map
            </p>

            <p className="text-[11px] text-slate-500 mt-2 leading-5">
              Search for a journey to see its route, transit stops,
              and walking connections here.
            </p>

            <div className="flex justify-center mt-3">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-violet-600">
                <Sparkles className="w-3 h-3" />
                Ready to explore
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Map legend */}
      {hasJourney && (
        <div className="absolute bottom-3 left-3 z-[500] pointer-events-none">
          <div className="flex flex-wrap gap-2 rounded-xl bg-white/90 backdrop-blur-xl border border-white shadow-lg px-3 py-2">
            <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-600">
              <span className="w-2 h-2 rounded-full bg-sky-600" />
              Bus
            </span>

            <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-600">
              <span className="w-2 h-2 rounded-full bg-violet-600" />
              Metro
            </span>

            <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-600">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Walking
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
