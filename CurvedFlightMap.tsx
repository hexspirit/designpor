import React, { useState, useEffect, useRef } from 'react';
import { CurvedFlightMapProps, FlightWaypoint } from './types';
import { 
  DEFAULT_FLIGHT_WAYPOINTS, 
  calculateFlightCoordinates, 
  buildCurvedSvgPathString 
} from './curvedTrajectory';

/**
 * CurvedFlightMap
 * Production-ready React component for scroll-driven space flight
 * Merging Space Voyage (Image 3) & Cyberpunk City Destination (Image 2)
 */
export const CurvedFlightMap: React.FC<CurvedFlightMapProps> = ({
  spaceBgUrl,
  cityBgUrl,
  shipSpriteUrl,
  customWaypoints,
  progress,
  onStationDock,
  className = '',
}) => {
  const waypoints = customWaypoints || DEFAULT_FLIGHT_WAYPOINTS;
  const [internalProgress, setInternalProgress] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // If progress prop is provided, use it; otherwise sync with window scroll
  const effectiveProgress = typeof progress === 'number' ? progress : internalProgress;

  useEffect(() => {
    if (typeof progress === 'number') return;

    const handleScroll = () => {
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalDist = el.offsetHeight - windowHeight;

      if (totalDist > 0) {
        const scrolled = -rect.top;
        const p = Math.max(0, Math.min(1, scrolled / totalDist));
        setInternalProgress(p);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [progress]);

  // Current ship position (x, y) & tilt rotation angle
  const shipPos = calculateFlightCoordinates(effectiveProgress, waypoints);

  // Check proximity to stations and trigger callback if provided
  useEffect(() => {
    if (!onStationDock) return;
    const closestStation = waypoints.find(
      w => w.isStation && Math.abs(w.stopT - effectiveProgress) < 0.03
    );
    if (closestStation) {
      onStationDock(closestStation);
    }
  }, [effectiveProgress, onStationDock, waypoints]);

  const svgPathD = buildCurvedSvgPathString(waypoints);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full max-w-4xl mx-auto min-h-[2800px] bg-slate-950 overflow-hidden select-none ${className}`}
      style={{ imageRendering: 'pixelated' }}
    >
      {/* ================= 1. BACKGROUND LAYERS ================= */}
      
      {/* SECTION A: UPPER SPACE MAP (IMAGE 3) */}
      <div className="absolute top-0 left-0 right-0 h-[1900px] overflow-hidden">
        {spaceBgUrl ? (
          <img 
            src={spaceBgUrl} 
            alt="Space Voyage Map" 
            className="w-full h-full object-cover object-top opacity-95" 
          />
        ) : (
          /* Default Space Theme if image url not provided */
          <div className="relative w-full h-full bg-[#08061a]">
            {/* Cosmic purple nebula & starfield */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/30 rounded-full blur-3xl pointer-events-none" />
            <div 
              className="absolute inset-0 opacity-75 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(1px 1px at 20px 30px, #ffffff, rgba(0,0,0,0)),
                                  radial-gradient(1.5px 1.5px at 140px 100px, #38bdf8, rgba(0,0,0,0)),
                                  radial-gradient(1px 1px at 280px 220px, #f472b6, rgba(0,0,0,0))`,
                backgroundSize: '300px 450px'
              }}
            />
          </div>
        )}
      </div>

      {/* SECTION B: LOWER CYBERPUNK MEGACITY (IMAGE 2) */}
      <div className="absolute top-[1850px] left-0 right-0 h-[950px] overflow-hidden">
        {cityBgUrl ? (
          <img 
            src={cityBgUrl} 
            alt="Cyberpunk City Destination" 
            className="w-full h-full object-cover object-top opacity-95" 
          />
        ) : (
          /* Default City Theme if image url not provided */
          <div className="relative w-full h-full bg-gradient-to-b from-[#08061a] via-[#0b172a] to-[#030914]">
            {/* Turquoise Moon */}
            <div className="absolute top-12 right-20 w-36 h-36 rounded-full bg-gradient-to-b from-teal-300 via-cyan-600 to-slate-950 border border-cyan-300 shadow-2xl shadow-cyan-900" />
            {/* Runway */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-6 py-2 rounded-xl bg-slate-950 border border-emerald-400 text-emerald-300 font-mono text-xs">
              PORT-01 RUNWAY
            </div>
          </div>
        )}
      </div>

      {/* ================= 2. SVG CURVED WINDING FLIGHT PATH ================= */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none z-20"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Neon outer glow */}
        <path
          d={svgPathD}
          fill="none"
          stroke="#06b6d4"
          strokeWidth="1.2"
          strokeDasharray="1.5 1.5"
          className="opacity-40 blur-[1px]"
        />
        {/* Core dashed line */}
        <path
          d={svgPathD}
          fill="none"
          stroke="#38bdf8"
          strokeWidth="0.6"
          strokeDasharray="1 1.2"
          className="drop-shadow-[0_0_4px_#38bdf8]"
        />
      </svg>

      {/* ================= 3. WAYPOINT DIAMONDS AT STATIONS ================= */}
      {waypoints.map((wp) => (
        <div
          key={wp.id}
          className="absolute z-25 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 group cursor-pointer"
          style={{ left: `${wp.x}%`, top: `${wp.y}%` }}
        >
          <div className={`w-3.5 h-3.5 rotate-45 border-2 flex items-center justify-center transition-transform group-hover:scale-125 ${
            wp.isStation ? 'border-amber-400 bg-amber-950' : 'border-cyan-400 bg-slate-950'
          }`}>
            <div className={`w-1 h-1 rounded-full ${wp.isStation ? 'bg-amber-300 animate-ping' : 'bg-cyan-200'}`} />
          </div>

          {/* Station Hover / Active Label */}
          {wp.isStation && (
            <div className={`absolute top-5 whitespace-nowrap bg-slate-900/90 border border-cyan-500/60 rounded px-2 py-0.5 text-[10px] font-mono text-cyan-300 shadow-lg ${
              wp.dockSide === 'left' ? 'right-4' : 'left-4'
            }`}>
              {wp.badge && <span className="font-bold text-amber-400 mr-1">[{wp.badge}]</span>}
              {wp.stationName || wp.name}
            </div>
          )}
        </div>
      ))}

      {/* ================= 4. SPACESHIP (FLYING & TILTING ALONG SPLINE) ================= */}
      <div
        className="absolute z-30 pointer-events-none transition-transform duration-75 ease-out flex flex-col items-center -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${shipPos.x}%`,
          top: `${shipPos.y}%`,
          transform: `translate(-50%, -50%) rotate(${shipPos.angleDeg}deg)`,
        }}
      >
        {shipSpriteUrl ? (
          <img 
            src={shipSpriteUrl} 
            alt="Spaceship" 
            className="w-16 h-16 object-contain"
            style={{ imageRendering: 'pixelated' }}
          />
        ) : (
          /* Default SVG Spaceship Sprite (Facing Down with Ion Flame) */
          <div className="relative flex flex-col items-center w-12 h-14">
            {/* Plasma thruster flame above ship (exhaust shoots backward) */}
            <div className="w-2 h-4 bg-gradient-to-t from-cyan-300 via-sky-400 to-transparent blur-[0.5px] animate-pulse -mb-1" />
            {/* Retro spaceship body */}
            <div className="w-8 h-10 bg-slate-100 border-2 border-slate-900 rounded-b-md relative flex justify-center shadow-md">
              <div className="w-2 h-4 bg-cyan-400 border border-slate-900 rounded-b mt-3" />
              <div className="w-2.5 h-1 bg-rose-500 absolute top-1" />
              <div className="w-1 h-4 bg-slate-700 absolute -left-1 top-4" />
              <div className="w-1 h-4 bg-slate-700 absolute -right-1 top-4" />
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
export default CurvedFlightMap;
