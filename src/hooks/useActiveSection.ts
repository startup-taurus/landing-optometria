'use client';

import { useEffect, useRef, useState } from 'react';

export function useActiveSection(ids: readonly string[]): string {
  const [active, setActive] = useState('');
  const ref = useRef(ids);

  useEffect(() => {
    const elements = ref.current
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      // Zone: from ~15% below the top of the viewport to 30% from the top.
      // When a section's top edge enters this band, it becomes active.
      { rootMargin: '-15% 0px -70% 0px', threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return active;
}
