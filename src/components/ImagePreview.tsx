import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface ImagePreviewProps {
  src: string;
  alt?: string;
  className?: string;
}

export default function ImagePreview({ src, alt = "Preview", className = "" }: ImagePreviewProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={`cursor-pointer rounded-md object-cover hover:opacity-80 transition-opacity ${className}`}
        onClick={() => setOpen(true)}
      />
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-md p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute -top-3 -right-3 rounded-full bg-card p-1.5 shadow-md border border-border btn-press"
              >
                <X className="h-4 w-4" />
              </button>
              <img src={src} alt={alt} className="rounded-lg max-h-[85vh] object-contain" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
