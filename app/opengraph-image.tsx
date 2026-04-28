import { ImageResponse } from 'next/og';

export const alt = 'Marcus Forsberg — Fullstack Developer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background:
            'linear-gradient(135deg, #f0e6e4 0%, #ddd0e8 50%, #f5e0d8 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 28,
            color: '#94a3b8',
            letterSpacing: '6px',
            textTransform: 'uppercase',
            display: 'flex',
            fontWeight: 600,
          }}
        >
          Portfolio
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 140,
              fontWeight: 700,
              color: '#0f172a',
              letterSpacing: '-3px',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'baseline',
            }}
          >
            Marcus Forsberg
            <span style={{ color: '#8b5cf6' }}>.</span>
          </div>
          <div
            style={{
              fontSize: 36,
              color: '#64748b',
              marginTop: 32,
              fontWeight: 400,
              display: 'flex',
            }}
          >
            Fullstack Developer · Adventurer
          </div>
        </div>

        <div
          style={{
            fontSize: 22,
            color: '#94a3b8',
            display: 'flex',
            letterSpacing: '4px',
            textTransform: 'uppercase',
          }}
        >
          marcuspff.com
        </div>
      </div>
    ),
    { ...size },
  );
}
