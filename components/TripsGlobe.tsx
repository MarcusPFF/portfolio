'use client';

import dynamic from 'next/dynamic';

const TripsGlobeInner = dynamic(() => import('./TripsGlobeInner'), {
  ssr: false,
  loading: () => (
    <div
      className="glass-card flex items-center justify-center text-slate-400 text-sm"
      style={{ height: 640 }}
    >
      Loading globe…
    </div>
  ),
});

export default TripsGlobeInner;
