import { useState } from "react";
import { Button } from "@ara/react";

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem"
      }}
    >
      <h1>Ara Showcase</h1>
      <p>버튼을 클릭해 상호작용을 확인하세요.</p>
      <div style={{ display: "flex", gap: "0.75rem" }}>
        <Button onClick={() => setCount((prev) => prev + 1)}>기본 버튼</Button>
        <Button variant="secondary" onClick={() => setCount(0)}>
          초기화
        </Button>
      </div>
      <p>현재 카운트: {count}</p>
    </div>
  );
}
