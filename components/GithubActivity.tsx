type GithubEvent = {
  id: string;
  type: string;
  repo: { name: string; url: string };
  created_at: string;
  payload?: {
    commits?: Array<{ message: string }>;
    ref_type?: string;
    ref?: string;
  };
};

type DisplayItem = {
  id: string;
  action: string;
  repo: string;
  detail?: string;
  ago: string;
  href: string;
};

const USER = 'MarcusPFF';

function timeAgo(iso: string): string {
  const sec = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  const mon = Math.floor(day / 30);
  if (mon < 12) return `${mon}mo ago`;
  return `${Math.floor(mon / 12)}y ago`;
}

function describe(e: GithubEvent): DisplayItem | null {
  const baseHref = `https://github.com/${e.repo.name}`;
  const repoShort = e.repo.name.replace(`${USER}/`, '');
  const ago = timeAgo(e.created_at);

  switch (e.type) {
    case 'PushEvent': {
      const commits = e.payload?.commits ?? [];
      const detail = commits[commits.length - 1]?.message?.split('\n')[0]?.slice(0, 70);
      return {
        id: e.id,
        action: commits.length > 1 ? `Pushed ${commits.length} commits` : 'Pushed',
        repo: repoShort,
        detail,
        ago,
        href: baseHref,
      };
    }
    case 'CreateEvent': {
      const what = e.payload?.ref_type ?? 'something';
      return {
        id: e.id,
        action: `Created ${what}`,
        repo: repoShort,
        detail: e.payload?.ref ?? undefined,
        ago,
        href: baseHref,
      };
    }
    case 'PullRequestEvent':
      return { id: e.id, action: 'Opened PR', repo: repoShort, ago, href: baseHref };
    case 'WatchEvent':
      return { id: e.id, action: 'Starred', repo: repoShort, ago, href: baseHref };
    case 'ForkEvent':
      return { id: e.id, action: 'Forked', repo: repoShort, ago, href: baseHref };
    case 'PublicEvent':
      return { id: e.id, action: 'Made public', repo: repoShort, ago, href: baseHref };
    default:
      return null;
  }
}

async function fetchActivity(): Promise<DisplayItem[]> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${USER}/events/public?per_page=20`,
      { next: { revalidate: 3600 }, headers: { Accept: 'application/vnd.github+json' } },
    );
    if (!res.ok) return [];
    const events = (await res.json()) as GithubEvent[];
    return events.map(describe).filter((x): x is DisplayItem => !!x).slice(0, 5);
  } catch {
    return [];
  }
}

export default async function GithubActivity() {
  const items = await fetchActivity();
  if (items.length === 0) return null;

  return (
    <section className="py-20 px-6 md:px-24">
      <div className="max-w-4xl mx-auto">
        <p className="text-slate-500 font-medium tracking-[0.2em] uppercase text-xs mb-3">
          Activity
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2 tracking-tight">
          Recent on GitHub
        </h2>
        <p className="text-slate-500 font-light text-sm mb-10">Updates every hour</p>

        <div className="glass-card overflow-hidden">
          <ul>
            {items.map((item, idx) => (
              <li key={item.id} className={idx > 0 ? 'border-t border-white/40' : ''}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block px-5 md:px-7 py-4 hover:bg-white/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.15em] shrink-0 w-24 sm:w-28">
                      {item.ago}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-800">
                          {item.action}
                        </span>
                        <span className="text-slate-400 text-sm">·</span>
                        <span className="text-sm font-medium text-slate-600 truncate">
                          {item.repo}
                        </span>
                      </div>
                      {item.detail && (
                        <p className="text-xs text-slate-500 font-light mt-0.5 truncate">
                          {item.detail}
                        </p>
                      )}
                    </div>
                    <svg
                      className="w-4 h-4 text-slate-400 group-hover:text-slate-800 group-hover:translate-x-1 transition-all shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
