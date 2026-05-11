'use client';

export default function DeleteModeButton({
  active,
  onToggle,
  itemCount,
}: {
  active: boolean;
  onToggle: () => void;
  itemCount: number;
}) {
  if (itemCount === 0 && !active) return null;
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors ${
        active
          ? 'bg-[#7a3327] text-[#f0ede2] hover:bg-[#6a2c22]'
          : 'border border-[#dad3c4] text-[#2a2723] hover:border-[#7a3327] hover:text-[#7a3327]'
      }`}
    >
      {active ? 'Færdig' : 'Slet'}
    </button>
  );
}
