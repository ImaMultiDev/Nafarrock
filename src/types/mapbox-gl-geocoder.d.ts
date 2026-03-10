declare module "@mapbox/mapbox-gl-geocoder" {
  import type { Map } from "mapbox-gl";

  interface MapboxGeocoderOptions {
    accessToken: string;
    mapboxgl?: unknown;
    marker?: boolean | object;
    countries?: string;
    placeholder?: string;
    types?: string;
    [key: string]: unknown;
  }

  interface GeocoderResult {
    center: [number, number];
    place_name?: string;
    [key: string]: unknown;
  }

  class MapboxGeocoder {
    constructor(options: MapboxGeocoderOptions);
    onAdd(map: Map): HTMLElement;
    onRemove(): void;
    on(type: "result", callback: (e: { result: GeocoderResult }) => void): this;
  }

  export default MapboxGeocoder;
}
