/**
 * TypeScript Interfaces for the Curved Space Journey Map
 */

export interface FlightWaypoint {
  id: string;
  name: string;
  x: number; // Percentage (0 - 100)
  y: number; // Percentage (0 - 100)
  stopT: number; // Scroll progress milestone (0.0 to 1.0)
  isStation?: boolean;
  stationName?: string;
  dockSide?: 'left' | 'right';
  description?: string;
  badge?: string;
}

export interface FlightCoordinates {
  x: number; // 0 - 100%
  y: number; // 0 - 100%
  angleDeg: number; // Tangent angle in degrees for ship rotation
}

export interface CurvedFlightMapProps {
  /** Optional custom background image for space map (Image 3) */
  spaceBgUrl?: string;
  /** Optional custom background image for cyberpunk city destination (Image 2) */
  cityBgUrl?: string;
  /** Optional spaceship sprite URL (Image 1 transparent PNG) */
  shipSpriteUrl?: string;
  /** Custom waypoints if overriding defaults */
  customWaypoints?: FlightWaypoint[];
  /** Controlled progress (0 to 1). If omitted, connects to window scroll */
  progress?: number;
  /** Callback when ship arrives / docks at any station */
  onStationDock?: (station: FlightWaypoint) => void;
  /** Custom container class */
  className?: string;
}
