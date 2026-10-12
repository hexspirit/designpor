# 🚀 ماژول نقشه مسیر پرواز پیچ‌دار سفینه فضایی (Curved Space Flight Map)

این ماژول برای پیاده‌سازی **مسیر پرواز غیرخطی و منحنی سفینه فضایی** در امتداد اسکرول سایت طراحی شده است که در طول مسیر از اعماق فضا (عکس شماره ۳) شروع شده، کنار ایستگاه‌ها توقف می‌کند و در نهایت وارد کلان‌شهر سایبرپانک (عکس شماره ۲) می‌شود.

---

## 📁 ساختار فایل‌های این پکیج

```text
flight-map-module/
├── CurvedFlightMap.tsx       # کامپوننت اصلی React برای رندر نقشه، پس‌زمینه، خط مسیر و سفینه
├── curvedTrajectory.ts       # توابع ریاضی اسپلاین (Catmull-Rom)، زاویه چرخش تانژانت و مختصات ایستگاه‌ها
├── types.ts                  # تایپ‌ها و اینترفیس‌های کامل TypeScript
└── README.md                 # راهنمای فنی پیاده‌سازی و یکپارچه‌سازی (همین فایل)
```

---

## ✨ ویژگی‌های کلیدی برای برنامه‌نویس

1. **مسیر منحنی و مارپیچ (S-Curve Winding Trajectory):** برخلاف خطوط عمودی ساده، سفینه روی یک مسیر نرم هلالی حرکت می‌کند.
2. **چرخش خودکار متناسب با زاویه مسیر (Dynamic Tangent Rotation):** زاویه سفینه (`angleDeg`) بر اساس مشتق اول مسیر محاسبه می‌شود تا نوک سفینه دقیقاً در امتداد جهت حرکت قرار گیرد.
3. **توقف دقیق مماس بر سکوی ایستگاه‌ها (Precision Docking):** ایستگاه‌های ۱، ۲، ۳ و مقصد نهایی مختصات اختصاصی (`stopT`) دارند و سفینه مماس با گیت ورودی آن‌ها می‌ایستد.
4. **پشتیبانی مستقیم از تصاویر عکس ۲ و ۳:** امکان پاس دادن آدرس تصاویر بک‌گراند فضا (`spaceBgUrl`)، مقصد شهر (`cityBgUrl`) و اسپریت سفینه (`shipSpriteUrl`).
5. **دو حالت کنترل:** 
   - **خودکار (Auto-Scroll):** در صورت عدم ارسال `progress`، کامپوننت خودش به اسکرول صفحه متصل می‌شود.
   - **کنترل‌شده (Controlled):** می‌توانید پراپ `progress` (بین ۰ تا ۱) را از یک اسکرولر نرم مثل Lenis، GSAP یا Framer Motion کنترل کنید.

---

## 🛠 نحوه استفاده (Quick Start)

### ۱. کپی کردن فایل‌ها
پوشه `flight-map-module` را مستقیماً داخل پوشه `components` یا `src` پروژه گیت‌هاب خود کپی کنید:

```bash
cp -r flight-map-module /path/to/hexspiritportfoilio/src/components/
```

### ۲. فراخوانی در صفحه یا کامپوننت

