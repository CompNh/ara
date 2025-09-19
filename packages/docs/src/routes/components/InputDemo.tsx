import * as React from 'react';
import { Input } from '@ara/react';

export default function InputDemo() {
  const [v, setV] = React.useState('');
  return (
    <main id="content">
      <h1>Input Demo</h1>

      <section aria-labelledby="sec-a11y">
        <h2 id="sec-a11y">기본/힌트/에러</h2>

        <div style={{ marginBottom: 16 }}>
          <Input id="email" label="이메일" placeholder="you@company.com" />
        </div>

        <div style={{ marginBottom: 16 }}>
          <Input label="이름" hint="실명 입력" />
        </div>

        <div style={{ marginBottom: 16 }}>
          <Input label="암호" type="password" error="8자 이상 입력하세요" />
        </div>

        <div style={{ marginBottom: 16 }}>
          <Input label="닉네임" value={v} onChange={(e) => setV(e.currentTarget.value)} />
          <p>
            입력값: <span data-testid="nick-value">{v}</span>
          </p>
        </div>
      </section>
    </main>
  );
}
