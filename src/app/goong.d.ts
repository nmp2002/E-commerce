// goong.d.ts (ambient declaration)
declare global {
    interface Window {
      goong: any;
    }
  
    namespace goong {
      namespace maps {
        class Map {
          constructor(element: HTMLElement, options: { center: { lat: number, lng: number }, zoom: number, apiKey: string });
          setCenter(location: { lat: number, lng: number }): void;
          setZoom(zoom: number): void;
        }
  
        class Geocoder {
          constructor(options: { apiKey: string });
          geocode(request: { address: string }, callback: (results: any[], status: string) => void): void;
        }
  
        class Marker {
          constructor(options: { position: { lat: number, lng: number }, map: Map });
          // Signature for remove method (no implementation in the declaration file)
          remove(): void;
        }
      }
    }
  }
  
  export {};
  