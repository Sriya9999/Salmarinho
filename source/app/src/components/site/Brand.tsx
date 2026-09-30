/** The owner's logo, traced from the supplied artwork. Never re-typeset. */
export function BrandMark({ className, decorative = false }: { className?: string; decorative?: boolean }) {
  return (
    <img
      src="/assets/brand/mark.svg"
      alt={decorative ? "" : "Sal Marinho wave mark"}
      aria-hidden={decorative || undefined}
      className={className}
      width={96}
      height={96}
      decoding="async"
    />
  );
}

export function BrandWordmark({ className, decorative = false }: { className?: string; decorative?: boolean }) {
  return (
    <img
      src="/assets/brand/wordmark.svg"
      alt={decorative ? "" : "Sal Marinho"}
      aria-hidden={decorative || undefined}
      className={className}
      width={762}
      height={158}
      decoding="async"
    />
  );
}

/** Full lockup: wave mark, script wordmark and the Anjuna line, as on the owner's logo. */
export function BrandLockup({ className }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center ${className ?? ""}`}>
      <BrandMark decorative className="h-auto w-[38%]" />
      <BrandWordmark className="mt-[9%] h-auto w-full" />
      <img src="/assets/brand/anjuna.svg" alt="Anjuna" className="mt-[7%] h-auto w-[26%] opacity-80" width={214} height={64} />
    </div>
  );
}
