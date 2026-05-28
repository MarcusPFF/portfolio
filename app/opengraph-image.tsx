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
            'linear-gradient(135deg, #17151f 0%, #1f1b2a 58%, #281d27 100%)',
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
            color: '#7c7568',
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
              fontSize: 108,
              fontWeight: 500,
              color: '#f4eee0',
              letterSpacing: '-2px',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'baseline',
              fontFamily: 'serif',
            }}
          >
            Marcus Forsberg
            <span style={{ color: '#dc8a4a' }}>.</span>
          </div>
          <div
            style={{
              fontSize: 36,
              color: '#b3ab9b',
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
            color: '#7c7568',
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
