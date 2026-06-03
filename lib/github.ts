type GithubUser = {
  public_repos: number;
};

// Server-side public-repo count. Cached for an hour, and the URL + options
// match GithubCard's request so Next dedupes the two into one GitHub call.
// Returns null on any failure, so callers can fall back to static copy.
export async function getRepoCount(user: string): Promise<number | null> {
  try {
    const res = await fetch(`https://api.github.com/users/${user}`, {
      next: { revalidate: 3600 },
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as GithubUser;
    return data.public_repos ?? null;
  } catch {
    return null;
  }
}
