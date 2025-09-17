import React from 'react';

export function App() {
  return (
    <>
      {/* 키보드 사용자용 Skip Link */}
      <a href="#content" className="skip-link">
        Skip to content
      </a>

      <main id="content" style={{ padding: 24 }}>
        <h1 data-testid="title">Ara Docs Smoke</h1>
        <p data-testid="desc">e2e 연결을 위한 최소 페이지</p>
        <button data-testid="cta">확인</button>
      </main>
    </>
  );
}
