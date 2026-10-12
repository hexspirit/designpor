/**
 * Mathematical Spline & Trajectory Calculator for Winding Space Flight
 * Computes Catmull-Rom / cubic interpolation and rotational tangent angles
 */

import { FlightWaypoint, FlightCoordinates } from './types';

export const DEFAULT_FLIGHT_WAYPOINTS: FlightWaypoint[] = [
  { 
    id: 'launch', 
    x: 50, 
    y: 3, 
    stopT: 0.0, 
    name: 'آغاز پرواز (Deep Space Launch)',
    badge: 'LAUNCH'
  },
  { 
    id: 'moon-curve', 
    x: 38, 
    y: 11, 
    stopT: 0.10, 
    name: 'مانور کنار ماه بنفش' 
  },
  { 
    id: 'station-observatory', 
    x: 62, 
    y: 22, 
    stopT: 0.24, 
    isStation: true, 
    stationName: 'ML Research Observatory', 
    dockSide: 'right', 
    name: 'ایستگاه ۱: رصدخانه یادگیری ماشین',
    badge: 'STATION 01',
    description: 'رصدخانه تحقیقاتی هوش مصنوعی و یادگیری ماشین'
  },
  { 
    id: 'asteroid-belt', 
    x: 35, 
    y: 34, 
    stopT: 0.36, 
    name: 'گذر از کمربند سیارک‌ها' 
  },
  { 
    id: 'station-arcade', 
    x: 64, 
    y: 46, 
    stopT: 0.49, 
    isStation: true, 
    stationName: 'Game Projects Arcade Outpost', 
    dockSide: 'right', 
    name: 'ایستگاه ۲: پایگاه بازی‌های آرکید',
    badge: 'STATION 02',
    description: 'پایگاه بازی‌های ویدیویی و تجربیات تعاملی رترو با تابلوی PLAY'
  },
  { 
    id: 'saturn-ring', 
    x: 34, 
    y: 58, 
    stopT: 0.62, 
    name: 'حلقه مداری سیاره زحل‌گون' 
  },
  { 
    id: 'station-comms', 
    x: 48, 
    y: 71, 
    stopT: 0.74, 
    isStation: true, 
    stationName: 'Communications Command', 
    dockSide: 'left', 
    name: 'ایستگاه ۳: فرماندهی مخابرات مداری',
    badge: 'STATION 03',
    description: 'مرکز رادیویی دوربرد با پنل‌های خورشیدی بزرگ آبی'
  },
  { 
    id: 'entry-canyon', 
    x: 38, 
    y: 83, 
    stopT: 0.86, 
    name: 'ورود به جو و دره آسمان‌خراش‌ها' 
  },
  { 
    id: 'destination-city', 
    x: 50, 
    y: 94, 
    stopT: 1.0, 
    isStation: true, 
    stationName: 'Cyberpunk Megacity Port', 
    name: 'مقصد نهایی: فرودگاه کلان‌شهر سایبرپانک',
    badge: 'DESTINATION',
    description: 'فرودگاه نهایی در کلان‌شهر سایبرپانک با ماه فیروزه‌ای و تابلوهای نئونی'
  }
];

/**
 * Calculates current position (x, y) and tangent rotation angle (angleDeg) at progress t (0 to 1)
 */
export function calculateFlightCoordinates(
  t: number, 
  waypoints: FlightWaypoint[] = DEFAULT_FLIGHT_WAYPOINTS
): FlightCoordinates {
  const clampedT = Math.max(0, Math.min(1, t));

  // Find segment
  let segIndex = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    if (clampedT >= waypoints[i].stopT && clampedT <= waypoints[i + 1].stopT) {
      segIndex = i;
      break;
    }
  }

  const p0 = waypoints[Math.max(0, segIndex - 1)];
  const p1 = waypoints[segIndex];
  const p2 = waypoints[Math.min(waypoints.length - 1, segIndex + 1)];
  const p3 = waypoints[Math.min(waypoints.length - 1, segIndex + 2)];

  const segRange = p2.stopT - p1.stopT;
  const localT = segRange > 0 ? (clampedT - p1.stopT) / segRange : 0;

  // Catmull-Rom spline basis
  const t2 = localT * localT;
  const t3 = t2 * localT;

  const f0 = -0.5 * t3 + t2 - 0.5 * localT;
  const f1 = 1.5 * t3 - 2.5 * t2 + 1.0;
  const f2 = -1.5 * t3 + 2.0 * t2 + 0.5 * localT;
  const f3 = 0.5 * t3 - 0.5 * t2;

  const x = p0.x * f0 + p1.x * f1 + p2.x * f2 + p3.x * f3;
  const y = p0.y * f0 + p1.y * f1 + p2.y * f2 + p3.y * f3;

  // First derivative for rotation tangent
  const df0 = -1.5 * t2 + 2 * localT - 0.5;
  const df1 = 4.5 * t2 - 5 * localT;
  const df2 = -4.5 * t2 + 4 * localT + 0.5;
  const df3 = 1.5 * t2 - localT;

  const dx = (p0.x * df0 + p1.x * df1 + p2.x * df2 + p3.x * df3);
  const dy = (p0.y * df0 + p1.y * df1 + p2.y * df2 + p3.y * df3) * 1.5;

  // Tangent angle where 0 degrees is facing DOWN (movement direction)
  const rad = Math.atan2(dx, dy);
  const angleDeg = (rad * 180) / Math.PI;

  return { x, y, angleDeg };
}

/**
 * Generates an SVG path string (d attribute) for rendering the glowing flight line
 */
export function buildCurvedSvgPathString(
  waypoints: FlightWaypoint[] = DEFAULT_FLIGHT_WAYPOINTS,
  steps = 120
): string {
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const { x, y } = calculateFlightCoordinates(t, waypoints);
    if (i === 0) {
      d += `M ${x} ${y} `;
    } else {
      d += `L ${x} ${y} `;
    }
  }
  return d;
}
