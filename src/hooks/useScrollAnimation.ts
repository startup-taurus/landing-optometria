'use client';

import { useEffect, useRef } from "react";

export function useScrollAnimation() {
  const ref = useRef<HTMLElement | null>(null);
  return ref;
}
