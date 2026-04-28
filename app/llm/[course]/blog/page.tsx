import { ViewTransition } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { readFileSync } from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import GlassNav from '@/components/GlassNav';
import ChatWidget from '@/components/ChatWidget';
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
    description: (post.desc ?? post.subtitle).slice(0, 160),
  };
}

export default async function CourseBlogPage({ params }: { params: Promise<Params> }) {
  const { course } = await params;
  const post = blogPosts.find((c) => c.blogSlug === course);
  if (!post) notFound();

  const markdown = readBlogMarkdown(course);
  const empty = isEmpty(markdown);

  return (
    <>
      <GlassNav />

      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] bg-purple-300/20 rounded-full blur-3xl float-slow" />
        <div className="absolute top-[60%] right-[10%] w-[350px] h-[350px] bg-pink-300/20 rounded-full blur-3xl float-medium" />
        <div className="absolute top-[30%] right-[30%] w-[300px] h-[300px] bg-blue-300/15 rounded-full blur-3xl float-fast" />
        <div className="absolute bottom-[10%] left-[20%] w-[250px] h-[250px] bg-orange-200/15 rounded-full blur-3xl float-slow" />
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
                className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors"
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
                  <p className="text-slate-400 font-semibold tracking-[0.2em] uppercase text-[10px] mb-4">
                    Course blogs
                  </p>
                  <nav>
                    <ul className="flex flex-col gap-2.5 border-l border-slate-300/50 pl-3">
                      {blogPosts.map((c) => {
                        const isActive = c.blogSlug === course;
                        return (
                          <li key={c.blogSlug}>
                            {isActive ? (
                              <span
                                aria-current="page"
                                className="text-slate-900 font-semibold text-xs flex items-center gap-2"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-800 shrink-0" />
                                {c.title}
                              </span>
                            ) : (
                              <Link
                                href={`/llm/${c.blogSlug}/blog`}
                                transitionTypes={['quick']}
                                className="text-slate-600 hover:text-slate-900 font-medium transition-colors text-xs"
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
                <header
                  className={`glass-card p-6 md:p-10 overflow-hidden relative bg-gradient-to-br ${post.color}`}
                >
                  <p className="text-slate-500 font-medium tracking-widest uppercase text-[10px] mb-2">
                    Blog
                  </p>
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight mb-2">
                    {post.title}
                  </h1>
                  <p className="text-slate-600 font-light text-base mb-5">{post.subtitle}</p>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 glass-pill rounded-full text-[11px] text-slate-700 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </header>

                {empty ? (
                  <section className="mt-10">
                    <div className="rounded-[1.25rem] border-2 border-dashed border-slate-300/70 bg-white/20 p-8 text-center text-slate-400 text-sm font-medium">
                      Endnu intet blogindlæg. Skriv dit indhold i{' '}
                      <code className="text-slate-600">content/course-blogs/{course}.md</code> — det
                      rendres automatisk her ved næste build.
                    </div>
                  </section>
                ) : (
                  <section
                    className="mt-10 prose-slate text-slate-700 font-light leading-relaxed
                               [&_h1]:text-2xl [&_h1]:md:text-3xl [&_h1]:font-bold [&_h1]:text-slate-800 [&_h1]:tracking-tight [&_h1]:mt-10 [&_h1]:mb-3
                               [&_h2]:text-xl [&_h2]:md:text-2xl [&_h2]:font-bold [&_h2]:text-slate-800 [&_h2]:tracking-tight [&_h2]:mt-8 [&_h2]:mb-3
                               [&_h3]:text-lg [&_h3]:md:text-xl [&_h3]:font-semibold [&_h3]:text-slate-800 [&_h3]:tracking-tight [&_h3]:mt-6 [&_h3]:mb-2
                               [&_p]:my-3 [&_p]:text-sm
                               [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul_li]:mb-1 [&_ul_li]:text-sm
                               [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol_li]:mb-1 [&_ol_li]:text-sm
                               [&_a]:text-slate-900 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:opacity-70
                               [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:bg-slate-200/70 [&_code]:text-slate-800 [&_code]:text-xs [&_code]:font-mono
                               [&_pre]:my-4 [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:bg-slate-900 [&_pre]:text-slate-100 [&_pre]:overflow-x-auto [&_pre_code]:bg-transparent [&_pre_code]:text-slate-100 [&_pre_code]:p-0 [&_pre_code]:text-xs
                               [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-600 [&_blockquote]:my-4 [&_blockquote]:text-sm
                               [&_strong]:font-semibold [&_strong]:text-slate-800
                               [&_hr]:my-6 [&_hr]:border-slate-200/80
                               [&_table]:my-4 [&_table]:w-full [&_table]:text-sm [&_th]:text-left [&_th]:font-semibold [&_th]:px-3 [&_th]:py-2 [&_th]:border-b [&_th]:border-slate-300 [&_td]:px-3 [&_td]:py-2 [&_td]:border-b [&_td]:border-slate-200/60"
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
                  </section>
                )}
              </article>
            </div>
          </div>

          <footer className="py-12 mt-16 text-center text-slate-400 font-light text-sm">
            <p>© 2026 Marcus Forsberg</p>
          </footer>
        </main>
      </ViewTransition>

      <ChatWidget />
    </>
  );
}
