'use client';

export default function DeleteRowButton({
  onConfirm,
  label,
  disabled,
}: {
  onConfirm: () => void;
  label: string;
  disabled?: boolean;
}) {
  function handleClick() {
    const ok = confirm(`Slet "${label}"? Kan ikke fortrydes.`);
    if (!ok) return;
    onConfirm();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className="w-7 h-7 flex items-center justify-center rounded-full border border-[#c89a8e] text-[#7a3327] hover:bg-[#e9d4cd] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
      title="Slet"
      aria-label={`Slet ${label}`}
    >
      <span aria-hidden className="text-base leading-none">−</span>
    </button>
  );
}
