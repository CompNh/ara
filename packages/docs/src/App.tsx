import React from 'react';
import { Button } from '@ara/react';

function useQuery() {
  return new URLSearchParams(window.location.search);
}

function Home() {
  return (
    <main id="content" style={{ padding: 24 }}>
      <h1 data-testid="title">Ara Docs Smoke</h1>
      <p data-testid="desc">e2e 연결을 위한 최소 페이지</p>
      <a href="/?page=button">Button 데모로 이동</a>
    </main>
  );
}

function ButtonDemo() {
  const [count, setCount] = React.useState(0);
  return (
    <main id="content" style={{ padding: 24 }}>
      <h1 data-testid="title">Button Demo</h1>
      <p data-testid="desc">컴포넌트 단위 a11y/키보드 스모크</p>
      <div style={{ marginTop: 12 }}>
        <Button
          data-testid="btn"
          aria-label="카운터 증가"
          onClick={() => setCount((c) => c + 1)}
          className="ara-btn"
        >
          증가
        </Button>
        <span data-testid="count" style={{ marginLeft: 12 }}>
          count: {count}
        </span>
      </div>
    </main>
  );
}

export function App() {
  const q = useQuery();
  const page = q.get('page');
  return (
    <>
      {/* Skip link (7-3) */}
      <a href="#content" className="skip-link">
        Skip to content
      </a>
      {page === 'button' ? <ButtonDemo /> : <Home />}
      <style>{`
        .skip-link {
          position:absolute; left:-10000px; top:auto; width:1px; height:1px; overflow:hidden;
        }
        .skip-link:focus {
          position:static; width:auto; height:auto; padding:8px; background:#eee; outline:2px solid;
        }
        .ara-btn:focus-visible { outline: 2px solid #2684ff; outline-offset: 2px; }
      `}</style>
    </>
  );
}
