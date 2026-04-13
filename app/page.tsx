import GlassNav from '@/components/GlassNav';
import GlassHero from '@/components/GlassHero';
import GlassProjects from '@/components/GlassProjects';
import GlassSkills from '@/components/GlassSkills';
import GlassContact from '@/components/GlassContact';
import ChatWidget from '@/components/ChatWidget';

export default function Home() {
  return (
    <>
      <GlassNav />

      {/* Floating decorative orbs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] bg-purple-300/20 rounded-full blur-3xl float-slow" />
        <div className="absolute top-[60%] right-[10%] w-[350px] h-[350px] bg-pink-300/20 rounded-full blur-3xl float-medium" />
        <div className="absolute top-[30%] right-[30%] w-[300px] h-[300px] bg-blue-300/15 rounded-full blur-3xl float-fast" />
        <div className="absolute bottom-[10%] left-[20%] w-[250px] h-[250px] bg-orange-200/15 rounded-full blur-3xl float-slow" />
      </div>

      <main className="relative z-10">
        <GlassHero />
        <GlassProjects />
        <GlassSkills />
        <GlassContact />

        <footer className="py-12 text-center text-slate-400 font-light text-sm">
          <p>© 2026 Marcus Forsberg</p>
        </footer>
      </main>

      <ChatWidget />
    </>
  );
}