```tsx
import React, { useState } from 'react';
import { CurvedFlightMap } from './components/flight-map-module/CurvedFlightMap';
import { FlightWaypoint } from './components/flight-map-module/types';

export default function PortfolioPage() {
  const [activeStation, setActiveStation] = useState<FlightWaypoint | null>(null);

  const handleStationDock = (station: FlightWaypoint) => {
    console.log('سفینه به ایستگاه رسید:', station.name);
    setActiveStation(station);
  };

  return (
    <main className="min-h-screen bg-slate-950">
      <CurvedFlightMap
        // ۱. تصاویر اصلی (عکس ۲ و ۳)
        spaceBgUrl="/assets/images/space-map-3.png"       // عکس شماره ۳ (فضا و ایستگاه‌ها)
        cityBgUrl="/assets/images/cyberpunk-city-2.jpg"   // عکس شماره ۲ (مقصد شهر سایبرپانک)
        
        // ۲. اسپریت سفینه با ترنسپرنت واقعی (عکس شماره ۱)
        shipSpriteUrl="/assets/images/spaceship-medium-96x96.png"

        // ۳. کال‌بک هنگام پهلوگیری در ایستگاه
        onStationDock={handleStationDock}
      />

      {/* پنجره یا پاپ‌آپ مشخصات پروژه در صورت رسیدن به ایستگاه */}
      {activeStation && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border border-cyan-400 p-4 rounded-xl text-white">
          <h3 className="font-bold">{activeStation.stationName}</h3>
          <p className="text-xs text-slate-400">{activeStation.description}</p>
        </div>
      )}
    </main>
  );
}
```

---

## ⚙️ توضیحات پراپ‌ها (Props Reference)

| پراپ (Prop) | نوع (Type) | پیش‌فرض | توضیحات |
| :--- | :--- | :--- | :--- |
| `spaceBgUrl` | `string` | `undefined` | آدرس تصویر نقشه فضا (عکس شماره ۳) |
| `cityBgUrl` | `string` | `undefined` | آدرس تصویر شهر سایبرپانک (عکس شماره ۲) |
| `shipSpriteUrl` | `string` | `undefined` | آدرس اسپریت شفاف سفینه (عکس شماره ۱) |
| `progress` | `number (0.0 to 1.0)` | خودکار با اسکرول | کنترل دستی میزان پیشرفت حرکت سفینه |
| `onStationDock` | `(station) => void` | `undefined` | تابعی که هنگام رسیدن سفینه به ایستگاه فراخوانی می‌شود |
| `customWaypoints` | `FlightWaypoint[]` | پیش‌فرض نقشه ۳ | امکان تغییر مختصات مسیر و نقاط توقف |
| `className` | `string` | `""` | کلاس‌های اضافی Tailwind برای کانتینر |

---

## 🧭 نحوه تغییر یا شخصی‌سازی ایستگاه‌ها (Waypoints)

اگر خواستید مختصات پیچ‌ها یا محل توقف ایستگاه‌ها را تغییر دهید، فایل `curvedTrajectory.ts` آرایه `DEFAULT_FLIGHT_WAYPOINTS` را در اختیار شما قرار می‌دهد:

```typescript
export const DEFAULT_FLIGHT_WAYPOINTS: FlightWaypoint[] = [
  { id: 'launch', x: 50, y: 3, stopT: 0.0, name: 'شروع' },
  { id: 'station-observatory', x: 62, y: 22, stopT: 0.24, isStation: true, stationName: 'ML Research' },
  { id: 'station-arcade', x: 64, y: 46, stopT: 0.49, isStation: true, stationName: 'Arcade Outpost' },
  { id: 'station-comms', x: 48, y: 71, stopT: 0.74, isStation: true, stationName: 'Comms Command' },
  { id: 'destination-city', x: 50, y: 94, stopT: 1.0, isStation: true, stationName: 'Cyberpunk Port' },
];
```
- `x` و `y` درصد موقعیت روی نقشه هستند (از ۰ تا ۱۰۰).
- `stopT` عددی بین ۰ تا ۱ است که نشان می‌دهد در چه درصدی از اسکرول، سفینه به آنجا می‌رسد.

---

## 🎨 استایل و رندر پیکسل‌آرت
برای اینکه تصاویر پیکسل‌آرت در رزولوشن‌های مختلف تار نشوند، استایل زیر در فایل `CurvedFlightMap.tsx` اعمال شده است:
```css
image-rendering: pixelated;
```
در صورتی که از Tailwind استفاده می‌کنید، نیازی به نصب پکیج خارجی اضافی وجود ندارد.
