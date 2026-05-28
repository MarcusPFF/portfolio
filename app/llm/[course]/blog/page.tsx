import { ViewTransition } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { readFileSync } from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import GlassNav from '@/components/GlassNav';
import ChatWidgetLazy from '@/components/ChatWidgetLazy';
import { classes } from '@/lib/data';

type Params = { course: string };

const blogPosts = classes.filter((c) => c.blogSlug);
const blogDir = path.join(process.cwd(), 'content/course-blogs');

function readBlogMarkdown(slug: string): string {
  try {
    return readFileSync(path.join(blogDir, `${slug}.md`), 'utf-8');
  } catch {
    return '';
  }
}

// Strip HTML comments and check if any meaningful content remains.
function isEmpty(md: string): boolean {
  return md.replace(/<!--[\s\S]*?-->/g, '').trim().length === 0;
}

export function generateStaticParams(): Params[] {
  return blogPosts.map((c) => ({ course: c.blogSlug! }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { course } = await params;
  const post = blogPosts.find((c) => c.blogSlug === course);
  if (!post) return { title: 'Blog not found | Marcus Forsberg' };
  return {
    title: `${post.title} · Blog | Marcus Forsberg`,
    description: post.subtitle.slice(0, 160),
  };
}

export default async function CourseBlogPage({ params }: { params: Promise<Params> }) {
  const { course } = await params;
  const post = blogPosts.find((c) => c.blogSlug === course);
  if (!post) notFound();

  const markdown = readBlogMarkdown(course);
  const empty = isEmpty(markdown);

  return (
    <div className="theme-night">
      <GlassNav night />

      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div
          className="absolute top-[10%] -left-[6%] w-[520px] h-[520px] rounded-full blur-3xl float-slow"
          style={{ background: 'oklch(48% 0.008 280 / 0.22)' }}
        />
        <div
          className="absolute bottom-[4%] -right-[6%] w-[460px] h-[460px] rounded-full blur-3xl float-medium"
          style={{ background: 'oklch(42% 0.12 280 / 0.16)' }}
        />
      </div>

      <ViewTransition
        enter={{ 'nav-forward': 'nav-forward', 'nav-back': 'nav-back', default: 'none' }}
        exit={{ 'nav-forward': 'nav-forward', 'nav-back': 'nav-back', default: 'none' }}
        default="none"
      >
        <main className="relative z-10 pt-24 pb-12 px-6 md:px-10">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <Link
                href="/llm"
                transitionTypes={['nav-back']}
                className="inline-flex items-center gap-2 text-sm font-medium transition-colors text-[color:var(--bone-dim)] hover:text-[color:var(--bone)]"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Tilbage til LLM-kursus
              </Link>
            </div>

            <div className="flex flex-col md:flex-row gap-8 md:gap-12">
              <aside
                style={{ viewTransitionName: 'course-blog-sidebar' }}
                className="md:w-48 md:shrink-0"
              >
                <div className="md:sticky md:top-24">
                  <p className="eyebrow mb-4 text-[color:var(--bone-mute)]">Course blogs</p>
                  <nav>
                    <ul className="flex flex-col gap-2.5 border-l border-[color:var(--line)] pl-3">
                      {blogPosts.map((c) => {
                        const isActive = c.blogSlug === course;
                        return (
                          <li key={c.blogSlug}>
                            {isActive ? (
                              <span
                                aria-current="page"
                                className="font-semibold text-xs flex items-center gap-2 text-[color:var(--bone)]"
                              >
                                <span
                                  className="w-1.5 h-1.5 rounded-full shrink-0"
                                  style={{ background: 'var(--accent)' }}
                                />
                                {c.title}
                              </span>
                            ) : (
                              <Link
                                href={`/llm/${c.blogSlug}/blog`}
                                transitionTypes={['quick']}
                                className="font-medium transition-colors text-xs text-[color:var(--bone-dim)] hover:text-[color:var(--bone)]"
                              >
                                {c.title}
                              </Link>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </nav>
                </div>
              </aside>

              <article className="flex-1 min-w-0 max-w-2xl">
                <header className="ink-card relative overflow-hidden p-6 md:p-10">
                  <p className="font-mono text-[10px] tracking-[0.12em] mb-2 text-[color:var(--bone-mute)]">
                    Blog
                  </p>
                  <h1
                    className="font-display text-3xl md:text-4xl mb-2 text-[color:var(--bone)]"
                    style={{ letterSpacing: '-0.02em', fontWeight: 420 }}
                  >
                    {post.title}
                    <span style={{ color: 'var(--accent)' }}>.</span>
                  </h1>
                  <p className="font-light text-base mb-5 text-[color:var(--bone-dim)]">
                    {post.subtitle}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-full text-[11px] font-medium border text-[color:var(--bone-dim)]"
                        style={{ background: 'oklch(94% 0.022 82 / 0.05)', borderColor: 'var(--line)' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </header>

                {empty ? (
                  <section className="mt-10">
                    <div
                      className="rounded-[1.25rem] border-2 border-dashed p-8 text-center text-sm font-medium text-[color:var(--bone-mute)]"
                      style={{ borderColor: 'var(--line-strong)' }}
                    >
                      Endnu intet blogindlæg. Skriv dit indhold i{' '}
                      <code className="px-1 rounded text-[color:var(--bone)] bg-[oklch(94%_0.022_82_/_0.10)]">
                        content/course-blogs/{course}.md
                      </code>{' '}
                      — det rendres automatisk her ved næste build.
                    </div>
                  </section>
                ) : (
                  <section
                    className="mt-10 max-w-[65ch] text-[color:var(--bone)] font-light leading-[1.8]
                               [&_h1]:font-display [&_h1]:font-medium [&_h1]:text-2xl [&_h1]:md:text-3xl [&_h1]:tracking-tight [&_h1]:text-[color:var(--bone)] [&_h1]:mt-10 [&_h1]:mb-3
                               [&_h2]:font-display [&_h2]:font-medium [&_h2]:text-xl [&_h2]:md:text-2xl [&_h2]:tracking-tight [&_h2]:text-[color:var(--bone)] [&_h2]:mt-9 [&_h2]:mb-3
                               [&_h3]:font-display [&_h3]:text-lg [&_h3]:md:text-xl [&_h3]:tracking-tight [&_h3]:text-[color:var(--bone)] [&_h3]:mt-6 [&_h3]:mb-2
                               [&_p]:my-4 [&_p]:text-base [&_p]:leading-[1.8]
                               [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul_li]:mb-1.5 [&_ul_li]:text-base
                               [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol_li]:mb-1.5 [&_ol_li]:text-base
                               [&_a]:text-[color:var(--accent)] [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:opacity-70
                               [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[0.85em] [&_code]:font-mono [&_code]:text-[color:var(--bone)] [&_code]:bg-[oklch(94%_0.022_82_/_0.10)]
                               [&_pre]:my-5 [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-[color:var(--line)] [&_pre]:bg-[oklch(27%_0.034_280)] [&_pre]:text-[color:var(--bone)]
                               [&_pre_code]:bg-transparent [&_pre_code]:text-[color:var(--bone)] [&_pre_code]:p-0 [&_pre_code]:text-[0.85em]
                               [&_blockquote]:border-l-2 [&_blockquote]:border-[color:var(--line-strong)] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-[color:var(--bone-dim)] [&_blockquote]:my-5
                               [&_strong]:font-semibold [&_strong]:text-[color:var(--bone)]
                               [&_hr]:my-8 [&_hr]:border-[color:var(--line)]
                               [&_img]:my-5 [&_img]:rounded-[1rem] [&_img]:border [&_img]:border-[color:var(--line)]
                               [&_table]:my-4 [&_table]:w-full [&_table]:text-sm [&_th]:text-left [&_th]:font-semibold [&_th]:text-[color:var(--bone)] [&_th]:px-3 [&_th]:py-2 [&_th]:border-b [&_th]:border-[color:var(--line-strong)] [&_td]:text-[color:var(--bone-dim)] [&_td]:px-3 [&_td]:py-2 [&_td]:border-b [&_td]:border-[color:var(--line)]"
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
                  </section>
                )}
              </article>
            </div>
          </div>

          <footer className="py-12 mt-16 text-center font-mono text-[11px] text-[color:var(--bone-mute)]">
            <p>© {new Date().getFullYear()} Marcus Forsberg</p>
          </footer>
        </main>
      </ViewTransition>

      <ChatWidgetLazy />
    </div>
  );
}
