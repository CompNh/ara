import {
  lightProfile,
  darkProfile,
  densityCompact,
  densityComfortable,
  radiusSharp,
  radiusSoft,
  composeTheme,
  applyTheme,
} from "@ara/theme";
import React, { useEffect, useMemo, useState } from "react";
type Mode = "light" | "dark";
type Density = "default" | "compact" | "comfortable";
type Radius = "default" | "sharp" | "soft";

export default function App() {
  const [mode, setMode] = useState<Mode>("light");
  const [density, setDensity] = useState<Density>("default");
  const [radius, setRadius] = useState<Radius>("default");

  const themeVars = useMemo(() => {
    const pieces = [mode === "light" ? lightProfile : darkProfile];
    if (density === "compact") pieces.push(densityCompact);
    if (density === "comfortable") pieces.push(densityComfortable);
    if (radius === "sharp") pieces.push(radiusSharp);
    if (radius === "soft") pieces.push(radiusSoft);
    return composeTheme(...pieces);
  }, [mode, density, radius]);

  useEffect(() => {
    applyTheme(themeVars);
    // Debug: 원하는 값 vs 실제 적용값 비교
    const key = "--semantic-color-bg-raised";
    const desired = (themeVars as any)[key];
    const applied = getComputedStyle(document.documentElement)
      .getPropertyValue(key)
      .trim();
    console.log("[ThemeDebug]", { mode, density, radius, desired, applied });
  }, [themeVars]);

  return (
    <div className="wrap">
      <h1>Ara Docs Theme Toggle</h1>

      <div className="row">
        <label>Mode</label>
        <select value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>

        <label>Density</label>
        <select
          value={density}
          onChange={(e) => setDensity(e.target.value as Density)}
        >
          <option value="default">Default</option>
          <option value="compact">Compact</option>
          <option value="comfortable">Comfortable</option>
        </select>

        <label>Radius</label>
        <select
          value={radius}
          onChange={(e) => setRadius(e.target.value as Radius)}
        >
          <option value="default">Default</option>
          <option value="sharp">Sharp</option>
          <option value="soft">Soft</option>
        </select>
      </div>

      <div className="card">
        <h3>Preview Card</h3>
        <p>이 카드는 토큰 변수로 스타일이 적용됩니다.</p>
        <button className="btn">Primary Button</button>
      </div>
    </div>
  );
}
