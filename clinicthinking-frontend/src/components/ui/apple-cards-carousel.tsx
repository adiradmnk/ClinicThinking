"use client";

import React, {
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
} from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

/* ───────────────────────────────────────────────────────────
   Types
─────────────────────────────────────────────────────────── */
export type CardData = {
  src: string;
  title: string;
  category: string;
  content: React.ReactNode;
};

/* ───────────────────────────────────────────────────────────
   Context — tracks which card is open
─────────────────────────────────────────────────────────── */
type CarouselContextType = {
  onCardClose: (index: number) => void;
  currentIndex: number;
};

const CarouselContext = createContext<CarouselContextType>({
  onCardClose: () => {},
  currentIndex: 0,
});

/* ───────────────────────────────────────────────────────────
   useOutsideClick
─────────────────────────────────────────────────────────── */
function useOutsideClick(
  ref: React.RefObject<HTMLElement | null>,
  callback: () => void
) {
  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback();
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [ref, callback]);
}

/* ───────────────────────────────────────────────────────────
   Carousel
─────────────────────────────────────────────────────────── */
export function Carousel({ items }: { items: React.ReactNode[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = () => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    checkScrollability();
  }, []);

  const scroll = (dir: "left" | "right") => {
    if (!containerRef.current) return;
    containerRef.current.scrollBy({
      left: dir === "left" ? -500 : 500,
      behavior: "smooth",
    });
  };

  const handleCardClose = (index: number) => {
    if (!containerRef.current) return;
    const cards = containerRef.current.querySelectorAll(".carousel-card");
    const card = cards[index] as HTMLElement;
    if (card) {
      const offset =
        card.offsetLeft -
        containerRef.current.offsetLeft -
        (containerRef.current.clientWidth - card.clientWidth) / 2;
      containerRef.current.scrollTo({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <CarouselContext.Provider value={{ onCardClose: handleCardClose, currentIndex }}>
      <div className="relative w-full">
        {/* Cards */}
        <div
          ref={containerRef}
          onScroll={checkScrollability}
          className="flex gap-4 overflow-x-scroll scroll-smooth pb-8 pt-4 px-4 md:px-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.1 * i, ease: "easeOut" } }}
              className="carousel-card flex-shrink-0"
            >
              {item}
            </motion.div>
          ))}
          {/* Trailing spacer */}
          <div className="flex-shrink-0 w-4 md:w-8" />
        </div>

        {/* Arrows */}
        <div className="flex justify-end gap-2 pr-4 md:pr-8 mt-2">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 disabled:opacity-30 transition-all"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 disabled:opacity-30 transition-all"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </CarouselContext.Provider>
  );
}

/* ───────────────────────────────────────────────────────────
   Card
─────────────────────────────────────────────────────────── */
export function Card({ card, index }: { card: CardData; index: number }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { onCardClose } = useContext(CarouselContext);

  useOutsideClick(containerRef, () => {
    if (open) {
      setOpen(false);
      onCardClose(index);
    }
  });

  // Prevent body scroll when modal open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [open]);

  return (
    <>
      {/* ── Expanded overlay ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              ref={containerRef}
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="relative bg-white dark:bg-neutral-900 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {/* Close button */}
              <button
                onClick={() => { setOpen(false); onCardClose(index); }}
                className="sticky top-4 ml-auto mr-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/10 hover:bg-black/20 transition-colors float-right z-10"
              >
                <X size={14} />
              </button>

              {/* Hero image */}
              <div className="relative h-56 w-full overflow-hidden rounded-t-3xl">
                <img
                  src={card.src}
                  alt={card.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-5">
                  <p className="text-[11px] text-white/70 uppercase tracking-widest font-semibold">{card.category}</p>
                  <h3 className="text-white text-lg font-bold leading-tight">{card.title}</h3>
                </div>
              </div>

              {/* Content */}
              <div className="px-5 py-5">
                {card.content}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Card thumbnail ── */}
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ y: -6 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 350, damping: 22 }}
        className="group relative flex-shrink-0 rounded-3xl overflow-hidden bg-neutral-100 cursor-pointer outline-none"
        style={{ width: "clamp(280px, 30vw, 420px)", height: "80vh" }}
      >
        <img
          src={card.src}
          alt={card.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

        {/* Text */}
        <div className="absolute bottom-0 inset-x-0 p-6 md:p-8 text-left">
          <p className="text-xs text-white/60 uppercase tracking-widest font-semibold mb-2">{card.category}</p>
          <h3 className="text-white text-xl md:text-2xl font-bold leading-snug">{card.title}</h3>
        </div>

        {/* Hover shine */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.06] bg-white transition-opacity duration-300 pointer-events-none" />
      </motion.button>
    </>
  );
}
