import { useState, useEffect, useCallback, useRef } from 'react';

interface GalleryFiltersProps {
  /** Estilos disponibles en la galería (extraídos del contenido) */
  availableStyles?: string[];
}

interface FilterDef {
  label: string;
  value: string; // '' para "Todos"
}

const DEFAULT_FILTERS: FilterDef[] = [
  { label: 'Todos', value: '' },
  { label: 'Blackwork', value: 'blackwork' },
  { label: 'Tradicional', value: 'tradicional' },
  { label: 'Realismo', value: 'realismo' },
  { label: 'Dotwork', value: 'dotwork' },
  { label: 'Letras', value: 'letras' },
  { label: 'Color', value: 'color' },
];

export default function GalleryFilters({ availableStyles }: GalleryFiltersProps) {
  const [activeFilter, setActiveFilter] = useState('');
  const noResultsRef = useRef<HTMLDivElement>(null);

  // Filtrar solo los filtros que tengan items coincidentes (a menos que estén activos)
  const filters = DEFAULT_FILTERS.filter((f) => {
    if (f.value === '') return true; // "Todos" siempre visible
    if (f.label === activeFilter) return true;
    if (!availableStyles) return true;
    return availableStyles.includes(f.value);
  });

  const applyFilter = useCallback((value: string, label: string) => {
    setActiveFilter(label);

    const gridItems = document.querySelectorAll<HTMLElement>('.gallery-grid-item');
    let visibleCount = 0;

    gridItems.forEach((item) => {
      if (value === '') {
        item.classList.remove('hidden');
        visibleCount++;
      } else {
        const itemStyles = item.getAttribute('data-styles')?.split(',').map((s) => s.trim()) ?? [];
        if (itemStyles.includes(value.toLowerCase())) {
          item.classList.remove('hidden');
          visibleCount++;
        } else {
          item.classList.add('hidden');
        }
      }
    });

    // Mostrar/ocultar mensaje sin resultados
    if (noResultsRef.current) {
      noResultsRef.current.classList.toggle('hidden', visibleCount > 0);
    }

    // Actualizar URL
    try {
      const url = new URL(window.location.href);
      if (value === '') {
        url.searchParams.delete('estilo');
      } else {
        url.searchParams.set('estilo', value);
      }
      window.history.replaceState({}, '', url.toString());
    } catch {
      // URL manipulation not available
    }
  }, []);

  // Leer filtro inicial desde URL
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const estilo = params.get('estilo');
      if (estilo) {
        const match = DEFAULT_FILTERS.find(
          (f) => f.value === estilo.toLowerCase()
        );
        if (match && match.value !== '') {
          // Aplicar con delay mínimo para que el DOM esté listo
          requestAnimationFrame(() => {
            applyFilter(match.value, match.label);
          });
        }
      }
    } catch {
      // URL params not available
    }
  }, [applyFilter]);

  return (
    <div className="mb-10">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtros por estilo">
        {filters.map((f) => {
          const isActive = activeFilter === f.label;
          return (
            <button
              key={f.value}
              onClick={() => applyFilter(f.value, f.label)}
              className={`cursor-pointer rounded-sm border px-4 py-2 font-body text-xs font-semibold uppercase tracking-widest no-underline transition-all ${
                isActive
                  ? 'border-copper bg-copper text-paper shadow-sm shadow-copper/20'
                  : 'border-stone-300 bg-transparent text-ink/60 hover:border-ink/30 hover:text-ink dark:border-warm-gray dark:text-paper/60 dark:hover:border-paper/30 dark:hover:text-paper'
              }`}
              aria-pressed={isActive}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Mensaje sin resultados */}
      <div
        ref={noResultsRef}
        className="mt-16 hidden text-center"
        role="status"
      >
        <p className="font-display text-2xl font-bold italic text-ink/30 dark:text-paper/30">
          Sin resultados
        </p>
        <p className="mt-2 font-body text-sm text-ink/40 dark:text-paper/40">
          No hay trabajos con ese estilo. Probá con otro filtro.
        </p>
      </div>
    </div>
  );
}
