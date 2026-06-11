"use client";

import { useState, useEffect } from "react";

/**
 * Returns true when the viewport is narrower than `breakpoint` (default 768px).
 * Use to switch inline-style values for mobile, since inline styles can't use
 * CSS media queries. SSR renders desktop first, then corrects on mount.
 */
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return isMobile;
}
