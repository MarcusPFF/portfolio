type GithubUser = {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  location: string | null;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
};

async function fetchUser(user: string): Promise<GithubUser | null> {
  try {
    const res = await fetch(`https://api.github.com/users/${user}`, {
      next: { revalidate: 3600 },
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!res.ok) return null;
    return (await res.json()) as GithubUser;
  } catch {
    return null;
  }
}

export default async function GithubCard({
  user,
  imageSrc = '/portrait.jpg',
}: {
  user: string;
  imageSrc?: string;
}) {
  const data = await fetchUser(user);
  const href = data?.html_url ?? `https://github.com/${user}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open GitHub profile of ${user}`}
      className="group block w-full max-w-sm lg:max-w-none lg:h-full flex flex-col"
    >
      <div
        className="rounded-md transition-transform duration-300 group-hover:-translate-y-0.5"
        style={{
          width: '100%',
          aspectRatio: '4 / 5',
          backgroundColor: 'oklch(20.5% 0.028 280 / 0.55)',
          backgroundImage: `url(${imageSrc})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: '1px solid var(--line-strong)',
          boxShadow:
            'inset 0 1px 0 oklch(94% 0.022 82 / 0.04), 0 30px 60px -30px oklch(0% 0 0 / 0.55)',
        }}
      />

      <div className="mt-auto pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <span className="inline-flex items-center gap-1.5">
            <svg
              className="w-4 h-4"
              style={{ color: 'var(--bone-dim)' }}
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <span
              className="font-mono text-sm transition-colors group-hover:text-[color:var(--bone)]"
              style={{ color: 'var(--bone-dim)' }}
            >
              @{user}
            </span>
          </span>
          <svg
            className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            style={{ color: 'var(--bone-mute)' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 17L17 7M17 7H7M17 7V17"
            />
          </svg>
        </div>

        {data && (
          <p
            className="font-mono text-[11px] mt-1.5 tabular-nums"
            style={{ color: 'var(--bone-mute)' }}
          >
            {data.public_repos} repos · {data.followers} followers
            {data.location ? ` · ${data.location}` : ''}
          </p>
        )}
      </div>
    </a>
  );
}
