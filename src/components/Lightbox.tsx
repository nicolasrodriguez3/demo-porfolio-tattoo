import { useState, useEffect, useCallback, useRef } from 'react';

interface GalleryImage {
  src: string;
  title: string;
  slug: string;
  description: string;
  styles: string[];
  artist: string;
}

interface LightboxProps {
  items: GalleryImage[];
}

/**
 * Fullscreen lightbox island with keyboard navigation,
 * focus trapping, and View Transitions API fallback.
 */
export default function Lightbox({ items }: LightboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);
  const navigationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = items[currentIndex];

  // ── Open / Close ──────────────────────────────────────────

  const open = useCallback(
    (index: number) => {
      prevFocusRef.current = document.activeElement as HTMLElement;
      setCurrentIndex(index);

      if (typeof document !== 'undefined' && 'startViewTransition' in document) {
        (document as any).startViewTransition(() => {
          setIsOpen(true);
        });
      } else {
        setIsOpen(true);
      }
    },
    [],
  );

  const close = useCallback(() => {
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      (document as any).startViewTransition(() => {
        setIsOpen(false);
      });
    } else {
      setIsOpen(false);
    }

    // Restaurar foco al elemento que abrió el lightbox
    requestAnimationFrame(() => {
      prevFocusRef.current?.focus();
    });
  }, []);

  // ── Attach click handlers to gallery grid items ──────────

  useEffect(() => {
    const grid = document.querySelector('.gallery-grid');
    if (!grid) return;

    const handleClick = (e: Event) => {
      const target = (e.target as HTMLElement).closest('.gallery-grid-item') as HTMLElement | null;
      if (!target) return;

      const indexAttr = target.getAttribute('data-gallery-index');
      if (indexAttr !== null) {
        const index = parseInt(indexAttr, 10);
        if (!isNaN(index) && items[index]) {
          open(index);
        }
      }
    };

    // Usamos delegación de eventos en el contenedor del grid
    grid.addEventListener('click', handleClick);

    return () => {
      grid.removeEventListener('click', handleClick);
    };
  }, [items, open]);

  // ── Keyboard navigation ──────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }

      if (items.length <= 1) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        // Debounce rápido para evitar spam
        if (navigationTimerRef.current) return;

        setCurrentIndex((prev) => {
          // Buscar el siguiente item visible
          let next = prev;
          const allItems = document.querySelectorAll<HTMLElement>('.gallery-grid-item');
          let attempts = 0;
          do {
            next = (next + 1) % items.length;
            attempts++;
          } while (
            allItems[next]?.classList.contains('hidden') &&
            attempts < items.length
          );
          return next;
        });

        navigationTimerRef.current = setTimeout(() => {
          navigationTimerRef.current = null;
        }, 200);
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (navigationTimerRef.current) return;

        setCurrentIndex((prev) => {
          let prevIdx = prev;
          const allItems = document.querySelectorAll<HTMLElement>('.gallery-grid-item');
          let attempts = 0;
          do {
            prevIdx = (prevIdx - 1 + items.length) % items.length;
            attempts++;
          } while (
            allItems[prevIdx]?.classList.contains('hidden') &&
            attempts < items.length
          );
          return prevIdx;
        });

        navigationTimerRef.current = setTimeout(() => {
          navigationTimerRef.current = null;
        }, 200);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (navigationTimerRef.current) {
        clearTimeout(navigationTimerRef.current);
      }
    };
  }, [isOpen, items.length, close]);

  // ── Focus trapping ───────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    // Enfocar botón de cerrar al abrir
    requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusable = dialog.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    dialog.addEventListener('keydown', handleTab);

    return () => {
      dialog.removeEventListener('keydown', handleTab);
    };
  }, [isOpen]);

  // ── Body scroll lock ─────────────────────────────────────

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // ── Navegación manual ────────────────────────────────────

  const goNext = useCallback(() => {
    if (items.length <= 1) return;
    setCurrentIndex((prev) => {
      let next = prev;
      const allItems = document.querySelectorAll<HTMLElement>('.gallery-grid-item');
      let attempts = 0;
      do {
        next = (next + 1) % items.length;
        attempts++;
      } while (allItems[next]?.classList.contains('hidden') && attempts < items.length);
      return next;
    });
  }, [items.length]);

  const goPrev = useCallback(() => {
    if (items.length <= 1) return;
    setCurrentIndex((prev) => {
      let prevIdx = prev;
      const allItems = document.querySelectorAll<HTMLElement>('.gallery-grid-item');
      let attempts = 0;
      do {
        prevIdx = (prevIdx - 1 + items.length) % items.length;
        attempts++;
      } while (allItems[prevIdx]?.classList.contains('hidden') && attempts < items.length);
      return prevIdx;
    });
  }, [items.length]);

  // ── Solo 1 item visible ──────────────────────────────────

  const hasNavigation = items.length > 1;

  // ── Render ───────────────────────────────────────────────

  return (
    <>
      {/* Lightbox overlay — se renderiza siempre, visibility via CSS */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Visor de imágenes: ${current?.title ?? ''}`}
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/90 transition-opacity duration-300 ${
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={(e) => {
          // Cerrar si se hace clic en el backdrop (no la imagen ni botones)
          if (e.target === e.currentTarget) {
            close();
          }
        }}
      >
        {/* Close button */}
        <button
          ref={closeButtonRef}
          onClick={close}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-paper transition-colors hover:bg-copper md:right-6 md:top-6"
          aria-label="Cerrar visor"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-5 w-5"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Previous arrow */}
        {hasNavigation && (
          <button
            onClick={goPrev}
            className="absolute left-2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-paper/70 transition-colors hover:bg-black/60 hover:text-paper md:left-6"
            aria-label="Imagen anterior"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-6 w-6"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}

        {/* Image container */}
        <div className="flex max-h-[90vh] max-w-[95vw] flex-col items-center justify-center md:max-w-[85vw]">
          <img
            src={current?.src}
            alt={current?.title ?? ''}
            className="max-h-[80vh] w-auto max-w-full rounded-sm object-contain shadow-2xl"
            onError={(e) => {
              const img = e.currentTarget;
              img.style.display = 'none';
              const fallback = img.nextElementSibling as HTMLElement | null;
              if (fallback) {
                fallback.style.display = 'flex';
              }
            }}
          />
          {/* Imagen no disponible fallback */}
          <div
            className="hidden h-64 w-full items-center justify-center rounded-sm bg-charcoal text-paper/40"
            aria-hidden="true"
          >
            <div className="text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="mx-auto h-10 w-10"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <p className="mt-2 font-body text-sm">Imagen no disponible</p>
            </div>
          </div>

          {/* Metadata bar */}
          {current && (
            <div className="mt-4 flex w-full items-center justify-between rounded-sm bg-black/40 px-4 py-3 backdrop-blur-sm">
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-base font-bold italic text-paper">
                  {current.title}
                </p>
                <p className="font-body text-xs font-semibold uppercase tracking-widest text-copper">
                  {current.artist}
                  {current.styles.length > 0 && (
                    <> — {current.styles.join(', ')}</>
                  )}
                </p>
              </div>

              {/* Counter */}
              <span className="ml-4 shrink-0 font-body text-xs font-light text-paper/50">
                {currentIndex + 1} de {items.length}
              </span>
            </div>
          )}

          {/* Description */}
          {current?.description && (
            <p className="mt-2 max-w-lg self-start font-body text-sm font-light leading-relaxed text-paper/50">
              {current.description}
            </p>
          )}
        </div>

        {/* Next arrow */}
        {hasNavigation && (
          <button
            onClick={goNext}
            className="absolute right-2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-paper/70 transition-colors hover:bg-black/60 hover:text-paper md:right-6"
            aria-label="Siguiente imagen"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-6 w-6"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}
      </div>
    </>
  );
}
