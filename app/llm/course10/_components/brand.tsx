export default function Brand() {
  return (
    <header className="border-b border-[#dad3c4] bg-[#f7f3ec]/95 backdrop-blur-sm sticky top-0 z-20">
      <div className="px-6 md:px-10 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#75695b]">
              E.G. · Anno 1457
            </p>
            <h1 className="display text-2xl md:text-3xl text-[#2a2723] leading-tight mt-0.5">
              Bryllupskoordinator
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-[#75695b]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3d4a3a]" />
            Demo
          </div>
        </div>
      </div>
    </header>
  );
}
