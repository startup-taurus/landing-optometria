'use client';

import { AnimatePresence, motion, useScroll } from "framer-motion";
import { useEffect, useState } from "react";
import { WHATSAPP_URL } from "@/lib/contact";

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      width="26"
      height="26"
      fill="currentColor"
      aria-hidden
    >
      <path d="M19.11 17.31c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.49-.9-.8-1.5-1.79-1.67-2.09-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.11 3.22 5.11 4.51.71.31 1.27.49 1.7.62.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.34zM16.04 5.33C10.18 5.33 5.42 10.1 5.42 15.96c0 1.99.55 3.85 1.5 5.45L5.33 26.67l5.41-1.55a10.6 10.6 0 0 0 5.3 1.4h.01c5.86 0 10.62-4.77 10.62-10.62 0-2.84-1.1-5.5-3.11-7.51a10.55 10.55 0 0 0-7.52-3.06zm0 19.4h-.01c-1.59 0-3.15-.43-4.51-1.24l-.32-.19-3.34.96.96-3.26-.21-.33a8.8 8.8 0 0 1-1.35-4.7c0-4.86 3.96-8.82 8.82-8.82 2.36 0 4.57.92 6.24 2.59a8.76 8.76 0 0 1 2.58 6.24c0 4.86-3.96 8.82-8.82 8.82z" />
    </svg>
  );
}

export default function FloatingWhatsApp() {
  const [visible, setVisible] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    return scrollY.on("change", (y) => setVisible(y > 400));
  }, [scrollY]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contactar por WhatsApp"
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          className="fixed bottom-5 right-5 z-50 flex items-center justify-center w-14 h-14 rounded-full text-white shadow-[0_10px_30px_rgba(37,211,102,0.4)]"
          style={{ background: "#25D366" }}
        >
          <WhatsAppIcon />
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full"
            style={{ background: "#25D366" }}
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
        </motion.a>
      )}
    </AnimatePresence>
  );
}
