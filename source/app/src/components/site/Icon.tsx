import type { CSSProperties } from "react";

import type { IconName } from "@/lib/content/types";

/**
 * Glyphs from the generated icon set (one consistent line style). Rendered as a
 * CSS mask so they take the current text colour.
 */
export function Icon({ name, className, label }: { name: IconName; className?: string; label?: string }) {
  const style = { "--icon": `url(/assets/icons/${name}.png)` } as CSSProperties;
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`sm-icon ${className ?? ""}`}
      style={style}
    />
  );
}
