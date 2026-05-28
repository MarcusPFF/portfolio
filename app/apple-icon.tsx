import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1a1822',
          color: '#f4eee0',
          fontSize: 130,
          fontWeight: 500,
          letterSpacing: '-4px',
          fontFamily: 'serif',
          fontStyle: 'normal',
        }}
      >
        M<span style={{ color: '#dc8a4a' }}>.</span>
      </div>
    ),
    { ...size },
  );
}
