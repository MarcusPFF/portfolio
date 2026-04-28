import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f0e6e4',
          color: '#0f172a',
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: '-2px',
          fontFamily: 'sans-serif',
        }}
      >
        M<span style={{ color: '#8b5cf6' }}>.</span>
      </div>
    ),
    { ...size },
  );
}
